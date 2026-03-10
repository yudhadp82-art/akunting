const express = require('express');
const router = express.Router();
const { Member, Savings, Loan, SHUPeriod, JournalLine, Account, JournalEntry } = require('../models');

// Get dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    // 1. Total Members
    const totalMembers = await Member.count({ where: { status: 'ACTIVE' } });
    
    // 2. Total Savings (from Savings model balance or Account 2-1-1-01)
    const totalSavings = await Savings.sum('balance', { where: { is_active: true } });

    // 3. Total Loans Outstanding
    const totalLoans = await Loan.sum('principal_amount', { where: { status: 'ACTIVE' } });

    // 4. Current SHU (Net Income from current year)
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);

    const revenueAccounts = await Account.findAll({
      where: { account_number: { like: '4-' } }
    });
    const expenseAccounts = await Account.findAll({
      where: { account_number: { like: '5-' } }
    });

    const revenueIds = revenueAccounts.map(a => a.id);
    const expenseIds = expenseAccounts.map(a => a.id);

    const journalLines = await JournalLine.findAll({
      where: {
        transaction_date: { between: [startDate, endDate] }
      }
    });

    let currentSHU = 0;
    for (const line of journalLines) {
      const entry = await JournalEntry.findByPk(line.journal_entry_id);
      if (!entry || !entry.is_posted) continue;

      if (revenueIds.includes(line.account_id)) {
        currentSHU += (parseFloat(line.credit) - parseFloat(line.debit));
      } else if (expenseIds.includes(line.account_id)) {
        currentSHU -= (parseFloat(line.debit) - parseFloat(line.credit));
      }
    }

    // 5. Monthly Trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;
      
      const monthStart = new Date(year, monthNum - 1, 1);
      const monthEnd = new Date(year, monthNum, 0);

      const monthLines = await JournalLine.findAll({
        where: {
          transaction_date: { between: [monthStart, monthEnd] }
        }
      });

      let revenue = 0;
      let expense = 0;
      for (const line of monthLines) {
        const entry = await JournalEntry.findByPk(line.journal_entry_id);
        if (!entry || !entry.is_posted) continue;

        if (revenueIds.includes(line.account_id)) {
          revenue += (parseFloat(line.credit) - parseFloat(line.debit));
        } else if (expenseIds.includes(line.account_id)) {
          expense += (parseFloat(line.debit) - parseFloat(line.credit));
        }
      }
      monthlyTrends.push({ name: monthLabel, revenue, expense });
    }

    res.json({
      success: true,
      data: {
        stats: {
          total_members: totalMembers,
          total_savings: totalSavings,
          total_loans: totalLoans,
          current_shu: currentSHU
        },
        trends: monthlyTrends,
        savings_distribution: [
          { name: 'Pokok', value: 40 }, // Mock distribution for now
          { name: 'Wajib', value: 35 },
          { name: 'Sukarela', value: 25 }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;