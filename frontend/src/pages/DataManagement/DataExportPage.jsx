import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Check as SelectAllIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { exportToCSV } from '../../utils/exportUtils';
import {
  generateBalanceSheetPDF,
  generateIncomeStatementPDF,
  generateSHUPDF,
} from '../../utils/exportUtils';

function DataExportPage() {
  const [exportType, setExportType] = useState('members');
  const [selectedItems, setSelectedItems] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      switch (exportType) {
        case 'members':
          response = await apiService.getMembers({ limit: 1000 });
          break;
        case 'products':
          response = await apiService.getPOSProducts();
          break;
        case 'savings':
          response = await apiService.getSavings();
          break;
        case 'loans':
          response = await apiService.getLoans();
          break;
        default:
          response = { data: { data: [] } };
      }

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [exportType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setAllSelected(checked);
    setSelectedItems(checked ? data.map(item => item.id) : []);
  };

  const handleSelectItem = (event, id) => {
    const selectedIndex = selectedItems.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedItems, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedItems.slice(1));
    } else if (selectedIndex === selectedItems.length - 1) {
      newSelected = newSelected.concat(selectedItems.slice(0, -1));
    } else {
      newSelected = newSelected.concat(
        selectedItems.slice(0, selectedIndex),
        selectedItems.slice(selectedIndex + 1)
      );
    }

    setSelectedItems(newSelected);
    setAllSelected(newSelected.length === data.length && data.length > 0);
  };

  const isSelected = (id) => selectedItems.indexOf(id) !== -1;

  const handleExportCSV = () => {
    if (selectedItems.length === 0) {
      alert('Pilih minimal satu data untuk diekspor!');
      return;
    }

    const selectedData = data.filter(item => selectedItems.includes(item.id));
    const filename = exportType + '_' + new Date().toISOString().split('T')[0];

    try {
      exportToCSV(selectedData, filename);
      alert(`Berhasil export ${selectedData.length} data ke CSV!`);
    } catch (error) {
      alert('Gagal menexport data: ' + error.message);
    }
  };

  const handleExportPDF = () => {
    if (selectedItems.length === 0) {
      alert('Pilih minimal satu data untuk diekspor!');
      return;
    }

    const selectedData = data.filter(item => selectedItems.includes(item.id));

    try {
      switch (exportType) {
        case 'members':
          alert('Export PDF untuk anggota belum tersedia. Gunakan export CSV.');
          break;
        case 'balance_sheet':
          generateBalanceSheetPDF(selectedData, dateRange.end, { name: 'Koperasi Desa' });
          break;
        case 'income_statement':
          generateIncomeStatementPDF(selectedData, dateRange.start, dateRange.end, { name: 'Koperasi Desa' });
          break;
        case 'shu':
          generateSHUPDF(selectedData, dateRange.end, { name: 'Koperasi Desa' });
          break;
        default:
          alert('Export PDF belum tersedia untuk tipe data ini.');
      }
    } catch (error) {
      alert('Gagal menexport PDF: ' + error.message);
    }
  };

  const exportTypes = [
    { value: 'members', label: 'Anggota' },
    { value: 'products', label: 'Produk POS' },
    { value: 'savings', label: 'Simpanan' },
    { value: 'loans', label: 'Pinjaman' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Export Data
      </Typography>

      {/* Export Options */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Tipe Data</InputLabel>
            <Select
              value={exportType}
              label="Tipe Data"
              onChange={(e) => setExportType(e.target.value)}
            >
              {exportTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {(exportType === 'balance_sheet' || exportType === 'income_statement' || exportType === 'shu') && (
          <>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Tanggal Awal"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Tanggal Akhir"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Data Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Daftar {exportTypes.find(t => t.value === exportType)?.label}
              <Chip label={`${data.length} item`} size="small" sx={{ ml: 1 }} />
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : data.length === 0 ? (
            <Alert severity="info">
              Tidak ada data untuk diekspor
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allSelected}
                        onChange={handleSelectAll}
                        inputProps={{ 'aria-label': 'select all data' }}
                      />
                    </TableCell>
                    <TableCell>
                      <SelectAllIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Pilih Semua
                    </TableCell>
                    {(() => {
                      let headers = [];
                      if (exportType === 'members') headers = ['Nomor Anggota', 'Nama Lengkap', 'No. KTP', 'Telepon', 'Status'];
                      else if (exportType === 'products') headers = ['Kode Produk', 'Nama Produk', 'Kategori', 'Harga Jual', 'Stok', 'Status'];
                      else if (exportType === 'savings') headers = ['No. Rekening', 'Nama Anggota', 'Jenis', 'Saldo', 'Status'];
                      else if (exportType === 'loans') headers = ['No. Pinjaman', 'Nama Anggota', 'Jumlah', 'Bunga', 'Status'];
                      
                      return headers.map(header => (
                        <TableCell key={header} align="left">{header}</TableCell>
                      ));
                    })()}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      role="checkbox"
                      aria-checked={isSelected(item.id)}
                      tabIndex={-1}
                      selected={isSelected(item.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected(item.id)}
                          onClick={(event) => handleSelectItem(event, item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {exportType === 'members' && item.member_number}
                        {exportType === 'products' && item.product_code}
                        {exportType === 'savings' && item.account_number}
                        {exportType === 'loans' && item.loan_number}
                      </TableCell>
                      {exportType === 'members' && (
                        <>
                          <TableCell>{item.full_name || item.name}</TableCell>
                          <TableCell>{item.id_card_number}</TableCell>
                          <TableCell>{item.phone || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              color={item.status === 'ACTIVE' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </>
                      )}
                      {exportType === 'products' && (
                        <>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Chip label={item.category} size="small" />
                          </TableCell>
                          <TableCell>Rp {item.selling_price.toLocaleString('id-ID')}</TableCell>
                          <TableCell>
                            <Chip
                              label={item.stock}
                              color={item.stock < 10 ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.is_active ? 'Aktif' : 'Non-Aktif'}
                              color={item.is_active ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </>
                      )}
                      {exportType === 'savings' && (
                        <>
                          <TableCell>{item.member?.full_name || '-'}</TableCell>
                          <TableCell>
                            <Chip label={`Tipe ${item.savings_type_id}`} size="small" />
                          </TableCell>
                          <TableCell>
                            Rp {parseFloat(item.balance).toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.is_active ? 'Aktif' : 'Non-Aktif'}
                              color={item.is_active ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </>
                      )}
                      {exportType === 'loans' && (
                        <>
                          <TableCell>{item.member?.full_name || '-'}</TableCell>
                          <TableCell>
                            Rp {parseFloat(item.principal_amount).toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell>{item.interest_rate}%</TableCell>
                          <TableCell>
                            <Chip
                              label={item.status}
                              color={
                                item.status === 'ACTIVE' ? 'warning' :
                                item.status === 'COMPLETED' ? 'success' :
                                item.status === 'DEFAULTED' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Aksi Export
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Terpilih:</strong> {selectedItems.length} dari {data.length} data
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              disabled={selectedItems.length === 0}
            >
              Export CSV
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handleExportPDF}
              disabled={selectedItems.length === 0}
            >
              Export PDF
            </Button>

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              disabled={selectedItems.length === 0}
            >
              Filter
            </Button>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setSelectedItems([])}
              disabled={selectedItems.length === 0}
            >
              Reset Pilihan
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DataExportPage;
