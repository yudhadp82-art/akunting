const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AccountType = sequelize.define('AccountType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'),
    allowNull: false
  },
  sak_ep_category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'SAK EP classification'
  },
  is_debit_balance: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'account_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AccountType;
