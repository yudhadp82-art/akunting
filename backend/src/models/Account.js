const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const AccountType = require('./AccountType');

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  account_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'account_types',
      key: 'id'
    }
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'accounts',
      key: 'id'
    },
    comment: 'For hierarchical accounts'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_account_number', fields: ['account_number'] },
    { name: 'idx_account_type', fields: ['account_type_id'] }
  ]
});

// Define relationships
AccountType.hasMany(Account, { foreignKey: 'account_type_id', as: 'accounts' });
Account.belongsTo(AccountType, { foreignKey: 'account_type_id', as: 'account_type' });
Account.belongsTo(Account, { foreignKey: 'parent_id', as: 'parent' });
Account.hasMany(Account, { foreignKey: 'parent_id', as: 'children' });

module.exports = Account;
