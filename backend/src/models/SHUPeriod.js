const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SHUPeriod = sequelize.define('SHUPeriod', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'e.g., Tahun Buku 2025'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  total_revenue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_expense: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  net_income: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'CALCULATED', 'DISTRIBUTED', 'CLOSED'),
    allowNull: false,
    defaultValue: 'OPEN'
  },
  calculated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  distributed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'shu_periods',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_dates', fields: ['start_date', 'end_date'] },
    { name: 'idx_status', fields: ['status'] }
  ]
});

module.exports = SHUPeriod;
