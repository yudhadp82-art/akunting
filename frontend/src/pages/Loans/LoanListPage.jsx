import React, { useEffect, useState, useCallback } from 'react';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { formatCurrency, getStatusLabel, getStatusColor } from '../../utils/formatters';
import LoanApplicationDialog from './LoanApplicationDialog';

function LoanListPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        search: searchTerm
      };
      const response = await apiService.getLoans(params);
      if (response.data.success) {
        setLoans(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleApplyLoan = () => {
    setOpenDialog(true);
  };

  const handleSubmitLoan = async (data) => {
    try {
      await apiService.createLoan(data);
      alert(`Pengajuan pinjaman sebesar ${formatCurrency(data.principal_amount)} berhasil didaftarkan.`);
      setOpenDialog(false);
      fetchLoans();
    } catch (err) {
      console.error('Error applying for loan:', err);
      alert('Gagal mengajukan pinjaman.');
    }
  };

  const handleApproveLoan = async (loanId) => {
    if (window.confirm('Setujui pengajuan pinjaman ini?')) {
      try {
        await apiService.approveLoan(loanId);
        alert('Pinjaman berhasil disetujui.');
        fetchLoans();
      } catch (err) {
        console.error('Error approving loan:', err);
        alert('Gagal menyetujui pinjaman.');
      }
    }
  };

  const filteredLoans = loans.filter(
    (loan) =>
      (loan.member?.full_name || loan.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loan_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const remainingBalance = (loan) => {
    return parseFloat(loan.principal_amount) - parseFloat(loan.principal_paid);
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
        <Typography variant="h4">Manajemen Pinjaman</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleApplyLoan}
        >
          Ajukan Pinjaman
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Cari pinjaman berdasarkan nama atau nomor pinjaman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nomor Pinjaman</TableCell>
                  <TableCell>Nama Anggota</TableCell>
                  <TableCell>Jenis Pinjaman</TableCell>
                  <TableCell>Jumlah</TableCell>
                  <TableCell>Bunga</TableCell>
                  <TableCell>Jangka Waktu</TableCell>
                  <TableCell>Sisa Pokok</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Tidak ada pinjaman
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan) => (
                    <TableRow key={loan.id} hover>
                      <TableCell>{loan.loan_number}</TableCell>
                      <TableCell>{loan.member?.full_name || loan.member_name}</TableCell>
                      <TableCell>{loan.loan_type?.name || loan.loan_type}</TableCell>
                      <TableCell>{formatCurrency(loan.principal_amount)}</TableCell>
                      <TableCell>{loan.interest_rate}% / bulan</TableCell>
                      <TableCell>{loan.period_months} bulan</TableCell>
                      <TableCell>{formatCurrency(remainingBalance(loan))}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(loan.status)}
                          color={getStatusColor(loan.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {loan.status === 'PENDING' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            sx={{ mr: 1 }}
                            onClick={() => handleApproveLoan(loan.id)}
                          >
                            Setujui
                          </Button>
                        )}
                        {loan.status === 'ACTIVE' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => alert(`Bayar angsuran ${loan.loan_number}`)}
                          >
                            Bayar
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                          onClick={() => alert(`Detail ${loan.loan_number}`)}
                        >
                          Detail
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

      <LoanApplicationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitLoan}
      />
    </Box>
  );
}

export default LoanListPage;
