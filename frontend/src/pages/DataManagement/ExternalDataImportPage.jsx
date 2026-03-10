import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Link as LinkIcon,
  ExpandMore as ExpandMoreIcon,
  Sync as SyncIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';

function ExternalDataImportPage() {
  const [tabValue, setTabValue] = useState(0);
  const [url, setUrl] = useState('');
  const [memberId, setMemberId] = useState('');
  const [importResults, setImportResults] = useState(null);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [testConnection, setTestConnection] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [importing, setImporting] = useState(false);

  const tabs = [
    { label: 'Import Anggota', type: 'members' },
    { label: 'Import Simpanan', type: 'savings' },
    { label: 'Sinkronisasi Simpanan', type: 'sync' },
    { label: 'Vercel Scrape', type: 'vercel' },
  ];

  const predefinedSources = [
    {
      id: 'simpanan-anggota',
      name: 'Simpanan Anggota Vercel',
      url: 'https://simpanan-anggota.vercel.app/',
      description: 'Web app simpanan anggota koperasi (Scraping)',
      icon: <PeopleIcon />,
      category: 'Vercel App'
    },
    {
      id: 'koperasi-nasional',
      name: 'Koperasi Nasional',
      url: 'https://api.koperasi.go.id/v1/members',
      description: 'Database koperasi nasional',
      icon: <StorageIcon />,
      category: 'National'
    },
    {
      id: 'custom-api',
      name: 'Custom API URL',
      url: '',
      description: 'URL API kustom yang Anda miliki',
      icon: <LinkIcon />,
      category: 'Custom'
    }
  ];

  useEffect(() => {
    // Check external sources status on load
    apiService.getExternalSourcesStatus().catch(err => console.error('Error fetching sources:', err));
  }, []);

  const handleImportMembers = async () => {
    if (!url.trim()) {
      alert('URL API harus diisi!');
      return;
    }

    setImporting(true);

    try {
      const response = await apiService.importExternalMembers({
        source: 'external-api',
        url: url
      });

      setImportResults(response.data.data);
      setOpenResultDialog(true);

      if (response.data.data.errors && response.data.data.errors.length > 0) {
        alert(`Import selesai dengan ${response.data.data.errors.length} error`);
      } else {
        alert(`Berhasil import ${response.data.data.imported} anggota!`);
      }
    } catch (error) {
      alert('Gagal import data: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleImportSavings = async () => {
    if (!url.trim()) {
      alert('URL API harus diisi!');
      return;
    }

    setImporting(true);

    try {
      const response = await apiService.importExternalSavings({
        source: 'external-api',
        url: url,
        member_id: memberId || null
      });

      setImportResults(response.data.data);
      setOpenResultDialog(true);

      if (response.data.data.errors && response.data.data.errors.length > 0) {
        alert(`Import selesai dengan ${response.data.data.errors.length} error`);
      } else {
        alert(`Berhasil import ${response.data.data.imported} simpanan!`);
      }
    } catch (error) {
      alert('Gagal import data: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleSyncSavings = async () => {
    if (!memberId.trim()) {
      alert('ID Anggota harus diisi!');
      return;
    }

    const savingsUpdates = [
      { savings_type_id: 1, amount: 50000 },    // Simpanan Pokok
      { savings_type_id: 2, amount: 100000 },   // Simpanan Wajib
      { savings_type_id: 3, amount: 200000 },   // Simpanan Sukarela
    ];

    setImporting(true);

    try {
      const response = await apiService.syncSavings({
        member_id: memberId,
        savings_updates: savingsUpdates
      });

      setImportResults(response.data.data);
      setOpenResultDialog(true);

      alert(`Sinkronisasi berhasil! Total simpanan: Rp ${response.data.data.total_balance.toLocaleString('id-ID')}`);
    } catch (error) {
      alert('Gagal sinkronisasi data: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleVercelScrape = async () => {
    if (!url.trim()) {
      alert('URL Vercel App harus diisi!');
      return;
    }

    setImporting(true);

    try {
      const response = await apiService.scrapeVercelApp({ url });
      
      setImportResults(response.data.data);
      setOpenResultDialog(true);

      const { results } = response.data.data;
      alert(`Scraping selesai!
Members: ${results.members.created} created, ${results.members.updated} updated
Transactions: ${results.transactions.created} processed`);
      
    } catch (error) {
      alert('Gagal scrape data: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      alert('URL harus diisi untuk test koneksi!');
      return;
    }

    setTestingConnection(true);

    try {
      const response = await apiService.testExternalConnection({ url });

      setTestConnection(response.data.data);

      if (response.data.data.success) {
        alert(`Koneksi berhasil! Response time: ${response.data.data.response_time}ms`);
      } else {
        alert(`Koneksi gagal: ${response.data.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Gagal test koneksi: ' + error.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSourceSelect = (source) => {
    if (source.id === 'custom-api') {
      // Custom source - user enters URL
      setUrl('');
    } else {
      // Predefined source - use predefined URL
      setUrl(source.url);
      if (source.id === 'simpanan-anggota') {
        setTabValue(3); // Switch to Vercel Scrape tab
      }
    }
  };

  const handleCloseResult = () => {
    setOpenResultDialog(false);
    setImportResults(null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Import Data Eksternal
      </Typography>

      {/* External Sources Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sumber Data Eksternal
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Import data dari sumber eksternal seperti API atau file CSV/Excel dari database lain.
              Pilih sumber yang sudah tersedia atau masukkan URL API kustom.
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            {predefinedSources.map((source) => (
              <Grid item xs={12} md={6} key={source.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => handleSourceSelect(source)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 2, color: 'primary.main' }}>
                        {source.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {source.name}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {source.description}
                    </Typography>
                    <Chip
                      label={source.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Import Form */}
      <Card>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mb: 3 }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>

          <Box>
            {/* Connection Test Section */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Test Koneksi Sumber Data
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="URL Sumber Data"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    disabled={importing}
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    variant="contained"
                    onClick={handleTestConnection}
                    disabled={!url || testingConnection}
                    startIcon={testingConnection ? <CircularProgress size={20} /> : <RefreshIcon />}
                    fullWidth
                  >
                    {testingConnection ? 'Testing...' : 'Test'}
                  </Button>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    onClick={() => setUrl('')}
                    disabled={importing}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>

              {testConnection && (
                <Box sx={{ mt: 2 }}>
                  <Alert
                    severity={testConnection.success ? 'success' : 'error'}
                    icon={testConnection.success ? <SuccessIcon /> : <ErrorIcon />}
                  >
                    <Typography variant="body2">
                      <strong>Hasil Test:</strong> {testConnection.success ? 'Terhubung' : 'Gagal terhubung'}<br />
                      {testConnection.data_type && `Data Type: ${testConnection.data_type}`}<br />
                      {testConnection.response_time && `Response Time: ${testConnection.response_time}ms`}
                      {!testConnection.success && testConnection.error && `Error: ${testConnection.error}`}
                    </Typography>
                  </Alert>
                </Box>
              )}
            </Box>

            {/* Member ID for Savings Sync */}
            {tabValue === 2 && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="ID Anggota (untuk Sinkronisasi Simpanan)"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="Masukkan ID anggota atau kosongkan untuk semua anggota"
                  disabled={importing}
                />
              </Box>
            )}

            {/* Import Button */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={
                  tabValue === 0 ? handleImportMembers : 
                  tabValue === 1 ? handleImportSavings : 
                  tabValue === 2 ? handleSyncSavings : 
                  handleVercelScrape
                }
                disabled={importing || !url || (tabValue === 2 && !memberId)}
                startIcon={importing ? <CircularProgress size={20} /> : <SyncIcon />}
              >
                {importing ? 'Sedang Proses...' : (
                  <>
                    {tabValue === 0 && 'Import Anggota'}
                    {tabValue === 1 && 'Import Simpanan'}
                    {tabValue === 2 && 'Sinkronisasi Simpanan'}
                    {tabValue === 3 && 'Scrape Vercel App'}
                  </>
                )}
              </Button>
            </Box>

            {/* Information */}
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Perhatian:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Pastikan URL sumber data valid dan dapat diakses</li>
                  <li>Data yang sudah ada akan diupdate, bukan di-gandakan</li>
                  <li>Untuk sinkronisasi simpanan, masukkan ID anggota untuk update spesifik</li>
                  <li>Selalu review hasil import sebelum lanjut</li>
                  <li>Backup data sebelum operasi import besar</li>
                </ul>
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>

      {/* Import Result Dialog */}
      <Dialog
        open={openResultDialog}
        onClose={handleCloseResult}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Hasil Import/Sinkronisasi
        </DialogTitle>
        <DialogContent>
          {importResults && (
            <Box>
              <Alert severity={importResults.failed === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {tabValue === 3 ? (
                    <>
                      <strong>Vercel App Stats:</strong><br />
                      Total Anggota: {importResults.stats?.total_members || '-'}<br />
                      Total Simpanan: {importResults.stats?.total_savings || '-'}<br />
                      <br />
                      <strong>Hasil Scrape:</strong><br />
                      Members: {importResults.results.members.created} baru, {importResults.results.members.updated} diupdate<br />
                      Savings: {importResults.results.savings.created} baru, {importResults.results.savings.updated} diupdate<br />
                      Transactions: {importResults.results.transactions.created} berhasil
                    </>
                  ) : (
                    <>
                      <strong>Total:</strong> {importResults.imported + (importResults.updated || 0) + importResults.failed} data<br />
                      <strong>Berhasil:</strong> {importResults.imported + (importResults.updated || 0)} data<br />
                      {tabValue === 2 && (
                        <>
                          <strong>Diupdate:</strong> {importResults.updated || 0} data<br />
                        </>
                      )}
                      <strong>Gagal:</strong> {importResults.failed} data
                    </>
                  )}
                </Typography>
              </Alert>

              {importResults.source && (
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Sumber: {importResults.source}
                </Typography>
              )}

              {(tabValue === 0 || tabValue === 1) && importResults.errors && importResults.errors.length > 0 && (
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      Error Details ({importResults.errors.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mt: 2 }}>
                      {importResults.errors.slice(0, 50).map((error, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'error.lighter', borderRadius: 1 }}>
                          <Typography variant="caption" fontWeight="bold">
                            Error #{index + 1}
                          </Typography>
                          <Typography variant="caption" component="pre" sx={{ mt: 0.5 }}>
                            {JSON.stringify(error.data || error, null, 2)}
                          </Typography>
                          {error.error && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                              {error.error}
                            </Typography>
                          )}
                        </Box>
                      ))}
                      {importResults.errors.length > 50 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          Menampilkan 50 dari {importResults.errors.length} error...
                        </Typography>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}

              {tabValue === 2 && importResults.results && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detail Simpanan:
                  </Typography>
                  {importResults.results.map((result, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {result.action === 'created' ? '✓ Baru' : '✓ Diupdate'}
                      </Typography>
                      <Typography variant="caption">
                        Saldo: Rp {result.balance?.toLocaleString('id-ID')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {tabValue !== 2 && importResults.results && importResults.errors && importResults.errors.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <SuccessIcon sx={{ fontSize: 64, color: 'success.main' }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Import Berhasil!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {importResults.imported + (importResults.updated || 0)} data berhasil diproses
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResult}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExternalDataImportPage;
