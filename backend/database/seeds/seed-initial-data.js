/**
 * Initial Data Seed Script
 * Seeds initial data for the Koperasi Desa application
 */

const { sequelize, AccountType, Account, SavingsType, LoanType } = require('../../src/models');
const { ACCOUNT_TYPES } = require('../../src/config/constants');

const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed Account Types
    console.log('Seeding Account Types...');
    await AccountType.bulkCreate([
      {
        code: 'ASSET',
        name: 'Aset',
        category: ACCOUNT_TYPES.ASSET,
        sak_ep_category: 'ASET',
        is_debit_balance: true,
        description: 'Klasifikasi akun aset sesuai SAK EP'
      },
      {
        code: 'LIABILITY',
        name: 'Kewajiban',
        category: ACCOUNT_TYPES.LIABILITY,
        sak_ep_category: 'KEWAJIBAN',
        is_debit_balance: false,
        description: 'Klasifikasi akun kewajiban sesuai SAK EP'
      },
      {
        code: 'EQUITY',
        name: 'Ekuitas',
        category: ACCOUNT_TYPES.EQUITY,
        sak_ep_category: 'EKUITAS',
        is_debit_balance: false,
        description: 'Klasifikasi akun ekuitas sesuai SAK EP'
      },
      {
        code: 'REVENUE',
        name: 'Pendapatan',
        category: ACCOUNT_TYPES.REVENUE,
        sak_ep_category: 'PENDAPATAN',
        is_debit_balance: false,
        description: 'Klasifikasi akun pendapatan sesuai SAK EP'
      },
      {
        code: 'EXPENSE',
        name: 'Beban',
        category: ACCOUNT_TYPES.EXPENSE,
        sak_ep_category: 'BEBAN',
        is_debit_balance: true,
        description: 'Klasifikasi akun beban sesuai SAK EP'
      }
    ]);

    // Get account type IDs
    const assetType = await AccountType.findOne({ where: { code: 'ASSET' } });
    const liabilityType = await AccountType.findOne({ where: { code: 'LIABILITY' } });
    const equityType = await AccountType.findOne({ where: { code: 'EQUITY' } });
    const revenueType = await AccountType.findOne({ where: { code: 'REVENUE' } });
    const expenseType = await AccountType.findOne({ where: { code: 'EXPENSE' } });

    // Seed Chart of Accounts (SAK EP Compliant)
    console.log('Seeding Chart of Accounts...');
    await Account.bulkCreate([
      // ASSETS - Current Assets (Aset Lancar)
      { account_number: '1-1-1-01', name: 'Kas dan Bank', account_type_id: assetType.id, is_active: true, description: 'Kas tunai dan rekening bank' },
      { account_number: '1-1-2-01', name: 'Piutang Anggota', account_type_id: assetType.id, is_active: true, description: 'Piutang pinjaman kepada anggota' },
      { account_number: '1-1-3-01', name: 'Piutang Lain-lain', account_type_id: assetType.id, is_active: true, description: 'Piutang selain dari anggota' },
      // ASSETS - Fixed Assets (Aset Tetap)
      { account_number: '1-2-1-01', name: 'Peralatan dan Kendaraan', account_type_id: assetType.id, is_active: true, description: 'Aset tetap berwujud' },
      { account_number: '1-2-2-01', name: 'Akumulasi Penyusutan', account_type_id: assetType.id, is_active: true, description: 'Akumulasi penyusutan aset tetap' },

      // LIABILITIES - Current Liabilities (Kewajiban Jangka Pendek)
      { account_number: '2-1-1-01', name: 'Simpanan Anggota', account_type_id: liabilityType.id, is_active: true, description: 'Total simpanan anggota' },
      { account_number: '2-1-1-02', name: 'Simpanan Pokok', account_type_id: liabilityType.id, is_active: true, description: 'Simpanan pokok anggota' },
      { account_number: '2-1-1-03', name: 'Simpanan Wajib', account_type_id: liabilityType.id, is_active: true, description: 'Simpanan wajib anggota' },
      { account_number: '2-1-1-04', name: 'Simpanan Sukarela', account_type_id: liabilityType.id, is_active: true, description: 'Simpanan sukarela anggota' },
      { account_number: '2-1-2-01', name: 'Utang Pihak Ketiga', account_type_id: liabilityType.id, is_active: true, description: 'Utang kepada pihak ketiga' },
      { account_number: '2-1-3-01', name: 'Bagian SHU yang Belum Dibagikan', account_type_id: liabilityType.id, is_active: true, description: 'SHU yang belum dibagikan ke anggota' },

      // EQUITY
      { account_number: '3-1-1-01', name: 'Simpanan Pokok', account_type_id: equityType.id, is_active: true, description: 'Modal awal koperasi dari simpanan pokok' },
      { account_number: '3-1-2-01', name: 'Dana Cadangan', account_type_id: equityType.id, is_active: true, description: 'Dana cadangan koperasi' },
      { account_number: '3-1-3-01', name: 'SHU Tahun Berjalan', account_type_id: equityType.id, is_active: true, description: 'SHU tahun berjalan' },
      { account_number: '3-1-4-01', name: 'SHU Tahun Lalu', account_type_id: equityType.id, is_active: true, description: 'SHU yang belum dibagikan tahun lalu' },

      // REVENUE
      { account_number: '4-1-1-01', name: 'Pendapatan Jasa Pinjaman', account_type_id: revenueType.id, is_active: true, description: 'Pendapatan bunga pinjaman' },
      { account_number: '4-1-2-01', name: 'Pendapatan Jasa Lain-lain', account_type_id: revenueType.id, is_active: true, description: 'Pendapatan jasa lain-lain' },
      { account_number: '4-1-3-01', name: 'Pendapatan Usaha Lain-lain', account_type_id: revenueType.id, is_active: true, description: 'Pendapatan usaha lain-lain' },

      // EXPENSES
      { account_number: '5-1-1-01', name: 'Beban Operasional', account_type_id: expenseType.id, is_active: true, description: 'Beban operasional koperasi' },
      { account_number: '5-1-2-01', name: 'Beban Penyusutan', account_type_id: expenseType.id, is_active: true, description: 'Beban penyusutan aset tetap' },
      { account_number: '5-1-3-01', name: 'Beban Lain-lain', account_type_id: expenseType.id, is_active: true, description: 'Beban lain-lain' },
      { account_number: '5-1-4-01', name: 'Beban Pembagian SHU', account_type_id: expenseType.id, is_active: true, description: 'Beban pembagian SHU ke anggota' }
    ]);

    // Seed Savings Types
    console.log('Seeding Savings Types...');
    await SavingsType.bulkCreate([
      {
        code: 'SP',
        name: 'Simpanan Pokok',
        description: 'Simpanan wajib awal keanggotaan sebagai modal dasar',
        is_mandatory: true,
        minimum_amount: 100000,
        interest_rate: 0
      },
      {
        code: 'SW',
        name: 'Simpanan Wajib',
        description: 'Simpanan wajib bulanan dari anggota',
        is_mandatory: true,
        minimum_amount: 50000,
        interest_rate: 0.5
      },
      {
        code: 'SS',
        name: 'Simpanan Sukarela',
        description: 'Simpanan sukarela dengan bunga',
        is_mandatory: false,
        minimum_amount: 10000,
        interest_rate: 3
      }
    ]);

    // Seed Loan Types
    console.log('Seeding Loan Types...');
    await LoanType.bulkCreate([
      {
        code: 'P1',
        name: 'Pinjaman Mikro',
        description: 'Pinjaman kecil untuk usaha mikro',
        max_amount: 5000000,
        default_interest_rate: 2.00,
        default_period_months: 12,
        collateral_required: false
      },
      {
        code: 'P2',
        name: 'Pinjaman Menengah',
        description: 'Pinjaman untuk usaha menengah',
        max_amount: 20000000,
        default_interest_rate: 1.75,
        default_period_months: 24,
        collateral_required: true
      },
      {
        code: 'P3',
        name: 'Pinjaman Konsumtif',
        description: 'Pinjaman untuk kebutuhan konsumtif',
        max_amount: 10000000,
        default_interest_rate: 1.50,
        default_period_months: 18,
        collateral_required: true
      }
    ]);

    console.log('Database seeding completed successfully!');
    console.log('Summary:');
    console.log('  - Account Types: 5');
    console.log('  - Chart of Accounts: 20');
    console.log('  - Savings Types: 3');
    console.log('  - Loan Types: 3');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

module.exports = seed;
