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
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  PostAdd as PostIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { apiService } from '../../services/api';

function JournalEntriesPage() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { account_id: '', debit: 0, credit: 0, description: '' },
      { account_id: '', debit: 0, credit: 0, description: '' },
    ],
  });

  const fetchJournalEntries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getJournalEntries();
      if (response.data.success) {
        setJournalEntries(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError('Gagal mengambil data jurnal');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await apiService.getAccounts();
      if (response.data.success) {
        setAccounts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  }, []);

  useEffect(() => {
    fetchJournalEntries();
    fetchAccounts();
  }, [fetchJournalEntries, fetchAccounts]);

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: '', debit: 0, credit: 0, description: '' }],
    });
  };

  const handleRemoveLine = (index) => {
    const newLines = [...formData.lines];
    newLines.splice(index, 1);
    setFormData({ ...formData, lines: newLines });
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    
    // Auto-clear credit if debit is entered, and vice versa
    if (field === 'debit' && value > 0) newLines[index].credit = 0;
    if (field === 'credit' && value > 0) newLines[index].debit = 0;
    
    setFormData({ ...formData, lines: newLines });
  };

  const totalDebit = formData.lines.reduce((sum, line) => sum + parseFloat(line.debit || 0), 0);
  const totalCredit = formData.lines.reduce((sum, line) => sum + parseFloat(line.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSave = async () => {
    if (!isBalanced) {
      alert('Total Debit dan Kredit harus seimbang!');
      return;
    }

    if (!formData.description) {
      alert('Deskripsi harus diisi!');
      return;
    }

    try {
      const payload = {
        ...formData,
        reference_type: 'ADJUSTMENT', // Manual journal
      };
      const response = await apiService.createJournalEntry(payload);
      if (response.data.success) {
        setOpenDialog(false);
        fetchJournalEntries();
        // Reset form
        setFormData({
          transaction_date: new Date().toISOString().split('T')[0],
          description: '',
          lines: [
            { account_id: '', debit: 0, credit: 0, description: '' },
            { account_id: '', debit: 0, credit: 0, description: '' },
          ],
        });
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
      alert(err.response?.data?.error || 'Gagal menyimpan jurnal');
    }
  };

  const handlePostEntry = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin melakukan posting jurnal ini? Setelah diposting, data tidak dapat diubah.')) {
      return;
    }

    try {
      const response = await apiService.postJournalEntry(id);
      if (response.data.success) {
        fetchJournalEntries();
      }
    } catch (err) {
      console.error('Error posting journal entry:', err);
      alert(err.response?.data?.error || 'Gagal posting jurnal');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      return;
    }

    try {
      const response = await apiService.deleteJournalEntry(id);
      if (response.data.success) {
        fetchJournalEntries();
      }
    } catch (err) {
      console.error('Error deleting journal entry:', err);
      alert(err.response?.data?.error || 'Gagal menghapus jurnal');
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
        <Typography variant="h4">Jurnal Pembukuan</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Buat Jurnal Manual
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No. Voucher</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Deskripsi</TableCell>
                  <TableCell>Referensi</TableCell>
                  <TableCell align="right">Debit</TableCell>
                  <TableCell align="right">Kredit</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : journalEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      Tidak ada jurnal pembukuan
                    </TableCell>
                  </TableRow>
                ) : (
                  journalEntries.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {entry.voucher_number}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(entry.transaction_date)}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>
                          <Chip label={entry.reference_type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            entry.lines.reduce((sum, line) => sum + parseFloat(line.debit), 0)
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            entry.lines.reduce((sum, line) => sum + parseFloat(line.credit), 0)
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={entry.is_posted ? 'Posted' : 'Draft'}
                            color={entry.is_posted ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {!entry.is_posted && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                title="Post to Ledger"
                                onClick={() => handlePostEntry(entry.id)}
                              >
                                <PostIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                title="Delete Draft"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="info"
                            title="View Detail"
                            onClick={() => alert(`Detail Voucher: ${entry.voucher_number}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={8} sx={{ py: 0, bgcolor: 'rgba(0,0,0,0.02)' }}>
                          <Box sx={{ p: 1 }}>
                            <Table size="small">
                              <TableBody>
                                {entry.lines.map((line, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell sx={{ border: 'none', width: '40%', pl: 4 }}>
                                      {line.account?.account_number} - {line.account?.name}
                                    </TableCell>
                                    <TableCell sx={{ border: 'none', width: '30%' }}>
                                      {line.description}
                                    </TableCell>
                                    <TableCell align="right" sx={{ border: 'none', width: '15%' }}>
                                      {parseFloat(line.debit) > 0 ? formatCurrency(line.debit) : '-'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ border: 'none', width: '15%' }}>
                                      {parseFloat(line.credit) > 0 ? formatCurrency(line.credit) : '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Buat Jurnal Manual (ADJ)</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Tanggal Transaksi"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Deskripsi Transaksi"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Penyesuaian biaya ATK bulan Maret"
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2 }}>Rincian Akun</Typography>
            
            {formData.lines.map((line, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Akun"
                      value={line.account_id}
                      onChange={(e) => handleLineChange(index, 'account_id', e.target.value)}
                    >
                      {accounts.map((acc) => (
                        <MenuItem key={acc.id} value={acc.id}>
                          {acc.account_number} - {acc.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Keterangan Baris"
                      value={line.description}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="Debit"
                      type="number"
                      value={line.debit}
                      onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="Kredit"
                      type="number"
                      value={line.credit}
                      onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveLine(index)}
                      disabled={formData.lines.length <= 2}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddLine}
              sx={{ mb: 2 }}
            >
              Tambah Baris
            </Button>

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Total Debit</Typography>
                <Typography variant="h6">{formatCurrency(totalDebit)}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Total Kredit</Typography>
                <Typography variant="h6">{formatCurrency(totalCredit)}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Selisih</Typography>
                <Typography variant="h6" color={isBalanced ? 'success.main' : 'error.main'}>
                  {formatCurrency(Math.abs(totalDebit - totalCredit))}
                </Typography>
              </Box>
            </Box>
            
            {!isBalanced && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Jurnal tidak seimbang! Total Debit harus sama dengan Total Kredit.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!isBalanced || formData.lines.length < 2 || !formData.description}
          >
            Simpan Sebagai Draft
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default JournalEntriesPage;
