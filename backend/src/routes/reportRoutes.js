const express = require('express');
const router = express.Router();
// Helper function to get account balance
const getAccountBalance = async (accountId, asOfDate) => {
  const postedLines = await JournalLine.findAll({
    where: { 
      account_id: accountId,
      transaction_date: { lte: asOfDate }
    }
  });

  const account = await Account.findByPk(accountId);
  const accountType = await AccountType.findByPk(account.account_type_id);

  let balance = 0;
  for (const line of postedLines) {
    const entry = await JournalEntry.findByPk(line.journal_entry_id);
    if (!entry || !entry.is_posted) continue;

    if (accountType.is_debit_balance) {
      balance += parseFloat(line.debit) - parseFloat(line.credit);
    } else {
      balance += parseFloat(line.credit) - parseFloat(line.debit);
    }
  }

  return balance;
};

// Balance Sheet (Laporan Posisi Keuangan) - SAK EP
router.get('/balance-sheet', async (req, res, next) => {
  try {
    const asOfDate = req.query.date ? new Date(req.query.date) : new Date();

    // Get all accounts
    const accounts = await Account.findAll({
      where: { is_active: true }
    });

    // Group by category
    const assets = { current: [], fixed: [], total: 0 };
    const liabilities = { current: [], long_term: [], total: 0 };
    const equity = { total: 0 };

    for (const account of accounts) {
      const balance = await getAccountBalance(account.id, asOfDate);

      if (Math.abs(balance) < 0.01) continue;

      const accountType = await AccountType.findByPk(account.account_type_id);

      const data = {
        account_number: account.account_number,
        name: account.name,
        balance: balance
      };

      switch (accountType.category) {
        case 'ASSET':
          if (account.account_number.startsWith('1-1-')) {
            assets.current.push(data);
          } else {
            assets.fixed.push(data);
          }
          assets.total += balance;
          break;

        case 'LIABILITY':
          if (account.account_number.startsWith('2-1-')) {
            liabilities.current.push(data);
          } else {
            liabilities.long_term.push(data);
          }
          liabilities.total += balance;
          break;

        case 'EQUITY':
          equity.total += balance;
          break;
      }
    }

    res.json({
      success: true,
      data: {
        as_of_date: asOfDate,
        title: 'Laporan Posisi Keuangan',
        subtitle: 'Per Tanggal ' + new Date(asOfDate).toLocaleDateString('id-ID'),
        assets,
        liabilities,
        equity,
        total_assets: assets.total,
        total_liabilities_and_equity: liabilities.total + equity.total
      }
    });
  } catch (error) {
    next(error);
  }
});

// Income Statement (Laporan Laba Rugi) - SAK EP
router.get('/income-statement', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1);
    const endDate = end_date || new Date();

    // Get revenue and expense accounts
    const revenueAccounts = await Account.findAll({
      where: { is_active: true },
      order: [['account_number', 'ASC']]
    });

    const revenues = [];
    const expenses = [];
    let totalRevenue = 0;
    let totalExpense = 0;

    for (const account of revenueAccounts) {
      const balance = await getAccountBalance(account.id, endDate) -
                     await getAccountBalance(account.id, new Date(startDate));

      if (Math.abs(balance) < 0.01) continue;

      const accountType = await AccountType.findByPk(account.account_type_id);

      const data = {
        account_number: account.account_number,
        name: account.name,
        amount: Math.abs(balance)
      };

      if (accountType.category === 'REVENUE') {
        revenues.push(data);
        totalRevenue += Math.abs(balance);
      } else if (accountType.category === 'EXPENSE') {
        expenses.push(data);
        totalExpense += Math.abs(balance);
      }
    }

    const netIncome = totalRevenue - totalExpense;

    res.json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate,
          label: `Periode ${new Date(startDate).toLocaleDateString('id-ID')} s.d. ${new Date(endDate).toLocaleDateString('id-ID')}`
        },
        title: 'Laporan Laba Rugi dan Penghasilan Komprehensif Lain',
        revenues: { items: revenues, total: totalRevenue },
        expenses: { items: expenses, total: totalExpense },
        net_income: netIncome,
        is_profit: netIncome >= 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// Statement of Changes in Equity (Laporan Perubahan Ekuitas) - SAK EP
router.get('/equity', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1);
    const endDate = end_date || new Date();

    // Get beginning balances
    const beginningBalances = {
      principal_savings: 0,
      reserve_fund: 0,
      current_shu: 0
    };

    // Get ending balances
    const endingBalances = {
      principal_savings: 0,
      reserve_fund: 0,
      current_shu: 0
    };

    // Get equity accounts
    const equityAccounts = await Account.findAll({
      where: { is_active: true },
      order: [['account_number', 'ASC']]
    });

    for (const account of equityAccounts) {
      const accountType = await AccountType.findByPk(account.account_type_id);
      if (accountType.category === 'EQUITY') {
        const beginningBalance = await getAccountBalance(account.id, startDate);
        const endingBalance = await getAccountBalance(account.id, endDate);

        if (account.account_number === '3-1-1-01') {
          beginningBalances.principal_savings = beginningBalance;
          endingBalances.principal_savings = endingBalance;
        } else if (account.account_number === '3-1-2-01') {
          beginningBalances.reserve_fund = beginningBalance;
          endingBalances.reserve_fund = endingBalance;
        } else if (account.account_number === '3-1-3-01') {
          beginningBalances.current_shu = beginningBalance;
          endingBalances.current_shu = endingBalance;
        }
      }
    }

    // Calculate changes
    const changes = {
      new_members: 0,
      shu_allocation: 0,
      current_shu: endingBalances.current_shu - beginningBalances.current_shu,
      withdrawals: 0
    };

    res.json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate,
          label: `Periode ${new Date(startDate).toLocaleDateString('id-ID')} s.d. ${new Date(endDate).toLocaleDateString('id-ID')}`
        },
        title: 'Laporan Perubahan Ekuitas',
        beginning_balances: beginningBalances,
        changes: changes,
        ending_balances: endingBalances
      }
    });
  } catch (error) {
    next(error);
  }
});

