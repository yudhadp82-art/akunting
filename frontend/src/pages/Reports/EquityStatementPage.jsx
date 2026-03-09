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
  Divider,
} from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

function EquityStatementPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({
        period: '31 Desember 2023',
        items: [
          { name: 'Simpanan Pokok', opening: 5000000, addition: 1000000, reduction: 0, closing: 6000000 },
          { name: 'Simpanan Wajib', opening: 12000000, addition: 2400000, reduction: 0, closing: 14400000 },
          { name: 'Dana Cadangan', opening: 2500000, addition: 500000, reduction: 0, closing: 3000000 },
          { name: 'SHU Tahun Berjalan', opening: 0, addition: 17500000, reduction: 0, closing: 17500000 },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <Typography>Memuat laporan...</Typography>;

  const totalOpening = data.items.reduce((sum, i) => sum + i.opening, 0);
  const totalAddition = data.items.reduce((sum, i) => sum + i.addition, 0);
  const totalReduction = data.items.reduce((sum, i) => sum + i.reduction, 0);
  const totalClosing = data.items.reduce((sum, i) => sum + i.closing, 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Laporan Perubahan Ekuitas</Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" align="center" gutterBottom>Koperasi Desa Sukamaju</Typography>
          <Typography variant="subtitle1" align="center" gutterBottom>Laporan Perubahan Ekuitas</Typography>
          <Typography variant="subtitle2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Untuk Periode yang Berakhir pada {data.period}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Keterangan</TableCell>
                  <TableCell align="right">Saldo Awal</TableCell>
                  <TableCell align="right">Penambahan</TableCell>
                  <TableCell align="right">Pengurangan</TableCell>
                  <TableCell align="right">Saldo Akhir</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell fontWeight="medium">{item.name}</TableCell>
                    <TableCell align="right">{formatCurrency(item.opening)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.addition)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.reduction)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">{formatCurrency(item.closing)}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#fafafa' }}>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">TOTAL EKUITAS</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">{formatCurrency(totalOpening)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">{formatCurrency(totalAddition)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">{formatCurrency(totalReduction)}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatCurrency(totalClosing)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EquityStatementPage;
