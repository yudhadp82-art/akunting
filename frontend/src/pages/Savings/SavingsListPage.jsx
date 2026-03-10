import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import { Add as AddIcon, ArrowUpward as DepositIcon, ArrowDownward as WithdrawIcon } from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../utils/formatters';
import SavingsTransactionDialog from './SavingsTransactionDialog';

function SavingsListPage() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('DEPOSIT');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/savings/deposit') {
      setDialogMode('DEPOSIT');
      setOpenDialog(true);
    } else if (location.pathname === '/savings/withdraw') {
      setDialogMode('WITHDRAW');
      setOpenDialog(true);
    }
  }, [location]);

  const fetchSavings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getSavings();
      if (response.data.success) {
        setSavings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching savings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const handleOpenTransaction = (mode) => {
    setDialogMode(mode);
    setOpenDialog(true);
  };

  const handleSubmitTransaction = async (data) => {
    try {
      if (data.mode === 'DEPOSIT') {
        await apiService.depositSavings(data.savings_id, { amount: data.amount, description: data.description });
      } else {
        await apiService.withdrawSavings(data.savings_id, { amount: data.amount, description: data.description });
      }
      alert(`${data.mode === 'DEPOSIT' ? 'Setoran' : 'Penarikan'} sebesar ${formatCurrency(data.amount)} berhasil diproses.`);
      setOpenDialog(false);
      fetchSavings();
    } catch (err) {
      console.error('Error processing transaction:', err);
      alert('Gagal memproses transaksi.');
    }
  };

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
        <Typography variant="h4">Manajemen Simpanan</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DepositIcon />}
            onClick={() => handleOpenTransaction('DEPOSIT')}
            sx={{ mr: 1 }}
          >
            Setoran
          </Button>
          <Button
            variant="outlined"
            startIcon={<WithdrawIcon />}
            color="warning"
            onClick={() => handleOpenTransaction('WITHDRAW')}
            sx={{ mr: 1 }}
          >
            Penarikan
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => alert('Form buka rekening simpanan akan muncul di sini')}
          >
            Buka Rekening
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nomor Rekening</TableCell>
                  <TableCell>Nama Anggota</TableCell>
                  <TableCell>Jenis Simpanan</TableCell>
                  <TableCell>Saldo</TableCell>
                  <TableCell>Tanggal Buka</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : savings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Tidak ada rekening simpanan
                    </TableCell>
                  </TableRow>
                ) : (
                  savings.map((saving) => (
                    <TableRow key={saving.id} hover>
                      <TableCell>{saving.account_number}</TableCell>
                      <TableCell>{saving.member_name}</TableCell>
                      <TableCell>{saving.savings_type}</TableCell>
                      <TableCell>{formatCurrency(saving.balance)}</TableCell>
                      <TableCell>{formatDate(saving.opened_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={saving.is_active ? 'Aktif' : 'Tidak Aktif'}
                          color={saving.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                          onClick={() => handleOpenTransaction('DEPOSIT')}
                        >
                          Setor
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleOpenTransaction('WITHDRAW')}
                        >
                          Tarik
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <SavingsTransactionDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitTransaction}
        mode={dialogMode}
      />
    </Box>
  );
}

export default SavingsListPage;

