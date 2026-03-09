const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Member = require('./Member');
const SavingsType = require('./SavingsType');

const Savings = sequelize.define('Savings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account_number: {
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
  savings_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'savings_types',
      key: 'id'
    }
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  opened_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  closed_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'savings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_member_savings', fields: ['member_id', 'savings_type_id'] },
    { name: 'idx_account_number', fields: ['account_number'] }
  ]
});

// Define relationships
Member.hasMany(Savings, { foreignKey: 'member_id', as: 'savings' });
Savings.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
SavingsType.hasMany(Savings, { foreignKey: 'savings_type_id', as: 'savings' });
Savings.belongsTo(SavingsType, { foreignKey: 'savings_type_id', as: 'savings_type' });

module.exports = Savings;
