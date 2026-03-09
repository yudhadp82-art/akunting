import React, { useEffect, useState } from 'react';
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
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../utils/formatters';
import LoanApplicationDialog from './LoanApplicationDialog';

function LoanListPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const handleApplyLoan = () => {
    setOpenDialog(true);
  };

  const handleSubmitLoan = (data) => {
    const newLoan = {
      ...data,
      id: loans.length + 1,
      loan_number: `PINJ-2024-${String(loans.length + 1).padStart(4, '0')}`,
      member_name: 'Budi Santoso', // Mocked
      principal_paid: 0,
      interest_paid: 0,
      status: 'PENDING',
    };
    setLoans([newLoan, ...loans]);
    setOpenDialog(false);
    alert(`Pengajuan pinjaman sebesar ${formatCurrency(data.principal_amount)} berhasil didaftarkan.`);
  };

  const filteredLoans = loans.filter(
    (loan) =>
      loan.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loan_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoans([
        {
          id: 1,
          loan_number: 'PINJ-2024-0001',
          member_name: 'Budi Santoso',
          loan_type: 'Pinjaman Mikro',
          principal_amount: 5000000,
          interest_rate: 2,
          period_months: 12,
          start_date: '2024-01-15',
          end_date: '2025-01-15',
          principal_paid: 416666,
          interest_paid: 100000,
          status: 'ACTIVE',
        },
        {
          id: 2,
          loan_number: 'PINJ-2024-0002',
          member_name: 'Siti Aminah',
          loan_type: 'Pinjaman Menengah',
          principal_amount: 15000000,
          interest_rate: 1.75,
          period_months: 24,
          start_date: '2024-02-01',
          end_date: '2026-02-01',
          principal_paid: 0,
          interest_paid: 0,
          status: 'PENDING',
        },
        {
          id: 3,
          loan_number: 'PINJ-2023-0015',
          member_name: 'Ahmad Yani',
          loan_type: 'Pinjaman Konsumtif',
          principal_amount: 5000000,
          interest_rate: 1.5,
          period_months: 18,
          start_date: '2023-09-01',
          end_date: '2025-03-01',
          principal_paid: 5000000,
          interest_paid: 112500,
          status: 'COMPLETED',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const remainingBalance = (loan) => {
    return parseFloat(loan.principal_amount) - parseFloat(loan.principal_paid);
  };

  const progress = (loan) => {
    return (parseFloat(loan.principal_paid) / parseFloat(loan.principal_amount)) * 100;
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
                ) : loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Tidak ada pinjaman
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => (
                    <TableRow key={loan.id} hover>
                      <TableCell>{loan.loan_number}</TableCell>
                      <TableCell>{loan.member_name}</TableCell>
                      <TableCell>{loan.loan_type}</TableCell>
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
                            onClick={() => alert(`Setujui ${loan.loan_number}`)}
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
