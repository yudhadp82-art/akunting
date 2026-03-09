const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JournalEntry = sequelize.define('JournalEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  voucher_number: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reference_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'SAVING, LOAN, MANUAL, etc.'
  },
  reference_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_by: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'SYSTEM'
  },
  is_posted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  posted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'journal_entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_voucher_number', fields: ['voucher_number'] },
    { name: 'idx_transaction_date', fields: ['transaction_date'] },
    { name: 'idx_reference', fields: ['reference_type', 'reference_id'] },
    { name: 'idx_status', fields: ['is_posted'] }
  ]
});

module.exports = JournalEntry;
