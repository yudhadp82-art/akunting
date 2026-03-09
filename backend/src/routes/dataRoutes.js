const express = require('express');
const router = express.Router();
const { Member, Savings, Loan, Product } = require('../models');
const { parse } = require('csv-parse');

// Import members from CSV/Excel (body-based import)
router.post('/import/members', async (req, res, next) => {
  try {
    const { members } = req.body;

    if (!members || !Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format'
      });
    }

    const results = [];
    const errors = [];

    for (const memberData of members) {
      try {
        // Validate required fields
        if (!memberData.name || !memberData.id_card_number) {
          errors.push({
            row: results.length + 1,
            error: 'Missing required fields'
          });
          continue;
        }

        // Check duplicate
        const existing = await Member.findOne({
          where: { id_card_number: memberData.id_card_number }
        });

        if (existing) {
          errors.push({
            row: results.length + 1,
            data: memberData,
            error: 'Duplicate ID card number'
          });
          continue;
        }

        // Generate member number if not provided
        const member_number = memberData.member_number ||
          await generateMemberNumber(Member);

        // Create member
        const member = await Member.create({
          ...memberData,
          member_number,
          join_date: memberData.join_date || new Date(),
          status: 'ACTIVE',
          total_shu_earned: 0
        });

        results.push({
          success: true,
          data: member
        });
      } catch (error) {
        errors.push({
          row: results.length + 1,
          data: memberData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        imported: results.length,
        failed: errors.length,
        results,
        errors
      },
      message: `Import completed: ${results.length} imported, ${errors.length} failed`
    });
  } catch (error) {
    next(error);
  }
});

// Import products from CSV/Excel
router.post('/import/products', async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format'
      });
    }

    const results = [];
    const errors = [];

    for (const productData of products) {
      try {
        // Validate required fields
        if (!productData.name || !productData.product_code) {
          errors.push({
            row: results.length + 1,
            error: 'Missing required fields'
          });
          continue;
        }

        // Check duplicate
        const existing = await Product.findOne({
          where: { product_code: productData.product_code }
        });

        if (existing) {
          errors.push({
            row: results.length + 1,
            data: productData,
            error: 'Duplicate product code'
          });
          continue;
        }

        // Create product
        const product = await Product.create({
          ...productData,
          is_active: true
        });

        results.push({
          success: true,
          data: product
        });
      } catch (error) {
        errors.push({
          row: results.length + 1,
          data: productData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        imported: results.length,
        failed: errors.length,
        results,
        errors
      },
      message: `Import completed: ${results.length} imported, ${errors.length} failed`
    });
  } catch (error) {
    next(error);
  }
});

// Export members to CSV
router.get('/export/members', async (req, res, next) => {
  try {
    const members = await Member.findAll({
      where: { status: 'ACTIVE' },
      order: [['member_number', 'ASC']]
    });

    // Format for CSV
    const csvData = members.map(member => ({
      'Nomor Anggota': member.member_number,
      'Nama Lengkap': member.name,
      'No. KTP': member.id_card_number,
      'Tanggal Lahir': member.birth_date,
      'Jenis Kelamin': member.gender,
      'Telepon': member.phone || '',
      'Email': member.email || '',
      'Alamat': member.address,
      'Tanggal Bergabung': member.join_date,
      'Status': member.status,
      'Total SHU': member.total_shu_earned
    }));

    res.json({
      success: true,
      data: csvData,
      message: `Exported ${csvData.length} members`
    });
  } catch (error) {
    next(error);
  }
});

// Export products to CSV
router.get('/export/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      order: [['product_code', 'ASC']]
    });

    // Format for CSV
    const csvData = products.map(product => ({
      'Kode Produk': product.product_code,
      'Nama Produk': product.name,
      'Kategori': product.category,
      'Deskripsi': product.description || '',
      'Satuan': product.unit,
      'Harga Beli': product.cost_price,
      'Harga Jual': product.selling_price,
      'Stok': product.stock,
      'Stok Minimum': product.min_stock,
      'Barcode': product.barcode || ''
    }));

    res.json({
      success: true,
      data: csvData,
      message: `Exported ${csvData.length} products`
    });
  } catch (error) {
    next(error);
  }
});

