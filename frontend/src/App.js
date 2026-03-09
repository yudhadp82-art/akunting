import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

// Import pages
import Dashboard from './pages/Dashboard';
import MemberListPage from './pages/Members/MemberListPage';
import SavingsListPage from './pages/Savings/SavingsListPage';
import LoanListPage from './pages/Loans/LoanListPage';
import JournalEntriesPage from './pages/Accounting/JournalEntriesPage';
import LedgerPage from './pages/Accounting/LedgerPage';
import TrialBalancePage from './pages/Accounting/TrialBalancePage';
import BalanceSheetPage from './pages/Reports/BalanceSheetPage';
import IncomeStatementPage from './pages/Reports/IncomeStatementPage';
import EquityStatementPage from './pages/Reports/EquityStatementPage';
import CashFlowPage from './pages/Reports/CashFlowPage';
import SHUPeriodsPage from './pages/SHU/SHUPeriodsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POS/POSPage';
import ProductManagementPage from './pages/POS/ProductManagementPage';
import DataImportPage from './pages/DataManagement/DataImportPage';
import DataExportPage from './pages/DataManagement/DataExportPage';
import ExternalDataImportPage from './pages/DataManagement/ExternalDataImportPage';
import AppLayout from './components/layout/AppLayout';

// Placeholder for missing pages
const PlaceholderPage = ({ title }) => (
  <div style={{ padding: '20px' }}>
    <h2>{title}</h2>
    <p>Halaman ini sedang dalam pengembangan.</p>
  </div>
);

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#2e7d32',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<MemberListPage />} />
            
            {/* Simpanan */}
            <Route path="/savings" element={<SavingsListPage />} />
            <Route path="/savings/deposit" element={<SavingsListPage />} />
            <Route path="/savings/withdraw" element={<SavingsListPage />} />
            
            {/* Pinjaman */}
            <Route path="/loans" element={<LoanListPage />} />
            <Route path="/loans/new" element={<PlaceholderPage title="Pengajuan Pinjaman Baru" />} />
            
            {/* Akuntansi */}
            <Route path="/accounting/journal" element={<JournalEntriesPage />} />
            <Route path="/accounting/ledger" element={<LedgerPage />} />
            <Route path="/accounting/trial-balance" element={<TrialBalancePage />} />
            
            {/* Laporan */}
            <Route path="/reports/balance-sheet" element={<BalanceSheetPage />} />
            <Route path="/reports/income-statement" element={<IncomeStatementPage />} />
            <Route path="/reports/equity" element={<EquityStatementPage />} />
            <Route path="/reports/cash-flow" element={<CashFlowPage />} />

            {/* POS */}
            <Route path="/pos" element={<POSPage />} />
            <Route path="/pos/products" element={<ProductManagementPage />} />

            {/* Data Management */}
            <Route path="/data/import" element={<DataImportPage />} />
            <Route path="/data/export" element={<DataExportPage />} />
            <Route path="/data/external" element={<ExternalDataImportPage />} />

            {/* SHU */}
            <Route path="/shu" element={<SHUPeriodsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
