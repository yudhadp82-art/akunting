const FirestoreModel = require('../utils/firestoreModel');

// Initialize all models as Firestore collections
const AccountType = new FirestoreModel('account_types');
const Account = new FirestoreModel('accounts');
const Member = new FirestoreModel('members');
const SavingsType = new FirestoreModel('savings_types');
const Savings = new FirestoreModel('savings');
const LoanType = new FirestoreModel('loan_types');
const Loan = new FirestoreModel('loans');
const LoanRepayment = new FirestoreModel('loan_repayments');
const JournalEntry = new FirestoreModel('journal_entries');
const JournalLine = new FirestoreModel('journal_lines');
const Transaction = new FirestoreModel('transactions');
const SHUPeriod = new FirestoreModel('shu_periods');
const SHUDistribution = new FirestoreModel('shu_distributions');
const SHUAllocationRule = new FirestoreModel('shu_allocation_rules');
const Product = new FirestoreModel('products');
const POSTransaction = new FirestoreModel('pos_transactions');
const POSLineItem = new FirestoreModel('pos_line_items');

// Mock sequelize for compatibility if needed
const sequelize = {
  transaction: async (callback) => {
    // In a real implementation, we would use Firestore transactions
    return await callback({});
  },
  authenticate: async () => true,
  sync: async () => true
};

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
  SHUAllocationRule,
  Product,
  POSTransaction,
  POSLineItem
};
