const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const JournalEntry = require('./JournalEntry');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  transaction_type: {
    type: DataTypes.ENUM('SAVING_DEPOSIT', 'SAVING_WITHDRAWAL', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'SHU_DISTRIBUTION', 'ADJUSTMENT'),
    allowNull: false
  },
  reference_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  journal_entry_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'journal_entries',
      key: 'id'
    }
  },
  created_by: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'SYSTEM'
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_transaction_date', fields: ['transaction_date'] },
    { name: 'idx_transaction_type', fields: ['transaction_type'] },
    { name: 'idx_reference', fields: ['transaction_type', 'reference_id'] }
  ]
});

// Define relationships
JournalEntry.hasMany(Transaction, { foreignKey: 'journal_entry_id', as: 'transactions' });
Transaction.belongsTo(JournalEntry, { foreignKey: 'journal_entry_id', as: 'journal_entry' });

module.exports = Transaction;
