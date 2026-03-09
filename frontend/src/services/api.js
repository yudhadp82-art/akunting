import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Health check
  health: () => api.get('/health'),

  // Members
  getMembers: (params) => api.get('/members', { params }),
  getMember: (id) => api.get(`/members/${id}`),
  createMember: (data) => api.post('/members', data),
  updateMember: (id, data) => api.put(`/members/${id}`, data),
  deleteMember: (id) => api.delete(`/members/${id}`),

  // Savings
  getSavings: (params) => api.get('/savings', { params }),
  getSavingsAccount: (id) => api.get(`/savings/${id}`),
  createSavings: (data) => api.post('/savings', data),
  depositSavings: (id, data) => api.post(`/savings/${id}/deposit`, data),
  withdrawSavings: (id, data) => api.post(`/savings/${id}/withdraw`, data),
  closeSavings: (id) => api.delete(`/savings/${id}`),

  // Loans
  getLoans: (params) => api.get('/loans', { params }),
  getLoan: (id) => api.get(`/loans/${id}`),
  createLoan: (data) => api.post('/loans', data),
  approveLoan: (id, data) => api.post(`/loans/${id}/approve`, data),
  disburseLoan: (id) => api.post(`/loans/${id}/disburse`),
  loanRepayment: (id, data) => api.post(`/loans/${id}/repayment`, data),
  getLoanSchedule: (id) => api.get(`/loans/${id}/schedule`),

  // Accounting
  getAccounts: () => api.get('/accounting/accounts'),
  getAccount: (id) => api.get(`/accounting/accounts/${id}`),
  createAccount: (data) => api.post('/accounting/accounts', data),
  getJournalEntries: (params) => api.get('/accounting/journal', { params }),
  createJournalEntry: (data) => api.post('/accounting/journal', data),
  postJournalEntry: (id) => api.post(`/accounting/journal/${id}/post`),
  deleteJournalEntry: (id) => api.delete(`/accounting/journal/${id}`),
  getTrialBalance: (params) => api.get('/accounting/trial-balance', { params }),
  getLedger: (accountId, params) => api.get(`/accounting/ledger/${accountId}`, { params }),

  // Reports
  getBalanceSheet: (params) => api.get('/reports/balance-sheet', { params }),
  getIncomeStatement: (params) => api.get('/reports/income-statement', { params }),
  getEquity: (params) => api.get('/reports/equity', { params }),
  getCashFlow: (params) => api.get('/reports/cash-flow', { params }),
  getNotes: (params) => api.get('/reports/notes', { params }),
  getCombinedReports: (params) => api.get('/reports/combined', { params }),

  // SHU
  getSHUPeriods: (params) => api.get('/shu/periods', { params }),
  createSHUPeriod: (data) => api.post('/shu/periods', data),
  getSHUPeriod: (id) => api.get(`/shu/periods/${id}`),
  calculateSHU: (id) => api.post(`/shu/periods/${id}/calculate`),
  distributeSHU: (id) => api.post(`/shu/periods/${id}/distribute`),
  getSHUAllocationRules: () => api.get('/shu/allocation-rules'),
  getMemberSHUHistory: (memberId) => api.get(`/shu/member/${memberId}/history`),
  
  // POS
  getPOSTransactions: (params) => api.get('/pos/transactions', { params }),
  getPOSTransaction: (id) => api.get(`/pos/transactions/${id}`),
  createPOSTransaction: (data) => api.post('/pos/transactions', data),
  cancelPOSTransaction: (id) => api.post(`/pos/transactions/${id}/cancel`),
  getPOSProducts: (params) => api.get('/pos/products', { params }),
  getLowStockProducts: () => api.get('/pos/products/low-stock'),
  getPOSSummaryToday: () => api.get('/pos/summary/today'),

  // Data Management
  importData: (type, data) => api.post(`/data/import/${type}`, data),
  exportData: (type) => api.get(`/data/export/${type}`),
  getImportTemplate: (type) => api.get(`/data/template/${type}`),

  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),

  // External Data
  getExternalSourcesStatus: () => api.get('/external/sources/status'),
  importExternalMembers: (data) => api.post('/external/import/members/external', data),
  importExternalSavings: (data) => api.post('/external/import/savings/external', data),
  syncSavings: (data) => api.post('/external/sync/savings', data),
  testExternalConnection: (data) => api.post('/external/sources/test', data),
  scrapeVercelApp: (data) => api.post('/external/import/vercel/scrape', data),
};

export default api;
