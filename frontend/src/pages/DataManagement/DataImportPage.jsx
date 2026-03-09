import React, { useState } from 'react';
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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Description as FileIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { exportToCSV } from '../../utils/exportUtils';

function DataImportPage() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [exporting, setExporting] = useState(false);

  const tabs = [
    { label: 'Import Anggota', type: 'members' },
    { label: 'Import Produk', type: 'products' },
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async (type) => {
    if (!selectedFile) {
      alert('Pilih file untuk diimport!');
      return;
    }

    setImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Parse CSV
          const text = e.target.result;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const data = [];

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              const row = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              data.push(row);
            }
          }

          // Send to API
          const response = await apiService.importData(type, data);

          setImportResults(response.data.data);
          setOpenResultDialog(true);
        } catch (error) {
          alert('Gagal memproses file CSV: ' + error.message);
        }
      };

      reader.readAsText(selectedFile);
    } catch (error) {
      alert('Gagal mengimport data: ' + error.message);
    } finally {
      setImporting(false);
      setSelectedFile(null);
    }
  };

  const handleExport = async (type) => {
    setExporting(true);

    try {
      const response = await apiService.exportData(type);

      if (response.data.success) {
        const filename = type + '_' + new Date().toISOString().split('T')[0];
        exportToCSV(response.data.data, filename);
        alert(`Berhasil export ${response.data.data.length} data!`);
      }
    } catch (error) {
      alert('Gagal menexport data: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = async (type) => {
    try {
      const response = await apiService.getImportTemplate(type);

      if (response.data.success) {
        const filename = 'template_' + type;
        exportToCSV(response.data.data, filename);
      }
    } catch (error) {
      alert('Gagal mendownload template: ' + error.message);
    }
  };

  const handleCloseResult = () => {
    setOpenResultDialog(false);
    setImportResults(null);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Manajemen Data - Import & Export
      </Typography>

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
            {/* File Upload Section */}
            <Box sx={{ mb: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Import dari File CSV/Excel
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Format CSV yang didukung:</strong><br />
                  File harus memiliki header di baris pertama. Pastikan format kolom sesuai dengan template.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-upload"
                />

                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    {selectedFile ? selectedFile.name : 'Pilih File CSV/Excel'}
                  </Button>
                </label>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => handleImport(tabs[tabValue].type)}
                    disabled={!selectedFile || importing}
                    fullWidth
                  >
                    {importing ? 'Sedang Mengimport...' : 'Import Data'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadTemplate(tabs[tabValue].type)}
                    disabled={importing}
                    fullWidth
                  >
                    Download Template
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Export Section */}
            <Box sx={{ p: 3, bgcolor: 'primary.50', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Export Data ke CSV
              </Typography>

              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Export data ke file CSV untuk backup atau analisis lebih lanjut.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileIcon />}
                  onClick={() => handleExport(tabs[tabValue].type)}
                  disabled={exporting}
                  fullWidth
                >
                  {exporting ? 'Sedang Mengekspor...' : `Export ${tabs[tabValue].type}`}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => setTabValue(0)}
                  fullWidth
                >
                  Refresh
                </Button>
              </Box>
            </Box>
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
          Hasil Import
        </DialogTitle>
        <DialogContent>
          {importResults && (
            <Box>
              <Alert severity={importResults.failed === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Total:</strong> {importResults.imported + importResults.failed} baris<br />
                  <strong>Berhasil:</strong> {importResults.imported} baris<br />
                  <strong>Gagal:</strong> {importResults.failed} baris
                </Typography>
              </Alert>

              {importResults.failed > 0 && importResults.errors && (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <Typography variant="h6" gutterBottom>
                    Error Details:
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Baris</TableCell>
                          <TableCell>Error</TableCell>
                          <TableCell>Data</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importResults.errors.slice(0, 20).map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.row}</TableCell>
                            <TableCell>
                              <Chip
                                icon={<ErrorIcon fontSize="small" />}
                                label={error.error}
                                color="error"
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" component="pre">
                                {JSON.stringify(error.data || {}, null, 2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {importResults.errors.length > 20 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Menampilkan 20 dari {importResults.errors.length} error...
                    </Typography>
                  )}
                </Box>
              )}

              {importResults.failed === 0 && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <SuccessIcon sx={{ fontSize: 64, color: 'success.main' }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Import Berhasil!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {importResults.imported} data berhasil diimport
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

export default DataImportPage;
