const express = require('express');
const router = express.Router();
const { Member, Savings, Loan, SHUPeriod, JournalLine, Account, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    // 1. Total Members
    const totalMembers = await Member.count({ where: { status: 'ACTIVE' } });
    
    // 2. Total Savings (from Savings model balance or Account 2-1-1-01)
    const totalSavingsResult = await Savings.sum('balance', { where: { is_active: true } });
    const totalSavings = parseFloat(totalSavingsResult || 0);

    // 3. Total Loans Outstanding
    const totalLoansResult = await Loan.sum('remaining_principal', { where: { status: 'ACTIVE' } });
    const totalLoans = parseFloat(totalLoansResult || 0);

    // 4. Current SHU (Net Income from current year)
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;

    const revenueAccounts = await Account.findAll({
      where: { account_number: { [Op.like]: '4-%' } }
    });
    const expenseAccounts = await Account.findAll({
      where: { account_number: { [Op.like]: '5-%' } }
    });

    const revenueIds = revenueAccounts.map(a => a.id);
    const expenseIds = expenseAccounts.map(a => a.id);

    const journalLines = await JournalLine.findAll({
      include: [{
        model: require('../models').JournalEntry,
        as: 'journal_entry',
        where: {
          is_posted: true,
          transaction_date: { [Op.between]: [startDate, endDate] }
        }
      }]
    });

    let currentSHU = 0;
    for (const line of journalLines) {
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
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const monthNum = date.getMonth() + 1;
      
      const monthStart = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
      const monthEnd = new Date(year, monthNum, 0).toISOString().split('T')[0];

      const monthLines = await JournalLine.findAll({
        include: [{
          model: require('../models').JournalEntry,
          as: 'journal_entry',
          where: {
            is_posted: true,
            transaction_date: { [Op.between]: [monthStart, monthEnd] }
          }
        }]
      });

      let revenue = 0;
      let expense = 0;
      for (const line of monthLines) {
        if (revenueIds.includes(line.account_id)) {
          revenue += (parseFloat(line.credit) - parseFloat(line.debit));
        } else if (expenseIds.includes(line.account_id)) {
          expense += (parseFloat(line.debit) - parseFloat(line.credit));
        }
      }
      monthlyTrends.push({ name: month, revenue, expense });
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
    if (error.name === 'SequelizeConnectionRefusedError' || error.name === 'SequelizeConnectionError') {
      // Fallback for demo
      return res.json({
        success: true,
        data: {
          stats: { total_members: 128, total_savings: 152000000, total_loans: 84000000, current_shu: 12500000 },
          trends: [
            { name: 'Jan', revenue: 4000000, expense: 2400000 },
            { name: 'Feb', revenue: 3000000, expense: 1398000 },
            { name: 'Mar', revenue: 2000000, expense: 9800000 },
            { name: 'Apr', revenue: 2780000, expense: 3908000 },
            { name: 'May', revenue: 1890000, expense: 4800000 },
            { name: 'Jun', revenue: 2390000, expense: 3800000 },
          ],
          savings_distribution: [
            { name: 'Pokok', value: 40 },
            { name: 'Wajib', value: 30 },
            { name: 'Sukarela', value: 30 }
          ]
        },
        message: 'Using mock data (Database connection failed)'
      });
    }
    next(error);
  }
});

module.exports = router;