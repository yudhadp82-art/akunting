const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');
const LoanType = require('./LoanType');

const Loan = sequelize.define('Loan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  loan_number: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'members',
      key: 'id'
    }
  },
  loan_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'loan_types',
      key: 'id'
    }
  },
  principal_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  period_months: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  principal_paid: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  interest_paid: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  collateral_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  approved_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'loans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_member_loans', fields: ['member_id'] },
    { name: 'idx_status', fields: ['status'] },
    { name: 'idx_loan_number', fields: ['loan_number'] }
  ]
});

// Define relationships
Member.hasMany(Loan, { foreignKey: 'member_id', as: 'loans' });
Loan.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
LoanType.hasMany(Loan, { foreignKey: 'loan_type_id', as: 'loans' });
Loan.belongsTo(LoanType, { foreignKey: 'loan_type_id', as: 'loan_type' });

module.exports = Loan;
