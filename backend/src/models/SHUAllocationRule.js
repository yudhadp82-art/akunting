const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const SHUPeriod = require('./SHUPeriod');

const SHUAllocationRule = sequelize.define('SHUAllocationRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shu_period_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shu_periods',
      key: 'id'
    }
  },
  allocation_type: {
    type: DataTypes.ENUM('JASA_MODAL', 'JASA_USAHA', 'PENDIDIKAN', 'SOSIAL', 'DANA_CADANGAN'),
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'shu_allocation_rules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_shu_period', fields: ['shu_period_id'] },
    { name: 'idx_allocation_type', fields: ['allocation_type'] }
  ]
});

// Define relationships
SHUPeriod.hasMany(SHUAllocationRule, { foreignKey: 'shu_period_id', as: 'allocation_rules' });
SHUAllocationRule.belongsTo(SHUPeriod, { foreignKey: 'shu_period_id', as: 'shu_period' });

module.exports = SHUAllocationRule;
