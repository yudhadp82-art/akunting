const express = require('express');
const router = express.Router();
const { Member } = require('../models');
const { generateMemberNumber } = require('../utils/generators');

// Get all members
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Member.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
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

// Get member by ID
router.get('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
});

// Create new member
router.post('/', async (req, res, next) => {
  try {
    const memberData = req.body;

    // Generate member number
    memberData.member_number = await generateMemberNumber(Member);

    const member = await Member.create(memberData);

    res.status(201).json({
      success: true,
      data: member,
      message: 'Member created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Update member
router.put('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    await member.update(req.body);

    res.json({
      success: true,
      data: member,
      message: 'Member updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete/deactivate member
router.delete('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByPk(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    await member.update({ status: 'INACTIVE' });

    res.json({
      success: true,
      message: 'Member deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
