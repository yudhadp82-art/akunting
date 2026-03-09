/**
 * Utility functions for generating codes, numbers, and IDs
 */

const generateVoucherNumber = (prefix = 'JV') => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${year}${month}${day}${random}`;
};

const generateMemberNumber = async (Member) => {
  const date = new Date();
  const year = date.getFullYear();
  const count = await Member.count();
  const number = (count + 1).toString().padStart(4, '0');
  return `ANGG-${year}-${number}`;
};

const generateSavingsAccountNumber = async (savingsType, memberId) => {
  const date = new Date();
  const year = date.getFullYear();
  const typeCode = savingsType.code;
  const memberIdStr = memberId.toString().padStart(4, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SIMP-${typeCode}-${year}-${memberIdStr}-${random}`;
};

const generateLoanNumber = async (Loan) => {
  const date = new Date();
  const year = date.getFullYear();
  const count = await Loan.count();
  const number = (count + 1).toString().padStart(4, '0');
  return `PINJ-${year}-${number}`;
};

const generateTransactionNumber = async (Model, prefix = 'TRX') => {
  const date = new Date();
  const year = date.getFullYear();
  const count = await Model.count();
  const number = (count + 1).toString().padStart(6, '0');
  return `${prefix}-${year}-${number}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

module.exports = {
  generateVoucherNumber,
  generateMemberNumber,
  generateSavingsAccountNumber,
  generateLoanNumber,
  generateTransactionNumber,
  formatCurrency,
  formatDate
};
