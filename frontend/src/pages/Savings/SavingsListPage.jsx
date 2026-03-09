import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSavings([
        {
          id: 1,
          account_number: 'SIMP-SP-2024-0001-123',
          member_name: 'Budi Santoso',
          savings_type: 'Simpanan Pokok',
          balance: 100000,
          opened_date: '2024-01-15',
          is_active: true,
        },
        {
          id: 2,
          account_number: 'SIMP-SW-2024-0001-456',
          member_name: 'Budi Santoso',
          savings_type: 'Simpanan Wajib',
          balance: 300000,
          opened_date: '2024-01-15',
          is_active: true,
        },
        {
          id: 3,
          account_number: 'SIMP-SS-2024-0001-789',
          member_name: 'Budi Santoso',
          savings_type: 'Simpanan Sukarela',
          balance: 1500000,
          opened_date: '2024-01-20',
          is_active: true,
        },
        {
          id: 4,
          account_number: 'SIMP-SP-2024-0002-321',
          member_name: 'Siti Aminah',
          savings_type: 'Simpanan Pokok',
          balance: 100000,
          opened_date: '2024-02-01',
          is_active: true,
        },
        {
          id: 5,
          account_number: 'SIMP-SW-2024-0002-654',
          member_name: 'Siti Aminah',
          savings_type: 'Simpanan Wajib',
          balance: 200000,
          opened_date: '2024-02-01',
          is_active: true,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleOpenTransaction = (mode) => {
    setDialogMode(mode);
    setOpenDialog(true);
  };

  const handleSubmitTransaction = (data) => {
    alert(`${data.mode === 'DEPOSIT' ? 'Setoran' : 'Penarikan'} sebesar ${formatCurrency(data.amount)} berhasil diproses.`);
    setOpenDialog(false);
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

