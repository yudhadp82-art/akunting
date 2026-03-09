const { sequelize } = require('../config/database');

// Import all models
const AccountType = require('./AccountType');
const Account = require('./Account');
const Member = require('./Member');
const SavingsType = require('./SavingsType');
const Savings = require('./Savings');
const LoanType = require('./LoanType');
const Loan = require('./Loan');
const LoanRepayment = require('./LoanRepayment');
const JournalEntry = require('./JournalEntry');
const JournalLine = require('./JournalLine');
const Transaction = require('./Transaction');
const SHUPeriod = require('./SHUPeriod');
const SHUDistribution = require('./SHUDistribution');
const SHUAllocationRule = require('./SHUAllocationRule');

// Export all models
module.exports = {
  sequelize,
  AccountType,
  Account,
  Member,
  SavingsType,
  Savings,
  LoanType,
  Loan,
  LoanRepayment,
  JournalEntry,
  JournalLine,
  Transaction,
  SHUPeriod,
  SHUDistribution,
  SHUAllocationRule
};
