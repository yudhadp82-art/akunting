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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Nama wajib diisi'),
  id_card_number: yup
    .string()
    .required('No. KTP wajib diisi')
    .min(16, 'No. KTP harus 16 digit')
    .max(16, 'No. KTP harus 16 digit'),
  birth_date: yup.string().required('Tanggal lahir wajib diisi'),
  gender: yup.string().oneOf(['MALE', 'FEMALE']).required('Jenis kelamin wajib diisi'),
  phone: yup.string().required('No. telepon wajib diisi'),
  email: yup.string().email('Email tidak valid'),
  address: yup.string().required('Alamat wajib diisi'),
  join_date: yup.string().required('Tanggal bergabung wajib diisi'),
});

function MemberFormDialog({ open, onClose, onSubmit, member }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      id_card_number: '',
      birth_date: '',
      gender: 'MALE',
      phone: '',
      email: '',
      address: '',
      join_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (member) {
      reset({
        ...member,
        birth_date: member.birth_date ? member.birth_date.split('T')[0] : '',
        join_date: member.join_date ? member.join_date.split('T')[0] : '',
      });
    } else {
      reset({
        name: '',
        id_card_number: '',
        birth_date: '',
        gender: 'MALE',
        phone: '',
        email: '',
        address: '',
        join_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [member, reset, open]);

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{member ? 'Edit Anggota' : 'Tambah Anggota Baru'}</DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent dividers>
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nama Lengkap"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="id_card_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nomor KTP (NIK)"
                      error={!!errors.id_card_number}
                      helperText={errors.id_card_number?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="birth_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tanggal Lahir"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.birth_date}
                      helperText={errors.birth_date?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Jenis Kelamin"
                      error={!!errors.gender}
                      helperText={errors.gender?.message}
                    >
                      <MenuItem value="MALE">Laki-laki</MenuItem>
                      <MenuItem value="FEMALE">Perempuan</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nomor Telepon"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Alamat Lengkap"
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="join_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tanggal Bergabung"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.join_date}
                      helperText={errors.join_date?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="contained" color="primary">
            {member ? 'Simpan Perubahan' : 'Daftarkan Anggota'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default MemberFormDialog;
