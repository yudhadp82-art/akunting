const express = require('express');
const router = express.Router();
const { Loan, LoanType, Member, LoanRepayment } = require('../models');
const { generateLoanNumber } = require('../utils/generators');

// Get all loans
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, member_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (member_id) where.member_id = member_id;

    const { count, rows } = await Loan.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Manually load associations
    for (const row of rows) {
      if (row.member_id) row.member = await Member.findByPk(row.member_id);
      if (row.loan_type_id) row.loan_type = await LoanType.findByPk(row.loan_type_id);
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

// Get loan by ID
router.get('/:id', async (req, res, next) => {
  try {
    const loan = await Loan.findByPk(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }

    // Load associations manually
    if (loan.member_id) loan.member = await Member.findByPk(loan.member_id);
    if (loan.loan_type_id) loan.loan_type = await LoanType.findByPk(loan.loan_type_id);
    loan.repayments = await LoanRepayment.findAll({ 
      where: { loan_id: loan.id },
      order: [['repayment_number', 'ASC']]
    });

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    next(error);
  }
});

// Create new loan application
router.post('/', async (req, res, next) => {
  try {
    const loanData = req.body;

    // Get loan type
    const loanType = await LoanType.findByPk(loanData.loan_type_id);
    if (!loanType) {
      return res.status(404).json({
        success: false,
        error: 'Loan type not found'
      });
    }

    // Set default values from loan type if not provided
    if (!loanData.interest_rate) loanData.interest_rate = loanType.default_interest_rate;
    if (!loanData.period_months) loanData.period_months = loanType.default_period_months;

    // Calculate end date
    const startDate = new Date(loanData.start_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + loanData.period_months);

    // Generate loan number
    const loan_number = await generateLoanNumber(Loan);

    const loan = await Loan.create({
      ...loanData,
      loan_number,
      end_date: endDate,
      status: 'PENDING'
    });

    // Generate repayment schedule
    const principalPerMonth = parseFloat(loanData.principal_amount) / loanData.period_months;
    const interestPerMonth = parseFloat(loanData.principal_amount) * (parseFloat(loanData.interest_rate) / 100);

    const repayments = [];
    for (let i = 1; i <= loanData.period_months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const createdRepayment = await LoanRepayment.create({
        loan_id: loan.id,
        repayment_number: i,
        principal_amount: principalPerMonth.toFixed(2),
        interest_amount: interestPerMonth.toFixed(2),
        total_amount: (principalPerMonth + interestPerMonth).toFixed(2),
        due_date: dueDate,
        status: 'PENDING'
      });
      repayments.push(createdRepayment);
    }

    // Assign repayments and associations for response
    loan.repayments = repayments;
    if (loan.member_id) loan.member = await Member.findByPk(loan.member_id);
    if (loan.loan_type_id) loan.loan_type = await LoanType.findByPk(loan.loan_type_id);

    res.status(201).json({
      success: true,
      data: loan,
      message: 'Loan application created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Approve loan
router.post('/:id/approve', async (req, res, next) => {
  try {
    const loan = await Loan.findByPk(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }

    if (loan.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Loan cannot be approved in current status'
      });
    }

    await loan.update({
      status: 'ACTIVE',
      approved_by: req.body.approved_by || 'admin',
      approved_date: new Date()
    });

    res.json({
      success: true,
      data: loan,
      message: 'Loan approved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Disburse loan
router.post('/:id/disburse', async (req, res, next) => {
  try {
    const loan = await Loan.findByPk(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }

    if (loan.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Loan must be approved before disbursement'
      });
    }

    // TODO: Create journal entry for loan disbursement
    // Debit: Piutang Anggota
    // Credit: Kas dan Bank

    res.json({
      success: true,
      data: loan,
      message: 'Loan disbursed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Make loan repayment
router.post('/:id/repayment', async (req, res, next) => {
  try {
    const { repayment_id, amount } = req.body;

    const loan = await Loan.findByPk(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }

    const repayment = await LoanRepayment.findOne({
      where: { id: repayment_id, loan_id: loan.id }
    });

    if (!repayment) {
      return res.status(404).json({
        success: false,
        error: 'Repayment not found'
      });
    }

    if (repayment.status === 'PAID') {
      return res.status(400).json({
        success: false,
        error: 'Repayment already paid'
      });
    }

    // Update repayment
    await repayment.update({
      status: 'PAID',
      paid_date: new Date()
    });

    // Update loan totals
    await loan.update({
      principal_paid: parseFloat(loan.principal_paid) + parseFloat(repayment.principal_amount),
      interest_paid: parseFloat(loan.interest_paid) + parseFloat(repayment.interest_amount)
    });

    // Check if all repayments are done
    const pendingRepayments = await LoanRepayment.count({
      where: { loan_id: loan.id, status: 'PENDING' }
    });

    if (pendingRepayments === 0) {
      await loan.update({ status: 'COMPLETED' });
    }

    // TODO: Create journal entries for loan repayment
    // Debit: Kas dan Bank (principal + interest)
    // Credit: Piutang Anggota (principal)
    // Credit: Pendapatan Jasa Pinjaman (interest)

    res.json({
      success: true,
      data: loan,
      message: 'Repayment recorded successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get repayment schedule
router.get('/:id/schedule', async (req, res, next) => {
  try {
    const repayments = await LoanRepayment.findAll({
      where: { loan_id: req.params.id },
      order: [['repayment_number', 'ASC']]
    });

    res.json({
      success: true,
      data: repayments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