// Export savings to CSV
router.get('/export/savings', async (req, res, next) => {
  try {
    const savings = await Savings.findAll({
      include: [{ model: Member, as: 'member' }],
      order: [['account_number', 'ASC']]
    });

    // Format for CSV
    const csvData = savings.map(saving => ({
      'No. Rekening': saving.account_number,
      'Nama Anggota': saving.member?.name || '',
      'No. Anggota': saving.member?.member_number || '',
      'Jenis Simpanan': saving.savings_type_id,
      'Saldo': saving.balance,
      'Status': saving.is_active ? 'Aktif' : 'Tidak Aktif',
      'Tanggal Buka': saving.opened_date
    }));

    res.json({
      success: true,
      data: csvData,
      message: `Exported ${csvData.length} savings accounts`
    });
  } catch (error) {
    next(error);
  }
});

// Export loans to CSV
router.get('/export/loans', async (req, res, next) => {
  try {
    const loans = await Loan.findAll({
      include: [
        { model: Member, as: 'member' },
        { model: require('./LoanType'), as: 'loan_type' }
      ],
      order: [['created_at', 'DESC']]
    });

    // Format for CSV
    const csvData = loans.map(loan => ({
      'No. Pinjaman': loan.loan_number,
      'Nama Anggota': loan.member?.name || '',
      'No. Anggota': loan.member?.member_number || '',
      'Jenis Pinjaman': loan.loan_type?.name || '',
      'Jumlah Pinjaman': loan.principal_amount,
      'Bunga': loan.interest_rate + '%',
      'Jangka Waktu': loan.period_months + ' bulan',
      'Tanggal Mulai': loan.start_date,
      'Tanggal Jatuh Tempo': loan.end_date,
      'Pokok Dibayar': loan.principal_paid,
      'Bunga Dibayar': loan.interest_paid,
      'Sisa Pokok': parseFloat(loan.principal_amount) - parseFloat(loan.principal_paid),
      'Status': loan.status
    }));

    res.json({
      success: true,
      data: csvData,
      message: `Exported ${csvData.length} loans`
    });
  } catch (error) {
    next(error);
  }
});

// Get import template
router.get('/template/:type', (req, res) => {
  let template = [];

  switch (req.params.type) {
    case 'members':
      template = [
        {
          'Nomor Anggota': '',
          'Nama Lengkap': '',
          'No. KTP': '',
          'Tanggal Lahir': 'YYYY-MM-DD',
          'Jenis Kelamin': 'MALE/FEMALE',
          'Telepon': '',
          'Email': '',
          'Alamat': '',
          'Tanggal Bergabung': 'YYYY-MM-DD'
        }
      ];
      break;

    case 'products':
      template = [
        {
          'Kode Produk': '',
          'Nama Produk': '',
          'Kategori': '',
          'Deskripsi': '',
          'Satuan': 'PCS/KG/L',
          'Harga Beli': 0,
          'Harga Jual': 0,
          'Stok': 0,
          'Stok Minimum': 0,
          'Barcode': ''
        }
      ];
      break;

    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid template type'
      });
  }

  res.json({
    success: true,
    data: template,
    message: `Template for ${req.params.type} import`
  });
});

async function generateMemberNumber(MemberModel) {
  const prefix = 'ANG';
  const year = new Date().getFullYear();

  // Find last member number
  const lastMember = await MemberModel.findOne({
    order: [['member_number', 'DESC']],
    where: {
      member_number: {
        [require('sequelize').Op.like]: `${prefix}-${year}-%`
      }
    }
  });

  let nextNumber = 1;
  if (lastMember) {
    const lastNum = parseInt(lastMember.member_number.split('-')[2]);
    nextNumber = lastNum + 1;
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(3, '0')}`;
}

module.exports = router;
