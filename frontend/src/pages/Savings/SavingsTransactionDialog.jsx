import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  member_id: yup.string().required('Pilih anggota'),
  savings_type_id: yup.string().required('Pilih jenis simpanan'),
  amount: yup.number().typeError('Jumlah harus berupa angka').required('Jumlah wajib diisi').positive('Jumlah harus positif').min(1000, 'Minimal 1.000'),
  transaction_date: yup.string().required('Tanggal wajib diisi'),
  description: yup.string(),
});

const MEMBERS = [
  { id: 1, name: 'Budi Santoso (ANGG-2024-0001)' },
  { id: 2, name: 'Siti Aminah (ANGG-2024-0002)' },
  { id: 3, name: 'Ahmad Yani (ANGG-2024-0003)' },
];

const SAVINGS_TYPES = [
  { id: 1, name: 'Simpanan Pokok' },
  { id: 2, name: 'Simpanan Wajib' },
  { id: 3, name: 'Simpanan Sukarela' },
];

function SavingsTransactionDialog({ open, onClose, onSubmit, mode = 'DEPOSIT' }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      member_id: '',
      savings_type_id: '',
      amount: 10000,
      transaction_date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  const onFormSubmit = (data) => {
    onSubmit({ ...data, mode });
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'DEPOSIT' ? 'Setoran Simpanan' : 'Penarikan Simpanan'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <Controller
                name="savings_type_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Jenis Simpanan"
                    error={!!errors.savings_type_id}
                    helperText={errors.savings_type_id?.message}
                  >
                    {SAVINGS_TYPES.map(t => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Jumlah (Rp)"
                    type="number"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="transaction_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tanggal Transaksi"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.transaction_date}
                    helperText={errors.transaction_date?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Keterangan"
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="contained" color={mode === 'DEPOSIT' ? 'primary' : 'warning'}>
            {mode === 'DEPOSIT' ? 'Simpan Setoran' : 'Proses Penarikan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default SavingsTransactionDialog;
