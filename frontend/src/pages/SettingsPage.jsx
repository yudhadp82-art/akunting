import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

function SettingsPage() {
  const [settings, setSettings] = useState({
    cooperativeName: 'Koperasi Desa Sukamaju',
    address: 'Jl. Raya Desa No. 1, Kec. Sukamaju, Kab. Maju Jaya',
    phone: '081234567890',
    email: 'koperasi.sukamaju@desa.id',
    enableNotifications: true,
    shuRules: {
      jasaModal: 30,
      jasaUsaha: 50,
      pendidikan: 5,
      sosial: 5,
      cadangan: 10,
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSHUChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      shuRules: { ...prev.shuRules, [name]: parseInt(value) || 0 }
    }));
  };

  const handleSave = () => {
    const total = Object.values(settings.shuRules).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      alert(`Total persentase SHU harus 100%. Saat ini: ${total}%`);
      return;
    }
    alert('Pengaturan berhasil disimpan!');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Pengaturan Sistem</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Informasi Koperasi</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nama Koperasi"
                    name="cooperativeName"
                    value={settings.cooperativeName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Alamat"
                    name="address"
                    multiline
                    rows={2}
                    value={settings.address}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nomor Telepon"
                    name="phone"
                    value={settings.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Aturan Pembagian SHU (%)</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Tentukan persentase alokasi SHU untuk setiap kategori. Total harus 100%.
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Jasa Modal"
                    type="number"
                    name="jasaModal"
                    value={settings.shuRules.jasaModal}
                    onChange={handleSHUChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Jasa Usaha"
                    type="number"
                    name="jasaUsaha"
                    value={settings.shuRules.jasaUsaha}
                    onChange={handleSHUChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dana Pendidikan"
                    type="number"
                    name="pendidikan"
                    value={settings.shuRules.pendidikan}
                    onChange={handleSHUChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dana Sosial"
                    type="number"
                    name="sosial"
                    value={settings.shuRules.sosial}
                    onChange={handleSHUChange}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Dana Cadangan"
                    type="number"
                    name="cadangan"
                    value={settings.shuRules.cadangan}
                    onChange={handleSHUChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Sistem</Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                  />
                }
                label="Aktifkan Notifikasi"
              />
            </CardContent>
          </Card>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ py: 2 }}
          >
            Simpan Semua Perubahan
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SettingsPage;
