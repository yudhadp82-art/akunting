const express = require('express');
const router = express.Router();
const { Account, AccountType, JournalEntry, JournalLine } = require('../models');
const { generateVoucherNumber } = require('../utils/generators');

// Get all accounts (Chart of Accounts)
router.get('/accounts', async (req, res, next) => {
  try {
    const accounts = await Account.findAll({
      order: [['account_number', 'ASC']]
    });

    // Manually load account types
    for (const account of accounts) {
      if (account.account_type_id) {
        account.account_type = await AccountType.findByPk(account.account_type_id);
      }
    }

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    next(error);
  }
});

// Get account by ID
router.get('/accounts/:id', async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    if (account.account_type_id) {
      account.account_type = await AccountType.findByPk(account.account_type_id);
    }

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
});

// Create new account
router.post('/accounts', async (req, res, next) => {
  try {
    const account = await Account.create(req.body);

    res.status(201).json({
      success: true,
      data: account,
      message: 'Account created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get journal entries
router.get('/journal', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, is_posted, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (is_posted !== undefined) where.is_posted = is_posted === 'true';
    if (start_date && end_date) {
      where.transaction_date = {
        between: [new Date(start_date), new Date(end_date)]
      };
    }

    const { count, rows } = await JournalEntry.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['transaction_date', 'DESC'], ['created_at', 'DESC']]
    });

    // Manually load lines and accounts for each journal entry
    for (const row of rows) {
      row.lines = await JournalLine.findAll({ where: { journal_entry_id: row.id } });
      for (const line of row.lines) {
        if (line.account_id) {
          line.account = await Account.findByPk(line.account_id);
        }
      }
    }

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create journal entry
router.post('/journal', async (req, res, next) => {
  try {
    const { transaction_date, description, reference_type, reference_id, lines } = req.body;

    // Validate journal lines
    if (!lines || lines.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Journal entry must have at least 2 lines'
      });
    }

    // Calculate total debit and credit
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      totalDebit += parseFloat(line.debit || 0);
      totalCredit += parseFloat(line.credit || 0);
    }

    // Validate that debit equals credit
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        error: 'Total debit must equal total credit',
        details: {
          total_debit: totalDebit,
          total_credit: totalCredit
        }
      });
    }

    // Generate voucher number
    const voucher_number = generateVoucherNumber();

    // Create journal entry
    const journalEntry = await JournalEntry.create({
      voucher_number,
      transaction_date,
      description,
      reference_type,
      reference_id,
      is_posted: false
    });

    // Create journal lines
    const journalLines = [];
    for (const line of lines) {
      const createdLine = await JournalLine.create({
        journal_entry_id: journalEntry.id,
        account_id: line.account_id,
        debit: line.debit || 0,
        credit: line.credit || 0,
        description: line.description,
        member_id: line.member_id || null
      });
      journalLines.push(createdLine);
    }

    journalEntry.lines = journalLines;
    for (const line of journalEntry.lines) {
      if (line.account_id) {
        line.account = await Account.findByPk(line.account_id);
      }
    }

    res.status(201).json({
      success: true,
      data: journalEntry,
      message: 'Journal entry created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Post journal entry
router.post('/journal/:id/post', async (req, res, next) => {
  try {
    const journalEntry = await JournalEntry.findByPk(req.params.id);

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }

    if (journalEntry.is_posted) {
      return res.status(400).json({
        success: false,
        error: 'Journal entry already posted'
      });
    }

    // Load lines manually
    journalEntry.lines = await JournalLine.findAll({ where: { journal_entry_id: journalEntry.id } });

    // Update account balances
    for (const line of journalEntry.lines) {
      const account = await Account.findByPk(line.account_id);
      if (!account) continue;

      const accountType = await AccountType.findByPk(account.account_type_id);

      let balanceChange = 0;

      // Calculate balance change based on account type and debit/credit
      if (accountType.is_debit_balance) {
        // For asset and expense accounts
        balanceChange = parseFloat(line.debit) - parseFloat(line.credit);
      } else {
        // For liability, equity, and revenue accounts
        balanceChange = parseFloat(line.credit) - parseFloat(line.debit);
      }

      await account.update({
        balance: parseFloat(account.balance || 0) + balanceChange
      });
    }

    // Mark as posted
    await journalEntry.update({
      is_posted: true,
      posted_at: new Date()
    });

    res.json({
      success: true,
      data: journalEntry,
      message: 'Journal entry posted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete journal entry (only if not posted)
router.delete('/journal/:id', async (req, res, next) => {
  try {
    const journalEntry = await JournalEntry.findByPk(req.params.id);

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }

    if (journalEntry.is_posted) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete posted journal entry'
      });
    }

    // Delete lines first
    await JournalLine.destroy({ where: { journal_entry_id: journalEntry.id } });
    await JournalEntry.delete(journalEntry.id);

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get trial balance
router.get('/trial-balance', async (req, res, next) => {
  try {
    const { as_of } = req.query;
    const asOfDate = as_of ? new Date(as_of) : new Date();

    // Get all posted journal entries up to the specified date
    const postedEntries = await JournalEntry.findAll({
      where: {
        is_posted: true,
        transaction_date: { lte: asOfDate }
      }
    });

    // Calculate trial balance
    const trialBalance = {};

    for (const entry of postedEntries) {
      const lines = await JournalLine.findAll({ where: { journal_entry_id: entry.id } });
      for (const line of lines) {
        const accountId = line.account_id;

        if (!trialBalance[accountId]) {
          const account = await Account.findByPk(accountId);
          const accountType = await AccountType.findByPk(account.account_type_id);
          trialBalance[accountId] = {
            account_id: accountId,
            account_number: account.account_number,
            account_name: account.name,
            account_type: accountType.name,
            debit: 0,
            credit: 0
          };
        }

        trialBalance[accountId].debit += parseFloat(line.debit);
        trialBalance[accountId].credit += parseFloat(line.credit);
      }
    }

    const accounts = Object.values(trialBalance);
    const totalDebit = accounts.reduce((sum, a) => sum + a.debit, 0);
    const totalCredit = accounts.reduce((sum, a) => sum + a.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    res.json({
      success: true,
      data: accounts,
      summary: {
        total_debit: totalDebit,
        total_credit: totalCredit,
        is_balanced: isBalanced,
        difference: Math.abs(totalDebit - totalCredit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get general ledger for specific account
router.get('/ledger/:accountId', async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { start_date, end_date } = req.query;

    const account = await Account.findByPk(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    const accountType = await AccountType.findByPk(account.account_type_id);

    const where = { account_id: accountId };

    if (start_date || end_date) {
      const dateFilter = {};
      if (start_date) dateFilter.gte = new Date(start_date);
      if (end_date) dateFilter.lte = new Date(end_date);
      where.transaction_date = dateFilter;
    }

    const journalLines = await JournalLine.findAll({
      where,
      order: [['created_at', 'ASC']]
    });

    // Calculate running balance
    let runningBalance = 0;
    const ledger = [];
    
    for (const line of journalLines) {
      const entry = await JournalEntry.findByPk(line.journal_entry_id);
      if (!entry || !entry.is_posted) continue;

      const balanceChange = accountType.is_debit_balance
        ? parseFloat(line.debit) - parseFloat(line.credit)
        : parseFloat(line.credit) - parseFloat(line.debit);

      runningBalance += balanceChange;

      ledger.push({
        date: entry.transaction_date,
        voucher_number: entry.voucher_number,
        description: line.description || entry.description,
        debit: parseFloat(line.debit),
        credit: parseFloat(line.credit),
        balance: runningBalance
      });
    }

    res.json({
      success: true,
      data: {
        account: { ...account, account_type: accountType },
        ledger: ledger
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
