import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  member_id: yup.string().required('Pilih anggota'),
  loan_type_id: yup.string().required('Pilih jenis pinjaman'),
  amount: yup.number().typeError('Jumlah harus berupa angka').required('Jumlah wajib diisi').positive('Jumlah harus positif').min(100000, 'Minimal 100.000'),
  period_months: yup.number().typeError('Tenor harus berupa angka').required('Tenor wajib diisi').positive('Tenor harus positif').max(60, 'Maksimal 60 bulan'),
  interest_rate: yup.number().typeError('Bunga harus berupa angka').required('Bunga wajib diisi').min(0, 'Bunga tidak boleh negatif'),
  purpose: yup.string().required('Tujuan pinjaman wajib diisi'),
});

const MEMBERS = [
  { id: 1, name: 'Budi Santoso (ANGG-2024-0001)' },
  { id: 2, name: 'Siti Aminah (ANGG-2024-0002)' },
  { id: 3, name: 'Ahmad Yani (ANGG-2024-0003)' },
];

const LOAN_TYPES = [
  { id: 1, name: 'Pinjaman Mikro', max: 5000000, defaultRate: 2.0 },
  { id: 2, name: 'Pinjaman Menengah', max: 20000000, defaultRate: 1.75 },
  { id: 3, name: 'Pinjaman Konsumtif', max: 10000000, defaultRate: 1.5 },
];

function LoanApplicationDialog({ open, onClose, onSubmit }) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      member_id: '',
      loan_type_id: '',
      amount: 1000000,
      period_months: 12,
      interest_rate: 1.5,
      purpose: '',
    },
  });

  const selectedLoanTypeId = watch('loan_type_id');
  const amount = watch('amount');
  const period = watch('period_months');
  const rate = watch('interest_rate');

  useEffect(() => {
    if (selectedLoanTypeId) {
      const type = LOAN_TYPES.find(t => t.id === parseInt(selectedLoanTypeId));
      if (type) {
        setValue('interest_rate', type.defaultRate);
      }
    }
  }, [selectedLoanTypeId, setValue]);

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  const monthlyInstallment = (amount && period && rate) 
    ? (amount / period) + (amount * (rate / 100))
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Pengajuan Pinjaman Baru</DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="member_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Pilih Anggota"
                    error={!!errors.member_id}
                    helperText={errors.member_id?.message}
                  >
                    {MEMBERS.map(m => (
                      <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="loan_type_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Jenis Pinjaman"
                    error={!!errors.loan_type_id}
                    helperText={errors.loan_type_id?.message}
                  >
                    {LOAN_TYPES.map(t => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Jumlah Pinjaman (Rp)"
                    type="number"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="period_months"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tenor (Bulan)"
                    type="number"
                    error={!!errors.period_months}
                    helperText={errors.period_months?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Controller
                name="interest_rate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bunga (%)"
                    type="number"
                    inputProps={{ step: 0.01 }}
                    error={!!errors.interest_rate}
                    helperText={errors.interest_rate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="purpose"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tujuan Pinjaman"
                    multiline
                    rows={2}
                    error={!!errors.purpose}
                    helperText={errors.purpose?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Estimasi Angsuran Bulanan</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(monthlyInstallment)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              *Perhitungan: (Pokok / Tenor) + (Pokok * Bunga)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="contained">Ajukan Pinjaman</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default LoanApplicationDialog;
