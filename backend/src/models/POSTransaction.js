const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');

const POSTransaction = sequelize.define('POSTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_number: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'members',
      key: 'id'
    }
  },
  transaction_type: {
    type: DataTypes.ENUM('CASH', 'CREDIT', 'TRANSFER'),
    allowNull: false,
    defaultValue: 'CASH'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  discount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tax: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  paid_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  change_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  payment_method: {
    type: DataTypes.ENUM('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'TRANSFER', 'E-WALLET'),
    allowNull: false,
    defaultValue: 'CASH'
  },
  notes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'COMPLETED'
  }
}, {
  tableName: 'pos_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_transaction_number', fields: ['transaction_number'] },
    { name: 'idx_member_id', fields: ['member_id'] },
    { name: 'idx_status', fields: ['status'] },
    { name: 'idx_transaction_date', fields: ['created_at'] }
  ]
});

POSTransaction.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = POSTransaction;
