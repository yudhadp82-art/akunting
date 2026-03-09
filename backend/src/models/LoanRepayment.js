const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Loan = require('./Loan');

const LoanRepayment = sequelize.define('LoanRepayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  loan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'loans',
      key: 'id'
    }
  },
  repayment_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Sequence number'
  },
  principal_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  interest_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  paid_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'LATE'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  late_fee: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'loan_repayments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_loan_repayment', fields: ['loan_id', 'repayment_number'] },
    { name: 'idx_due_date', fields: ['due_date'] },
    { name: 'idx_status', fields: ['status'] }
  ]
});

// Define relationships
Loan.hasMany(LoanRepayment, { foreignKey: 'loan_id', as: 'repayments' });
LoanRepayment.belongsTo(Loan, { foreignKey: 'loan_id', as: 'loan' });

module.exports = LoanRepayment;
