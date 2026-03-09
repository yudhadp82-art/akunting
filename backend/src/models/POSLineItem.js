const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('./Product');
const POSTransaction = require('./POSTransaction');

const POSLineItem = sequelize.define('POSLineItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pos_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pos_transactions',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  product_code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  discount: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Discount percentage'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'pos_line_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_pos_transaction_id', fields: ['pos_transaction_id'] },
    { name: 'idx_product_id', fields: ['product_id'] }
  ]
});

POSTransaction.hasMany(POSLineItem, { foreignKey: 'pos_transaction_id', as: 'line_items' });
POSLineItem.belongsTo(POSTransaction, { foreignKey: 'pos_transaction_id', as: 'transaction' });

POSLineItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = POSLineItem;
