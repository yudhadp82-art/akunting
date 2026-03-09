import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';

function BalanceSheetPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReport();
  }, [asOfDate]);

  const loadReport = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReportData({
        title: 'Laporan Posisi Keuangan',
        subtitle: `Per Tanggal ${new Date(asOfDate).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        assets: {
          current: [
            { account_number: '1-1-1-01', name: 'Kas dan Bank', balance: 125000000 },
            { account_number: '1-1-2-01', name: 'Piutang Anggota', balance: 45000000 },
            { account_number: '1-1-3-01', name: 'Piutang Lain-lain', balance: 5000000 },
          ],
          fixed: [
            { account_number: '1-2-1-01', name: 'Peralatan dan Kendaraan', balance: 15000000 },
            {
              account_number: '1-2-2-01',
              name: 'Akumulasi Penyusutan',
              balance: -3000000,
            },
          ],
          total: 182000000,
        },
        liabilities: {
          current: [
            { account_number: '2-1-1-02', name: 'Simpanan Pokok', balance: 50000000 },
            { account_number: '2-1-1-03', name: 'Simpanan Wajib', balance: 30000000 },
            { account_number: '2-1-1-04', name: 'Simpanan Sukarela', balance: 68000000 },
          ],
          long_term: [],
          total: 148000000,
        },
        equity: {
          total: 34000000,
          items: [
            { account_number: '3-1-1-01', name: 'Simpanan Pokok', balance: 30000000 },
            { account_number: '3-1-2-01', name: 'Dana Cadangan', balance: 2500000 },
            { account_number: '3-1-3-01', name: 'SHU Tahun Berjalan', balance: 1500000 },
          ],
        },
      });
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return <Typography>Memuat laporan...</Typography>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Laporan Posisi Keuangan</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Cetak
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {reportData.title}
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          {reportData.subtitle}
        </Typography>
        <Typography variant="caption" align="center" display="block">
          (Dalam Rupiah)
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                ASET
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Aset Lancar
                </Typography>
                {reportData.assets.current.map((account) => (
                  <Box
                    key={account.account_number}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 0.5,
                      pl: 2,
                    }}
                  >
                    <Typography variant="body2">{account.name}</Typography>
                    <Typography variant="body2">
                      {formatCurrency(account.balance)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Aset Tetap
                </Typography>
                {reportData.assets.fixed.map((account) => (
                  <Box
                    key={account.account_number}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 0.5,
                      pl: 2,
                    }}
                  >
                    <Typography variant="body2">{account.name}</Typography>
                    <Typography variant="body2">
                      {formatCurrency(account.balance)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '2px solid',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Total Aset
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatCurrency(reportData.assets.total)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                KEWAJIBAN DAN EKUITAS
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Kewajiban Jangka Pendek
                </Typography>
                {reportData.liabilities.current.map((account) => (
                  <Box
                    key={account.account_number}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 0.5,
                      pl: 2,
                    }}
                  >
                    <Typography variant="body2">{account.name}</Typography>
                    <Typography variant="body2">
                      {formatCurrency(account.balance)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1,
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Total Kewajiban
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {formatCurrency(reportData.liabilities.total)}
                </Typography>
              </Box>

              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Ekuitas
                </Typography>
                {reportData.equity.items.map((account) => (
                  <Box
                    key={account.account_number}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 0.5,
                      pl: 2,
                    }}
                  >
                    <Typography variant="body2">{account.name}</Typography>
                    <Typography variant="body2">
                      {formatCurrency(account.balance)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1,
                  borderTop: '1px solid',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Total Ekuitas
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {formatCurrency(reportData.equity.total)}
                </Typography>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '2px solid',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Total Kewajiban dan Ekuitas
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatCurrency(reportData.liabilities.total + reportData.equity.total)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BalanceSheetPage;
