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

function TrialBalancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        { code: '1-1-1-01', name: 'Kas dan Bank', debit: 5650000, credit: 0 },
        { code: '1-1-2-01', name: 'Piutang Anggota', debit: 11583334, credit: 0 },
        { code: '1-2-1-01', name: 'Peralatan dan Kendaraan', debit: 15000000, credit: 0 },
        { code: '1-2-2-01', name: 'Akumulasi Penyusutan', debit: 0, credit: 3000000 },
        { code: '2-1-1-01', name: 'Simpanan Pokok', debit: 0, credit: 5000000 },
        { code: '2-1-1-02', name: 'Simpanan Wajib', debit: 0, credit: 8500000 },
        { code: '2-1-1-03', name: 'Simpanan Sukarela', debit: 0, credit: 12450000 },
        { code: '3-1-1-01', name: 'Modal Awal', debit: 0, credit: 2000000 },
        { code: '4-1-1-01', name: 'Pendapatan Jasa Pinjaman', debit: 0, credit: 1583334 },
        { code: '5-1-1-01', name: 'Beban Operasional', debit: 250000, credit: 0 },
      ];

      setData(mockData);
      const totalDebit = mockData.reduce((sum, item) => sum + item.debit, 0);
      const totalCredit = mockData.reduce((sum, item) => sum + item.credit, 0);
      setTotals({ debit: totalDebit, credit: totalCredit });
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Neraca Saldo</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Periode: Maret 2024
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Kode Akun</TableCell>
                  <TableCell>Nama Akun</TableCell>
                  <TableCell align="right">Debit</TableCell>
                  <TableCell align="right">Kredit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Memuat data...</TableCell>
                  </TableRow>
                ) : (
                  <>
                    {data.map((row) => (
                      <TableRow key={row.code} hover>
                        <TableCell>{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">
                          {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                      <TableCell colSpan={2} align="right">
                        <Typography variant="subtitle1" fontWeight="bold">TOTAL</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          {formatCurrency(totals.debit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          {formatCurrency(totals.credit)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totals.debit !== totals.credit && !loading && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
              <Typography color="error" variant="body2">
                ⚠️ Peringatan: Neraca tidak seimbang. Selisih: {formatCurrency(Math.abs(totals.debit - totals.credit))}
              </Typography>
            </Box>
          )}
          {totals.debit === totals.credit && !loading && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'success.lighter', borderRadius: 1 }}>
              <Typography color="success.main" variant="body2">
                ✅ Neraca seimbang (Balanced).
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default TrialBalancePage;
