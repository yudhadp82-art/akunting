const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const JournalEntry = require('./JournalEntry');
const Account = require('./Account');
const Member = require('./Member');

const JournalLine = sequelize.define('JournalLine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  journal_entry_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'journal_entries',
      key: 'id'
    }
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  debit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  credit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  description: {
    type: DataTypes.TEXT
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'members',
      key: 'id'
    },
    comment: 'If related to a member'
  }
}, {
  tableName: 'journal_lines',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { name: 'idx_journal_entry', fields: ['journal_entry_id'] },
    { name: 'idx_account', fields: ['account_id'] },
    { name: 'idx_member', fields: ['member_id'] }
  ]
});

// Define relationships
JournalEntry.hasMany(JournalLine, { foreignKey: 'journal_entry_id', as: 'lines' });
JournalLine.belongsTo(JournalEntry, { foreignKey: 'journal_entry_id', as: 'journal_entry' });
Account.hasMany(JournalLine, { foreignKey: 'account_id', as: 'journal_lines' });
JournalLine.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });
Member.hasMany(JournalLine, { foreignKey: 'member_id', as: 'journal_lines' });
JournalLine.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = JournalLine;
