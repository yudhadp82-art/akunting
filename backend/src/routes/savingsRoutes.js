const express = require('express');
const router = express.Router();
const { Savings, SavingsType, Member } = require('../models');
const { generateSavingsAccountNumber } = require('../utils/generators');

// Get all savings accounts
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, member_id, savings_type_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (member_id) where.member_id = member_id;
    if (savings_type_id) where.savings_type_id = savings_type_id;

    const { count, rows } = await Savings.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Member, as: 'member' },
        { model: SavingsType, as: 'savings_type' }
      ],
      order: [['created_at', 'DESC']]
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
    next(error);
  }
});

// Get savings account by ID
router.get('/:id', async (req, res, next) => {
  try {
    const savings = await Savings.findByPk(req.params.id, {
      include: [
        { model: Member, as: 'member' },
        { model: SavingsType, as: 'savings_type' }
      ]
    });

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: 'Savings account not found'
      });
    }

    res.json({
      success: true,
      data: savings
    });
  } catch (error) {
    next(error);
  }
});

// Create new savings account
router.post('/', async (req, res, next) => {
  try {
    const { member_id, savings_type_id } = req.body;

    // Get savings type
    const savingsType = await SavingsType.findByPk(savings_type_id);
    if (!savingsType) {
      return res.status(404).json({
        success: false,
        error: 'Savings type not found'
      });
    }

    // Generate account number
    const account_number = await generateSavingsAccountNumber(savingsType, member_id);

    const savings = await Savings.create({
      ...req.body,
      account_number,
      opened_date: new Date(),
      is_active: true
    });

    const saved = await Savings.findByPk(savings.id, {
      include: [
        { model: Member, as: 'member' },
        { model: SavingsType, as: 'savings_type' }
      ]
    });

    res.status(201).json({
      success: true,
      data: saved,
      message: 'Savings account created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Deposit to savings
router.post('/:id/deposit', async (req, res, next) => {
  try {
    const { amount, description } = req.body;

    const savings = await Savings.findByPk(req.params.id);

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: 'Savings account not found'
      });
    }

    if (!savings.is_active) {
      return res.status(400).json({
        success: false,
        error: 'Savings account is not active'
      });
    }

    // Update balance
    await savings.update({
      balance: parseFloat(savings.balance) + parseFloat(amount)
    });

    res.json({
      success: true,
      data: savings,
      message: 'Deposit successful'
    });
  } catch (error) {
    next(error);
  }
});

// Withdraw from savings
router.post('/:id/withdraw', async (req, res, next) => {
  try {
    const { amount, description } = req.body;

    const savings = await Savings.findByPk(req.params.id);

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: 'Savings account not found'
      });
    }

    if (!savings.is_active) {
      return res.status(400).json({
        success: false,
        error: 'Savings account is not active'
      });
    }

    if (parseFloat(amount) > parseFloat(savings.balance)) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Update balance
    await savings.update({
      balance: parseFloat(savings.balance) - parseFloat(amount)
    });

    res.json({
      success: true,
      data: savings,
      message: 'Withdrawal successful'
    });
  } catch (error) {
    next(error);
  }
});

// Close savings account
router.delete('/:id', async (req, res, next) => {
  try {
    const savings = await Savings.findByPk(req.params.id);

    if (!savings) {
      return res.status(404).json({
        success: false,
        error: 'Savings account not found'
      });
    }

    if (parseFloat(savings.balance) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot close account with non-zero balance'
      });
    }

    await savings.update({
      is_active: false,
      closed_date: new Date()
    });

    res.json({
      success: true,
      message: 'Savings account closed successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
