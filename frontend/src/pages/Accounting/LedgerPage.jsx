import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { apiService } from '../../services/api';

function LedgerPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [summary, setSummary] = useState({
    openingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    closingBalance: 0,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await apiService.getAccounts();
      if (response.data.success) {
        setAccounts(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedAccountId(response.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  useEffect(() => {
    if (selectedAccountId) {
      fetchLedger();
    }
  }, [selectedAccountId, dateRange]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      };
      const response = await apiService.getLedger(selectedAccountId, params);
      if (response.data.success) {
        const entries = response.data.data.ledger;
        setLedgerEntries(entries);
        
        const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
        const totalCredit = entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
        const closing = entries.length > 0 ? entries[entries.length - 1].balance : 0;
        
        // In a real app, opening balance would come from the API
        // For now, we calculate it as closing - (totalDebit - totalCredit)
        const opening = closing - (totalDebit - totalCredit);

        setSummary({
          openingBalance: opening,
          totalDebit,
          totalCredit,
          closingBalance: closing,
        });
      }
    } catch (err) {
      console.error('Error fetching ledger:', err);
      setError('Gagal memuat data buku besar');
      // Fallback for demo if DB is not available
      setLedgerEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange({ ...dateRange, [field]: value });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Buku Besar</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Pilih Akun"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                {accounts.map((acc) => (
                  <MenuItem key={acc.id} value={acc.id}>
                    {acc.account_number} - {acc.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Dari Tanggal"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Sampai Tanggal"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="caption">Saldo Awal</Typography>
              <Typography variant="h6">{formatCurrency(summary.openingBalance)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Typography variant="caption">Total Debit (+)</Typography>
              <Typography variant="h6">{formatCurrency(summary.totalDebit)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'white' }}>
            <CardContent>
              <Typography variant="caption">Total Kredit (-)</Typography>
              <Typography variant="h6">{formatCurrency(summary.totalCredit)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="caption">Saldo Akhir</Typography>
              <Typography variant="h6">{formatCurrency(summary.closingBalance)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>No. Voucher</TableCell>
                  <TableCell>Keterangan</TableCell>
                  <TableCell align="right">Debit</TableCell>
                  <TableCell align="right">Kredit</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center"><CircularProgress size={24} sx={{ my: 2 }} /></TableCell>
                  </TableRow>
                ) : ledgerEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Tidak ada transaksi untuk periode ini</TableCell>
                  </TableRow>
                ) : (
                  ledgerEntries.map((entry, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {entry.voucher_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(entry.balance)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LedgerPage;