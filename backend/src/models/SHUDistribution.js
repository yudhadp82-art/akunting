const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const SHUPeriod = require('./SHUPeriod');
const Member = require('./Member');

const SHUDistribution = sequelize.define('SHUDistribution', {
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
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'members',
      key: 'id'
    }
  },
  jasa_modal_share: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Percentage for capital share'
  },
  jasa_usaha_share: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Percentage for business transactions'
  },
  jasa_modal_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  jasa_usaha_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total_shu_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  distributed_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'shu_distributions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_shu_period', fields: ['shu_period_id'] },
    { name: 'idx_member', fields: ['member_id'] },
    { name: 'idx_distributed', fields: ['distributed_date'] }
  ]
});

// Define relationships
SHUPeriod.hasMany(SHUDistribution, { foreignKey: 'shu_period_id', as: 'distributions' });
SHUDistribution.belongsTo(SHUPeriod, { foreignKey: 'shu_period_id', as: 'shu_period' });
Member.hasMany(SHUDistribution, { foreignKey: 'member_id', as: 'shu_distributions' });
SHUDistribution.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = SHUDistribution;
