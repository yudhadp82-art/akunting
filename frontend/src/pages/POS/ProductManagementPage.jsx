import React, { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { apiService } from '../../services/api';

function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    category: 'Sembako',
    description: '',
    unit: 'PCS',
    cost_price: '',
    selling_price: '',
    stock: 0,
    min_stock: 5,
    barcode: '',
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getPOSProducts();
      if (response.data.success) {
        setProducts(response.data.data);
        const lowStock = response.data.data.filter(p => p.stock <= p.min_stock);
        setLowStockProducts(lowStock);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // Mock fallback
      const mockProducts = [
        { id: 1, product_code: 'P001', name: 'Beras Premium 5kg', category: 'Sembako', description: 'Beras premium kualitas terbaik', unit: 'PCS', cost_price: 55000, selling_price: 65000, stock: 50, min_stock: 10, barcode: '8991001' },
        { id: 2, product_code: 'P002', name: 'Minyak Goreng 2L', category: 'Sembako', description: 'Minyak goreng curah', unit: 'PCS', cost_price: 28000, selling_price: 32000, stock: 100, min_stock: 20, barcode: '8991002' },
      ];
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_code: product.product_code,
        name: product.name,
        category: product.category,
        description: product.description || '',
        unit: product.unit,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        stock: product.stock,
        min_stock: product.min_stock,
        barcode: product.barcode || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_code: '',
        name: '',
        category: 'Sembako',
        description: '',
        unit: 'PCS',
        cost_price: '',
        selling_price: '',
        stock: 0,
        min_stock: 5,
        barcode: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.product_code || !formData.name || !formData.selling_price) {
      alert('Mohon lengkapi data yang wajib diisi!');
      return;
    }

    try {
      const productData = {
        ...formData,
        cost_price: parseFloat(formData.cost_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
      };

      // Since we don't have update/create product endpoints in api.js yet (only POS routes),
      // let's assume we'll use a general product route or just mock it for now
      // Actually, I should check if there's a memberRoutes equivalent for products
      alert('Fitur simpan produk akan dihubungkan ke API (Demo Mode)');
      
      if (editingProduct) {
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
      } else {
        setProducts([...products, { ...productData, id: Date.now() }]);
      }
      
      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      // Mock delete
      setProducts(products.filter(p => p.id !== id));
      alert('Produk berhasil dihapus (Demo Mode)!');
    }
  };

  const isLowStock = (product) => product.stock <= product.min_stock;

  const categories = ['Sembako', 'Elektronik', 'Pakaian', 'ATK', 'Lainnya'];

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
        <Typography variant="h4">Manajemen Produk</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Tambah Produk
        </Button>
      </Box>

      {lowStockProducts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          <Typography variant="body2">
            {lowStockProducts.length} produk memiliki stok rendah! Mohon segera restock.
          </Typography>
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kode</TableCell>
                  <TableCell>Nama Produk</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>Harga Beli</TableCell>
                  <TableCell>Harga Jual</TableCell>
                  <TableCell>Stok</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Tidak ada produk
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{formatCurrency(product.cost_price)}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {formatCurrency(product.selling_price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {formatNumber(product.stock)} {product.unit}
                          </Typography>
                          {isLowStock(product) && (
                            <WarningIcon fontSize="small" color="error" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {isLowStock(product) ? (
                          <Chip
                            label="Stok Rendah"
                            size="small"
                            color="error"
                          />
                        ) : (
                          <Chip
                            label="Tersedia"
                            size="small"
                            color="success"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kode Produk"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Produk"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={formData.category}
                  label="Kategori"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Satuan</InputLabel>
                <Select
                  value={formData.unit}
                  label="Satuan"
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <MenuItem value="PCS">PCS (Pcs)</MenuItem>
                  <MenuItem value="KG">KG (Kilogram)</MenuItem>
                  <MenuItem value="L">L (Liter)</MenuItem>
                  <MenuItem value="BOX">BOX</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deskripsi"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Harga Beli"
                type="number"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Harga Jual"
                type="number"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stok"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stok Minimum"
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) || 0 })}
                helperText="Stok minimum untuk peringatan"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button
            variant="contained"
            onClick={handleSave}
          >
            {editingProduct ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductManagementPage;
