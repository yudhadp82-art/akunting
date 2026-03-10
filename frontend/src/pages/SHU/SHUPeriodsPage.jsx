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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '../../utils/formatters';

function SHUPeriodsPage() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const fetchPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getSHUPeriods();
      if (response.data.success) {
        setPeriods(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching SHU periods:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const handleCalculateSHU = async (id) => {
    try {
      await apiService.calculateSHU(id);
      alert('SHU berhasil dihitung.');
      fetchPeriods();
    } catch (err) {
      console.error('Error calculating SHU:', err);
      alert('Gagal menghitung SHU.');
    }
  };

  const handleDistributeSHU = async (id) => {
    try {
      await apiService.distributeSHU(id);
      alert('SHU berhasil dibagikan.');
      fetchPeriods();
    } catch (err) {
      console.error('Error distributing SHU:', err);
      alert('Gagal membagikan SHU.');
    }
  };

  const handleViewDetail = async (period) => {
    try {
      const response = await apiService.getSHUPeriodDetail(period.id);
      if (response.data.success) {
        setSelectedPeriod(response.data.data);
        setOpenDetailDialog(true);
      }
    } catch (err) {
      console.error('Error fetching period detail:', err);
      alert('Gagal mengambil detail periode.');
    }
  };

  const [newPeriodData, setNewPeriodData] = useState({
    name: '',
    start_date: '',
    end_date: ''
  });

  const handleCreatePeriod = async () => {
    try {
      await apiService.createSHUPeriod(newPeriodData);
      alert('Periode SHU baru berhasil dibuat.');
      setOpenDialog(false);
      fetchPeriods();
    } catch (err) {
      console.error('Error creating period:', err);
      alert('Gagal membuat periode SHU.');
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
        <Typography variant="h4">Manajemen SHU (Sisa Hasil Usaha)</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Buat Periode SHU
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nama Periode</TableCell>
                  <TableCell>Periode</TableCell>
                  <TableCell>Total Pendapatan</TableCell>
                  <TableCell>Total Beban</TableCell>
                  <TableCell>SHU</TableCell>
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
                ) : periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Tidak ada periode SHU
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => (
                    <TableRow key={period.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {period.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(period.start_date)} - {formatDate(period.end_date)}
                      </TableCell>
                      <TableCell>{formatCurrency(period.total_revenue)}</TableCell>
                      <TableCell>{formatCurrency(period.total_expense)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color={period.net_income >= 0 ? 'success' : 'error'}
                        >
                          {formatCurrency(period.net_income)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(period.status)}
                          color={getStatusColor(period.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {period.status === 'OPEN' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleCalculateSHU(period.id)}
                          >
                            Hitung SHU
                          </Button>
                        )}
                        {period.status === 'CALCULATED' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleDistributeSHU(period.id)}
                          >
                            Bagikan SHU
                          </Button>
                        )}
                        {period.status === 'DISTRIBUTED' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDetail(period)}
                          >
                            Lihat Detail
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detail Distribusi SHU - {selectedPeriod?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Alokasi Pembagian SHU:
            </Typography>
            <List>
              {selectedPeriod?.allocation_rules?.map((rule, index) => (
                <ListItem key={index} divider={index !== selectedPeriod.allocation_rules.length - 1}>
                  <ListItemText 
                    primary={rule.allocation_type} 
                    secondary={`${rule.percentage}%`}
                  />
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(rule.amount)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Total distribusi ke {selectedPeriod?.distributions?.length || 0} anggota.
            </Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Diproses pada: {selectedPeriod?.calculated_at ? formatDate(selectedPeriod.calculated_at) : '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dibagikan pada: {selectedPeriod?.distributed_at ? formatDate(selectedPeriod.distributed_at) : '-'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)} variant="contained">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Buat Periode SHU Baru</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Nama Periode" 
                  placeholder="Contoh: Tahun Buku 2024" 
                  value={newPeriodData.name}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tanggal Mulai"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={newPeriodData.start_date}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, start_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tanggal Akhir"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={newPeriodData.end_date}
                  onChange={(e) => setNewPeriodData({ ...newPeriodData, end_date: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button variant="contained" onClick={handleCreatePeriod}>
            Buat Periode
          </Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Aturan Pembagian SHU (Default)
          </Typography>
          <Box sx={{ mt: 2 }}>
            {[
              { name: 'Jasa Modal', percentage: 30, description: 'Berdasarkan simpanan anggota' },
              { name: 'Jasa Usaha', percentage: 50, description: 'Berdasarkan transaksi anggota' },
              { name: 'Pendidikan', percentage: 5, description: 'Dana pendidikan' },
              { name: 'Sosial', percentage: 5, description: 'Dana sosial' },
              { name: 'Dana Cadangan', percentage: 10, description: 'Dana cadangan koperasi' },
            ].map((item) => (
              <Box
                key={item.name}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
                <Chip label={`${item.percentage}%`} color="primary" />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SHUPeriodsPage;
