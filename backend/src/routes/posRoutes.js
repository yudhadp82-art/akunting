const express = require('express');
const router = express.Router();
const { POSTransaction, POSLineItem, Product, Member, JournalEntry, JournalLine, Account } = require('../models');
const { generateTransactionNumber } = require('../utils/generators');

// Get all POS transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (start_date && end_date) {
      where.created_at = {
        between: [new Date(start_date), new Date(end_date)]
      };
    }

    const { count, rows } = await POSTransaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Manually load line items for each transaction
    for (const row of rows) {
      row.line_items = await POSLineItem.findAll({ where: { pos_transaction_id: row.id } });
      if (row.member_id) {
        row.member = await Member.findByPk(row.member_id);
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

// Get POS transaction by ID
router.get('/transactions/:id', async (req, res, next) => {
  try {
    const transaction = await POSTransaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Load associations manually
    transaction.line_items = await POSLineItem.findAll({ where: { pos_transaction_id: transaction.id } });
    for (const item of transaction.line_items) {
      item.product = await Product.findByPk(item.product_id);
    }
    
    if (transaction.member_id) {
      transaction.member = await Member.findByPk(transaction.member_id);
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

// Create new POS transaction
router.post('/transactions', async (req, res, next) => {
  try {
    const {
      member_id,
      line_items,
      transaction_type = 'CASH',
      discount = 0,
      tax = 0,
      payment_method = 'CASH',
      paid_amount,
      notes
    } = req.body;

    if (!line_items || line_items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Line items are required'
      });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of line_items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with id ${item.product_id} not found`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      item.unit_price = product.selling_price;
      item.subtotal = item.quantity * item.unit_price * (1 - (item.discount || 0) / 100);
      item.product_code = product.product_code;
      item.product_name = product.name;
      subtotal += item.subtotal;
    }

    const totalAmount = subtotal - parseFloat(discount) + parseFloat(tax);
    const changeAmount = parseFloat(paid_amount) - totalAmount;

    // Generate transaction number
    const transaction_number = await generateTransactionNumber(POSTransaction, 'POS');

    // Create transaction
    const transaction = await POSTransaction.create({
      transaction_number,
      member_id: member_id || null,
      transaction_type,
      subtotal,
      discount,
      tax,
      total_amount: totalAmount,
      paid_amount,
      change_amount: changeAmount,
      payment_method,
      notes,
      status: 'COMPLETED'
    });

    // Create line items and update product stock
    for (const item of line_items) {
      await POSLineItem.create({
        pos_transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        subtotal: item.subtotal
      });

      // Update product stock
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.product_id }
      });
    }

    // Create journal entry for POS transaction
    try {
      const cashAccount = await Account.findOne({ where: { account_number: '1-1-1-01' } });
      const revenueAccount = await Account.findOne({ where: { account_number: '4-1-3-01' } });

      if (cashAccount && revenueAccount) {
        const journalEntry = await JournalEntry.create({
          voucher_number: `JV-POS-${transaction.transaction_number}`,
          transaction_date: new Date(),
          description: `Penjualan POS: ${transaction.transaction_number}`,
          reference_type: 'POS_SALE',
          reference_id: transaction.id,
          is_posted: true,
          posted_at: new Date()
        });

        // Debit: Kas
        await JournalLine.create({
          journal_entry_id: journalEntry.id,
          account_id: cashAccount.id,
          debit: totalAmount,
          credit: 0,
          description: `Kas dari Penjualan POS ${transaction.transaction_number}`
        });

        // Credit: Pendapatan
        await JournalLine.create({
          journal_entry_id: journalEntry.id,
          account_id: revenueAccount.id,
          debit: 0,
          credit: totalAmount,
          description: `Pendapatan Penjualan POS ${transaction.transaction_number}`
        });
      }
    } catch (journalError) {
      console.error('Failed to create journal entry for POS:', journalError);
      // Don't fail the whole transaction if journal creation fails, 
      // but in production we might want to use a transaction
    }

    const saved = await POSTransaction.findByPk(transaction.id, {
      include: [
        { model: Member, as: 'member' },
        { model: POSLineItem, as: 'line_items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    res.status(201).json({
      success: true,
      data: saved,
      message: 'Transaction completed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Cancel transaction
router.post('/transactions/:id/cancel', async (req, res, next) => {
  try {
    const transaction = await POSTransaction.findByPk(req.params.id, {
      include: [{ model: POSLineItem, as: 'line_items' }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Transaction already cancelled'
      });
    }

    // Restore product stock
    for (const item of transaction.line_items) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.product_id }
      });
    }

    await transaction.update({ status: 'CANCELLED' });

    res.json({
      success: true,
      data: transaction,
      message: 'Transaction cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Products for POS
router.get('/products', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const where = {
      is_active: true
    };

    if (category) where.category = category;
    if (search) {
      // Simplified search for Firestore (prefix search)
      where.name = { like: search };
    }

    const products = await Product.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// Get low stock products
router.get('/products/low-stock', async (req, res, next) => {
  try {
    // Firestore can't compare two columns in a single query easily.
    // We'll fetch active products and filter in memory for simplicity.
    const allProducts = await Product.findAll({
      where: { is_active: true }
    });

    const products = allProducts
      .filter(p => p.stock < p.min_stock)
      .sort((a, b) => a.stock - b.stock);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction summary for today
router.get('/summary/today', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await POSTransaction.findAll({
      where: {
        status: 'COMPLETED',
        created_at: { gte: today }
      }
    });

    const summary = {
      total_transactions: transactions.length,
      total_sales: transactions.reduce((sum, t) => sum + parseFloat(t.total_amount), 0),
      total_discount: transactions.reduce((sum, t) => sum + parseFloat(t.discount), 0),
      total_tax: transactions.reduce((sum, t) => sum + parseFloat(t.tax), 0),
      payment_methods: {
        CASH: transactions.filter(t => t.payment_method === 'CASH').length,
        DEBIT_CARD: transactions.filter(t => t.payment_method === 'DEBIT_CARD').length,
        CREDIT_CARD: transactions.filter(t => t.payment_method === 'CREDIT_CARD').length,
        TRANSFER: transactions.filter(t => t.payment_method === 'TRANSFER').length,
        'E-WALLET': transactions.filter(t => t.payment_method === 'E-WALLET').length,
      }
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