// Cash Flow Statement (Laporan Arus Kas) - SAK EP
router.get('/cash-flow', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date(new Date().getFullYear(), 0, 1);
    const endDate = end_date || new Date();

    // Get beginning cash balance
    const beginningCash = await getAccountBalance(
      (await Account.findOne({ where: { account_number: '1-1-1-01' } })).id,
      startDate
    );

    // Get ending cash balance
    const endingCash = await getAccountBalance(
      (await Account.findOne({ where: { account_number: '1-1-1-01' } })).id,
      endDate
    );

    // Calculate cash flows from transactions
    const operatingActivities = {
      inflows: 0,
      outflows: 0,
      net: 0,
      details: []
    };

    const investingActivities = {
      inflows: 0,
      outflows: 0,
      net: 0,
      details: []
    };

    const financingActivities = {
      inflows: 0,
      outflows: 0,
      net: 0,
      details: []
    };

    res.json({
      success: true,
      data: {
        period: {
          start_date: startDate,
          end_date: endDate,
          label: `Periode ${new Date(startDate).toLocaleDateString('id-ID')} s.d. ${new Date(endDate).toLocaleDateString('id-ID')}`
        },
        title: 'Laporan Arus Kas',
        beginning_cash: beginningCash,
        operating_activities: operatingActivities,
        investing_activities: investingActivities,
        financing_activities: financingActivities,
        net_increase_decrease: 0,
        ending_cash: endingCash
      }
    });
  } catch (error) {
    next(error);
  }
});

// Notes to Financial Statements (Catatan atas Laporan Keuangan) - SAK EP
router.get('/notes', async (req, res, next) => {
  try {
    const { as_of } = req.query;
    const asOfDate = as_of || new Date();

    // Get member statistics
    const totalMembers = await Member.count({ where: { status: 'ACTIVE' } });
    const newMembersThisYear = await Member.count({
      where: {
        status: 'ACTIVE',
        join_date: {
          gte: new Date(new Date().getFullYear(), 0, 1)
        }
      }
    });

    // Get savings statistics
    const totalSavings = await Savings.sum('balance', {
      where: { is_active: true }
    });

    // Get loan statistics
    const activeLoans = await Loan.sum('principal_amount', {
      where: { status: 'ACTIVE' }
    });
    const outstandingLoans = await Loan.count({ where: { status: 'ACTIVE' } });

    res.json({
      success: true,
      data: {
        title: 'Catatan atas Laporan Keuangan',
        as_of_date: asOfDate,
        sections: {
          general_information: {
            title: '1. Informasi Umum',
            content: 'Koperasi Desa adalah badan usaha yang bergerak di bidang simpan pinjam sesuai dengan prinsip koperasi.'
          },
          accounting_policies: {
            title: '2. Kebijakan Akuntansi',
            content: 'Laporan keuangan disusun berdasarkan Standar Akuntansi Keuangan Entitas Privat (SAK EP) yang diterbitkan oleh Ikatan Akuntan Indonesia.'
          },
          capital_structure: {
            title: '3. Struktur Modal',
            content: 'Modal koperasi berasal dari simpanan pokok anggota.'
          },
          member_statistics: {
            title: '4. Statistik Anggota',
            data: {
              total_active_members: totalMembers,
              new_members_this_year: newMembersThisYear
            }
          },
          savings_details: {
            title: '5. Rincian Simpanan',
            data: {
              total_savings_amount: totalSavings || 0
            }
          },
          loan_portfolio: {
            title: '6. Portofolio Pinjaman',
            data: {
              total_outstanding_loans: activeLoans || 0,
              number_of_active_loans: outstandingLoans
            }
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Combined SAK EP Reports
router.get('/combined', async (req, res, next) => {
  try {
    const date = req.query.date || new Date();
    const startDate = req.query.start_date || new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.end_date || new Date();

    // Get all reports
    const [balanceSheet, incomeStatement, equity, cashFlow, notes] = await Promise.all([
      // Simulate getting balance sheet data
      Promise.resolve({}),
      Promise.resolve({}),
      Promise.resolve({}),
      Promise.resolve({}),
      Promise.resolve({})
    ]);

    res.json({
      success: true,
      data: {
        title: 'Paket Laporan Keuangan SAK EP',
        date: date,
        reports: {
          balance_sheet: 'Laporan Posisi Keuangan',
          income_statement: 'Laporan Laba Rugi',
          equity: 'Laporan Perubahan Ekuitas',
          cash_flow: 'Laporan Arus Kas',
          notes: 'Catatan atas Laporan Keuangan'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
