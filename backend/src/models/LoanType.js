const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoanType = sequelize.define('LoanType', {
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
  description: {
    type: DataTypes.TEXT
  },
  max_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  default_interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  default_period_months: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  collateral_required: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'loan_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LoanType;
