const express = require('express');
const router = express.Router();
const { SHUPeriod, SHUDistribution, SHUAllocationRule, Member, JournalEntry, JournalLine } = require('../models');
const { DEFAULT_SHU_ALLOCATION } = require('../config/constants');
const { Op } = require('sequelize');

// Get all SHU periods
router.get('/periods', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const periods = await SHUPeriod.findAll({
      where,
      order: [['start_date', 'DESC']]
    });

    res.json({
      success: true,
      data: periods
    });
  } catch (error) {
    next(error);
  }
});

// Create new SHU period
router.post('/periods', async (req, res, next) => {
  try {
    const { name, start_date, end_date } = req.body;

    // Validate date range
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    const period = await SHUPeriod.create({
      name,
      start_date,
      end_date,
      status: 'OPEN',
      total_revenue: 0,
      total_expense: 0,
      net_income: 0
    });

    res.status(201).json({
      success: true,
      data: period,
      message: 'SHU period created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Calculate SHU for a period
router.post('/periods/:id/calculate', async (req, res, next) => {
  try {
    const periodId = req.params.id;

    const period = await SHUPeriod.findByPk(periodId);

    if (!period) {
      return res.status(404).json({
        success: false,
        error: 'SHU period not found'
      });
    }

    if (period.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        error: 'Period must be in OPEN status to calculate'
      });
    }

    // Calculate total revenue and expense from journal entries
    const { JournalEntry, JournalLine, Account } = require('../models');

    const revenueAccounts = await Account.findAll({
      where: { account_number: { [Op.like]: '4-%' } }
    });

    const expenseAccounts = await Account.findAll({
      where: { account_number: { [Op.like]: '5-%' } }
    });

    const revenueAccountIds = revenueAccounts.map(a => a.id);
    const expenseAccountIds = expenseAccounts.map(a => a.id);

    const journalLines = await JournalLine.findAll({
      include: [
        {
          model: JournalEntry,
          as: 'journal_entry',
          where: {
            is_posted: true,
            transaction_date: {
              [Op.between]: [period.start_date, period.end_date]
            }
          }
        }
      ]
    });

    let totalRevenue = 0;
    let totalExpense = 0;

    for (const line of journalLines) {
      if (revenueAccountIds.includes(line.account_id)) {
        totalRevenue += parseFloat(line.credit || 0) - parseFloat(line.debit || 0);
      }
      if (expenseAccountIds.includes(line.account_id)) {
        totalExpense += parseFloat(line.debit || 0) - parseFloat(line.credit || 0);
      }
    }

    const netIncome = totalRevenue - totalExpense;

    // Update period
    await period.update({
      total_revenue: totalRevenue,
      total_expense: totalExpense,
      net_income: netIncome,
      status: 'CALCULATED',
      calculated_at: new Date()
    });

    // Create allocation rules
    await SHUAllocationRule.destroy({ where: { shu_period_id: periodId } });

    await SHUAllocationRule.bulkCreate([
      {
        shu_period_id: periodId,
        allocation_type: 'JASA_MODAL',
        percentage: DEFAULT_SHU_ALLOCATION.JASA_MODAL,
        amount: netIncome * (DEFAULT_SHU_ALLOCATION.JASA_MODAL / 100),
        description: 'Bagian SHU berdasarkan modal/simpanan anggota'
      },
      {
        shu_period_id: periodId,
        allocation_type: 'JASA_USAHA',
        percentage: DEFAULT_SHU_ALLOCATION.JASA_USAHA,
        amount: netIncome * (DEFAULT_SHU_ALLOCATION.JASA_USAHA / 100),
        description: 'Bagian SHU berdasarkan transaksi/usaha anggota'
      },
      {
        shu_period_id: periodId,
        allocation_type: 'PENDIDIKAN',
        percentage: DEFAULT_SHU_ALLOCATION.PENDIDIKAN,
        amount: netIncome * (DEFAULT_SHU_ALLOCATION.PENDIDIKAN / 100),
        description: 'Dana pendidikan'
      },
      {
        shu_period_id: periodId,
        allocation_type: 'SOSIAL',
        percentage: DEFAULT_SHU_ALLOCATION.SOSIAL,
        amount: netIncome * (DEFAULT_SHU_ALLOCATION.SOSIAL / 100),
        description: 'Dana sosial'
      },
      {
        shu_period_id: periodId,
        allocation_type: 'DANA_CADANGAN',
        percentage: DEFAULT_SHU_ALLOCATION.DANA_CADANGAN,
        amount: netIncome * (DEFAULT_SHU_ALLOCATION.DANA_CADANGAN / 100),
        description: 'Dana cadangan koperasi'
      }
    ]);

    // Get the updated period with allocations
    const updatedPeriod = await SHUPeriod.findByPk(periodId, {
      include: [{ model: SHUAllocationRule, as: 'allocation_rules' }]
    });

    res.json({
      success: true,
      data: updatedPeriod,
      message: 'SHU calculated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Distribute SHU to members
router.post('/periods/:id/distribute', async (req, res, next) => {
  try {
    const periodId = req.params.id;

    const period = await SHUPeriod.findByPk(periodId, {
      include: [{ model: SHUAllocationRule, as: 'allocation_rules' }]
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        error: 'SHU period not found'
      });
    }

    if (period.status !== 'CALCULATED') {
      return res.status(400).json({
        success: false,
        error: 'Period must be in CALCULATED status to distribute'
      });
    }

    // Get allocation rules
    const jasaModalRule = period.allocation_rules.find(r => r.allocation_type === 'JASA_MODAL');
    const jasaUsahaRule = period.allocation_rules.find(r => r.allocation_type === 'JASA_USAHA');

    if (!jasaModalRule || !jasaUsahaRule) {
      return res.status(400).json({
        success: false,
        error: 'Allocation rules not found'
      });
    }

    // Get active members
    const activeMembers = await Member.findAll({
      where: { status: 'ACTIVE' },
      include: [{ model: require('../models').Savings, as: 'savings' }]
    });

    // Get total savings for Jasa Modal calculation
    const totalSavings = activeMembers.reduce((sum, member) => {
      return sum + member.savings.reduce((s, saving) => s + parseFloat(saving.balance), 0);
    }, 0);

    // Distribute SHU to each member
    const distributions = [];

    for (const member of activeMembers) {
      // Calculate Jasa Modal based on savings
      const memberSavings = member.savings.reduce((s, saving) => s + parseFloat(saving.balance), 0);
      const jasaModalShare = totalSavings > 0 ? memberSavings / totalSavings : 0;
      const jasaModalAmount = jasaModalRule.amount * jasaModalShare;

      // Calculate Jasa Usaha based on transactions (simplified for now)
      const jasaUsahaShare = 1 / activeMembers.length; // Equal share for now
      const jasaUsahaAmount = jasaUsahaRule.amount * jasaUsahaShare;

      const totalSHU = jasaModalAmount + jasaUsahaAmount;

      distributions.push({
        shu_period_id: periodId,
        member_id: member.id,
        jasa_modal_share: jasaModalShare * 100,
        jasa_usaha_share: jasaUsahaShare * 100,
        jasa_modal_amount: jasaModalAmount,
        jasa_usaha_amount: jasaUsahaAmount,
        total_shu_amount: totalSHU,
        distributed_date: new Date()
      });

      // Update member's total SHU earned
      await member.update({
        total_shu_earned: parseFloat(member.total_shu_earned) + totalSHU
      });
    }

    // Create distributions
    await SHUDistribution.bulkCreate(distributions);

    // Update period status
    await period.update({
      status: 'DISTRIBUTED',
      distributed_at: new Date()
    });

    const updatedPeriod = await SHUPeriod.findByPk(periodId, {
      include: [
        { model: SHUAllocationRule, as: 'allocation_rules' },
        { model: SHUDistribution, as: 'distributions', include: [{ model: Member, as: 'member' }] }
      ]
    });

    res.json({
      success: true,
      data: updatedPeriod,
      message: 'SHU distributed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get SHU period details with allocations
router.get('/periods/:id', async (req, res, next) => {
  try {
    const period = await SHUPeriod.findByPk(req.params.id, {
      include: [
        { model: SHUAllocationRule, as: 'allocation_rules' },
        { model: SHUDistribution, as: 'distributions', include: [{ model: Member, as: 'member' }] }
      ]
    });

    if (!period) {
      return res.status(404).json({
        success: false,
        error: 'SHU period not found'
      });
    }

    res.json({
      success: true,
      data: period
    });
  } catch (error) {
    next(error);
  }
});

// Get SHU allocation rules template
router.get('/allocation-rules', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        default_allocation: DEFAULT_SHU_ALLOCATION,
        description: 'Aturan pembagian SHU default dapat disesuaikan'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get member's SHU history
router.get('/member/:memberId/history', async (req, res, next) => {
  try {
    const memberId = req.params.memberId;

    const distributions = await SHUDistribution.findAll({
      where: { member_id: memberId },
      include: [
        { model: SHUPeriod, as: 'shu_period' }
      ],
      order: [['created_at', 'DESC']]
    });

    const member = await Member.findByPk(memberId);

    res.json({
      success: true,
      data: {
        member: member,
        distributions: distributions,
        total_shu_earned: member.total_shu_earned
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
