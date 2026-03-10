import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

function CashFlowPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        period: 'Tahun 2023',
        operating: [
          { name: 'Penerimaan dari Pendapatan Jasa Pinjaman', amount: 15000000 },
          { name: 'Penerimaan dari Jasa Lain-lain', amount: 2500000 },
          { name: 'Pembayaran Beban Operasional', amount: -5000000 },
          { name: 'Pembayaran Beban Lain-lain', amount: -1500000 },
        ],
        investing: [
          { name: 'Pembelian Peralatan Kantor', amount: -10000000 },
          { name: 'Penjualan Aset Tetap', amount: 2000000 },
        ],
        financing: [
          { name: 'Penerimaan Simpanan Pokok Baru', amount: 5000000 },
          { name: 'Penerimaan Simpanan Wajib', amount: 12000000 },
          { name: 'Penarikan Simpanan Sukarela', amount: -3000000 },
          { name: 'Pembayaran SHU ke Anggota', amount: -8000000 },
        ],
        openingBalance: 15000000,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <Typography>Memuat laporan...</Typography>;

  const netOperating = data.operating.reduce((sum, i) => sum + i.amount, 0);
  const netInvesting = data.investing.reduce((sum, i) => sum + i.amount, 0);
  const netFinancing = data.financing.reduce((sum, i) => sum + i.amount, 0);
  const netIncrease = netOperating + netInvesting + netFinancing;
  const closingBalance = data.openingBalance + netIncrease;

  const renderSection = (title, items, netAmount) => (
    <>
      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
        <TableCell colSpan={2}><Typography variant="subtitle2" fontWeight="bold">{title}</Typography></TableCell>
      </TableRow>
      {items.map((item, index) => (
        <TableRow key={index}>
          <TableCell sx={{ pl: 4 }}>{item.name}</TableCell>
          <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
        </TableRow>
      ))}
      <TableRow>
        <TableCell sx={{ pl: 4 }}><Typography fontWeight="bold">Arus Kas Bersih dari {title}</Typography></TableCell>
        <TableCell align="right"><Typography fontWeight="bold">{formatCurrency(netAmount)}</Typography></TableCell>
      </TableRow>
    </>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Laporan Arus Kas</Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>Koperasi Desa Sukamaju</Typography>
          <Typography variant="subtitle1" align="center" gutterBottom>Laporan Arus Kas</Typography>
          <Typography variant="subtitle2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Periode {data.period}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableBody>
                {renderSection('Aktivitas Operasi', data.operating, netOperating)}
                {renderSection('Aktivitas Investasi', data.investing, netInvesting)}
                {renderSection('Aktivitas Pendanaan', data.financing, netFinancing)}
                
                <TableRow sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <TableCell><Typography color="white" fontWeight="bold">KENAIKAN (PENURUNAN) BERSIH KAS</Typography></TableCell>
                  <TableCell align="right"><Typography color="white" fontWeight="bold">{formatCurrency(netIncrease)}</Typography></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Typography fontWeight="bold">SALDO KAS AWAL PERIODE</Typography></TableCell>
                  <TableCell align="right"><Typography fontWeight="bold">{formatCurrency(data.openingBalance)}</Typography></TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <TableCell><Typography color="white" variant="h6" fontWeight="bold">SALDO KAS AKHIR PERIODE</Typography></TableCell>
                  <TableCell align="right"><Typography color="white" variant="h6" fontWeight="bold">{formatCurrency(closingBalance)}</Typography></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CashFlowPage;
