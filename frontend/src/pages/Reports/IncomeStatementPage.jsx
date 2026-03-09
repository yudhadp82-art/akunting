import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Grid,
  TextField,
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

function IncomeStatementPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReportData({
        title: 'Laporan Laba Rugi dan Penghasilan Komprehensif Lain',
        subtitle: `Periode ${new Date(startDate).toLocaleDateString('id-ID')} s.d. ${new Date(endDate).toLocaleDateString('id-ID')}`,
        revenues: {
          items: [
            { account_number: '4-1-1-01', name: 'Pendapatan Jasa Pinjaman', amount: 45000000 },
            { account_number: '4-1-2-01', name: 'Pendapatan Jasa Lain-lain', amount: 5000000 },
            { account_number: '4-1-3-01', name: 'Pendapatan Usaha Lain-lain', amount: 2000000 },
          ],
          total: 52000000,
        },
        expenses: {
          items: [
            { account_number: '5-1-1-01', name: 'Beban Operasional', amount: 25000000 },
            { account_number: '5-1-2-01', name: 'Beban Penyusutan', amount: 3000000 },
            { account_number: '5-1-3-01', name: 'Beban Lain-lain', amount: 2000000 },
          ],
          total: 30000000,
        },
        netIncome: 22000000,
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
        <Typography variant="h4">Laporan Laba Rugi</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            label="Dari Tanggal"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            type="date"
            label="Sampai Tanggal"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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

      <Card>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            PENDAPATAN
          </Typography>

          {reportData.revenues.items.map((item) => (
            <Box
              key={item.account_number}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 0.5,
                pl: 4,
              }}
            >
              <Typography variant="body2">{item.name}</Typography>
              <Typography variant="body2">{formatCurrency(item.amount)}</Typography>
            </Box>
          ))}

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
              Total Pendapatan
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {formatCurrency(reportData.revenues.total)}
            </Typography>
          </Box>

          <Typography variant="h6" color="primary" sx={{ mt: 4 }} gutterBottom>
            BEBAN
          </Typography>

          {reportData.expenses.items.map((item) => (
            <Box
              key={item.account_number}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                py: 0.5,
                pl: 4,
              }}
            >
              <Typography variant="body2">{item.name}</Typography>
              <Typography variant="body2">{formatCurrency(item.amount)}</Typography>
            </Box>
          ))}

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
              Total Beban
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {formatCurrency(reportData.expenses.total)}
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 4,
              pt: 2,
              borderTop: '2px solid',
              borderBottom: '2px solid',
              pb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              bgcolor: reportData.netIncome >= 0 ? '#e8f5e9' : '#ffebee',
              px: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              {reportData.netIncome >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={reportData.netIncome >= 0 ? 'success' : 'error'}>
              {formatCurrency(reportData.netIncome)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default IncomeStatementPage;
