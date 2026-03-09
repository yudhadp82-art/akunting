const express = require('express');
const router = express.Router();
const { Account, AccountType, JournalEntry, JournalLine } = require('../models');
const { generateVoucherNumber } = require('../utils/generators');

// Get all accounts (Chart of Accounts)
router.get('/accounts', async (req, res, next) => {
  try {
    const accounts = await Account.findAll({
      include: [{ model: AccountType, as: 'account_type' }],
      order: [['account_number', 'ASC']]
    });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    if (error.name === 'SequelizeConnectionRefusedError' || error.name === 'SequelizeConnectionError') {
      // Return mock data for development when DB is not available
      return res.json({
        success: true,
        data: [
          { id: 1, account_number: '1-1-1-01', name: 'Kas dan Bank', balance: 5000000, account_type: { name: 'Aset' } },
          { id: 2, account_number: '1-1-2-01', name: 'Piutang Anggota', balance: 25000000, account_type: { name: 'Aset' } },
          { id: 3, account_number: '2-1-1-01', name: 'Simpanan Pokok', balance: 15000000, account_type: { name: 'Kewajiban' } },
          { id: 4, account_number: '4-1-1-01', name: 'Pendapatan Jasa', balance: 2500000, account_type: { name: 'Pendapatan' } },
          { id: 5, account_number: '5-1-1-01', name: 'Beban Listrik', balance: 150000, account_type: { name: 'Beban' } },
        ],
        message: 'Using mock data (Database connection failed)'
      });
    }
    next(error);
  }
});

// Get account by ID
router.get('/accounts/:id', async (req, res, next) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [{ model: AccountType, as: 'account_type' }]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
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
        [require('sequelize').Op.between]: [start_date, end_date]
      };
    }

    const { count, rows } = await JournalEntry.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: JournalLine,
          as: 'lines',
          include: [{ model: Account, as: 'account' }]
        }
      ],
      order: [['transaction_date', 'DESC'], ['created_at', 'DESC']]
    });

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
    if (error.name === 'SequelizeConnectionRefusedError' || error.name === 'SequelizeConnectionError') {
      // Return mock data for development when DB is not available
      return res.json({
        success: true,
        data: [
          {
            id: 1,
            voucher_number: 'JV2403080001',
            transaction_date: '2024-03-08',
            description: 'Setor Simpanan Wajib - Budi Santoso',
            reference_type: 'SAVING_DEPOSIT',
            is_posted: true,
            lines: [
              { account: { name: 'Kas dan Bank', account_number: '1-1-1-01' }, debit: 50000, credit: 0, description: 'Setor Simpanan' },
              { account: { name: 'Simpanan Wajib', account_number: '2-1-1-01' }, debit: 0, credit: 50000, description: 'Simpanan Wajib' },
            ],
          },
          {
            id: 2,
            voucher_number: 'JV2403080002',
            transaction_date: '2024-03-08',
            description: 'Beban Listrik Kantor',
            reference_type: 'ADJUSTMENT',
            is_posted: false,
            lines: [
              { account: { name: 'Beban Listrik', account_number: '5-1-1-01' }, debit: 150000, credit: 0, description: 'Biaya Listrik' },
              { account: { name: 'Kas dan Bank', account_number: '1-1-1-01' }, debit: 0, credit: 150000, description: 'Bayar Listrik' },
            ],
          },
        ],
        pagination: { total: 2, page: 1, pages: 1 },
        message: 'Using mock data (Database connection failed)'
      });
    }
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
    const journalLines = lines.map(line => ({
      journal_entry_id: journalEntry.id,
      account_id: line.account_id,
      debit: line.debit || 0,
      credit: line.credit || 0,
      description: line.description,
      member_id: line.member_id
    }));

    await JournalLine.bulkCreate(journalLines);

    const saved = await JournalEntry.findByPk(journalEntry.id, {
      include: [
        {
          model: JournalLine,
          as: 'lines',
          include: [{ model: Account, as: 'account' }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: saved,
      message: 'Journal entry created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Post journal entry
router.post('/journal/:id/post', async (req, res, next) => {
  try {
    const journalEntry = await JournalEntry.findByPk(req.params.id, {
      include: [{ model: JournalLine, as: 'lines' }]
    });

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
        balance: parseFloat(account.balance) + balanceChange
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

    // Delete lines first (though with CASCADE it might be automatic)
    await JournalLine.destroy({ where: { journal_entry_id: journalEntry.id } });
    await journalEntry.destroy();

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
    const asOfDate = as_of || new Date();

    // Get all posted journal entries up to the specified date
    const postedEntries = await JournalEntry.findAll({
      where: {
        is_posted: true,
        transaction_date: { [require('sequelize').Op.lte]: asOfDate }
      },
      include: [{ model: JournalLine, as: 'lines' }]
    });

    // Calculate trial balance
    const trialBalance = {};

    for (const entry of postedEntries) {
      for (const line of entry.lines) {
        const accountId = line.account_id;

        if (!trialBalance[accountId]) {
          const account = await Account.findByPk(accountId, {
            include: [{ model: AccountType, as: 'account_type' }]
          });
          trialBalance[accountId] = {
            account_id: accountId,
            account_number: account.account_number,
            account_name: account.name,
            account_type: account.account_type.name,
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

    const account = await Account.findByPk(accountId, {
      include: [{ model: AccountType, as: 'account_type' }]
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    const where = { account_id: accountId };

    if (start_date || end_date) {
      where.transaction_date = {};
      if (start_date) where.transaction_date[require('sequelize').Op.gte] = start_date;
      if (end_date) where.transaction_date[require('sequelize').Op.lte] = end_date;
    }

    const journalLines = await JournalLine.findAll({
      where,
      include: [
        {
          model: JournalEntry,
          as: 'journal_entry',
          where: { is_posted: true }
        }
      ],
      order: [['created_at', 'ASC']]
    });

    // Calculate running balance
    let runningBalance = 0;
    const ledger = journalLines.map(line => {
      const entry = line.journal_entry;
      const balanceChange = account.account_type.is_debit_balance
        ? parseFloat(line.debit) - parseFloat(line.credit)
        : parseFloat(line.credit) - parseFloat(line.debit);

      runningBalance += balanceChange;

      return {
        date: entry.transaction_date,
        voucher_number: entry.voucher_number,
        description: line.description || entry.description,
        debit: parseFloat(line.debit),
        credit: parseFloat(line.credit),
        balance: runningBalance
      };
    });

    res.json({
      success: true,
      data: {
        account: account,
        ledger: ledger
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
