import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { apiService } from '../../services/api';

function POSPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paidAmount, setPaidAmount] = useState('');
  const [openReceipt, setOpenReceipt] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);

  const categories = ['all', 'Sembako', 'Elektronik', 'Pakaian', 'ATK', 'Lainnya'];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      const response = await apiService.getPOSProducts(params);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // Use mock data as fallback if backend fails (e.g. no DB)
      setProducts([
        { id: 1, product_code: 'P001', name: 'Beras Premium 5kg', category: 'Sembako', selling_price: 65000, stock: 50, unit: 'PCS' },
        { id: 2, product_code: 'P002', name: 'Minyak Goreng 2L', category: 'Sembako', selling_price: 32000, stock: 100, unit: 'PCS' },
        { id: 3, product_code: 'P003', name: 'Gula Pasir 1kg', category: 'Sembako', selling_price: 15000, stock: 200, unit: 'PCS' },
        { id: 4, product_code: 'P004', name: 'Teh Celup 25s', category: 'Sembako', selling_price: 5000, stock: 150, unit: 'PCS' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await apiService.getMembers({ limit: 100 });
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchMembers();
  }, [fetchProducts, fetchMembers]);

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      product.product_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && product.stock > 0;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        const product = products.find(p => p.id === productId);
        return { ...item, quantity: Math.min(newQuantity, product.stock) };
      }
      return item;
    }));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const changeAmount = parseFloat(paidAmount) - cartSubtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    if (!paidAmount || parseFloat(paidAmount) < cartSubtotal) {
      alert('Jumlah pembayaran kurang!');
      return;
    }

    try {
      const transactionData = {
        member_id: selectedMember?.id || null,
        line_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        paid_amount: parseFloat(paidAmount),
        transaction_type: 'CASH', // default for POS
        notes: 'POS Transaction'
      };

      const response = await apiService.createPOSTransaction(transactionData);
      
      if (response.data.success) {
        setCompletedTransaction(response.data.data);
        setOpenReceipt(true);
        setOpenCheckout(false);
        setCart([]);
        setPaidAmount('');
        setSelectedMember(null);
        fetchProducts(); // Refresh stock
      }
    } catch (err) {
      console.error('Error processing transaction:', err);
      // Fallback for UI demo if backend/DB is not available
      const mockTransaction = {
        transaction_number: `POS-${Date.now()}`,
        line_items: cart.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.selling_price,
          subtotal: item.quantity * item.selling_price
        })),
        subtotal: cartSubtotal,
        total_amount: cartSubtotal,
        paid_amount: parseFloat(paidAmount),
        change_amount: changeAmount,
        payment_method: paymentMethod,
        member: selectedMember ? { full_name: selectedMember.full_name } : null,
        created_at: new Date().toISOString()
      };
      setCompletedTransaction(mockTransaction);
      setOpenReceipt(true);
      setOpenCheckout(false);
      setCart([]);
      setPaidAmount('');
      setSelectedMember(null);
      alert('Transaksi diproses (Demo Mode)');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            POS - Point of Sale
          </Typography>
          <IconButton onClick={() => setOpenCheckout(true)} disabled={cart.length === 0}>
            <Badge badgeContent={cartCount} color="primary">
              <CartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Search and Filter */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={selectedCategory}
              label="Kategori"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat === 'all' ? 'Semua' : cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Products Grid */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Grid container spacing={2}>
            {filteredProducts.map(product => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => addToCart(product)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <Typography variant="h4" color="text.secondary">📦</Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      noWrap
                      sx={{ mb: 0.5 }}
                    >
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {formatCurrency(product.selling_price)}
                      </Typography>
                      <Chip
                        label={`Stok: ${product.stock}`}
                        size="small"
                        color={product.stock < 10 ? 'error' : 'default'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {product.product_code} • {product.unit}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {filteredProducts.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="text.secondary">Produk tidak ditemukan</Typography>
            </Box>
          )}
          {loading && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography color="text.secondary">Memuat produk...</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Cart Dialog */}
      <Dialog
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Keranjang Belanja</Typography>
            <Typography variant="subtitle1">
              {cartCount} Item
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Pilih Anggota (Opsional)</InputLabel>
              <Select
                value={selectedMember ? selectedMember.id : ''}
                label="Pilih Anggota (Opsional)"
                onChange={(e) => {
                  const member = members.find(m => m.id === e.target.value);
                  setSelectedMember(member);
                }}
              >
                <MenuItem value=""><em>Bukan Anggota / Umum</em></MenuItem>
                {members.map(member => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.member_number} - {member.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Produk</TableCell>
                  <TableCell align="right">Harga</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">Keranjang kosong</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.product_code}</Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.selling_price)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>{formatNumber(item.quantity)}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right" fontWeight="bold">
                        {formatCurrency(item.selling_price * item.quantity)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeFromCart(item.id)}
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
        </DialogContent>
        <Divider />
        <DialogContent sx={{ py: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Metode Pembayaran</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Metode Pembayaran"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="CASH">Tunai</MenuItem>
                  <MenuItem value="DEBIT_CARD">Kartu Debit</MenuItem>
                  <MenuItem value="CREDIT_CARD">Kartu Kredit</MenuItem>
                  <MenuItem value="TRANSFER">Transfer</MenuItem>
                  <MenuItem value="E-WALLET">E-Wallet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Jumlah Bayar"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                inputProps={{ min: cartSubtotal }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="body1">Subtotal: <strong>{formatCurrency(cartSubtotal)}</strong></Typography>
            {paidAmount && (
              <>
                <Typography variant="body1">Kembalian: <strong>{formatCurrency(changeAmount)}</strong></Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCheckout(false)}>Tutup</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCheckout}
            disabled={cart.length === 0 || !paidAmount || parseFloat(paidAmount) < cartSubtotal}
          >
            Bayar ({formatCurrency(cartSubtotal)})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog
        open={openReceipt}
        onClose={() => setOpenReceipt(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5">Struk Pembelian</Typography>
        </DialogTitle>
        <DialogContent>
          {completedTransaction && (
            <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
              <Typography align="center" gutterBottom variant="h6">
                KOPERASI DESA
              </Typography>
              <Typography align="center" variant="body2" gutterBottom>
                Jl. Raya Desa No. 123
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">No: {completedTransaction.transaction_number}</Typography>
                <Typography variant="body2">
                  Tanggal: {new Date(completedTransaction.created_at || completedTransaction.date).toLocaleString('id-ID')}
                </Typography>
                {completedTransaction.member && (
                  <Typography variant="body2">
                    Anggota: {completedTransaction.member.full_name || completedTransaction.member}
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
              <Box sx={{ mt: 1 }}>
                {(completedTransaction.line_items || completedTransaction.items).map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', my: 0.5 }}>
                    <Box sx={{ maxWidth: '70%' }}>
                      <Typography variant="body2">{item.product_name || item.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.quantity} x {formatCurrency(item.unit_price || item.price)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(item.subtotal || (item.price * item.quantity))}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(completedTransaction.subtotal)}</Typography>
                </Box>
                {completedTransaction.tax > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Pajak:</Typography>
                    <Typography variant="body2">{formatCurrency(completedTransaction.tax)}</Typography>
                  </Box>
                )}
                {completedTransaction.discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Diskon:</Typography>
                    <Typography variant="body2">-{formatCurrency(completedTransaction.discount)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body1" fontWeight="bold">Total:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatCurrency(completedTransaction.total_amount || completedTransaction.subtotal)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Bayar ({completedTransaction.payment_method}):</Typography>
                  <Typography variant="body2">{formatCurrency(completedTransaction.paid_amount)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Kembalian:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(completedTransaction.change_amount || completedTransaction.change)}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography align="center" variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Terima kasih atas kunjungan Anda!
              </Typography>
              <Typography align="center" variant="caption" display="block">
                Simpan struk ini sebagai bukti pembayaran yang sah.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceipt(false)}>Tutup</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintReceipt}
          >
            Cetak
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default POSPage;
