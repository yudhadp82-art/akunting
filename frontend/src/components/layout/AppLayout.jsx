import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Collapse,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalance as SavingsIcon,
  Payments as LoanIcon,
  AccountBalanceWallet as AccountingIcon,
  Assessment as ReportIcon,
  TrendingUp as SHUIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  List as ListIcon,
  Add as AddIcon,
  ReceiptLong as JournalIcon,
  AccountTree as LedgerIcon,
  Balance as TrialBalanceIcon,
  AccountCircle,
  PointOfSale as POSIcon,
  Inventory as ProductIcon,
  CloudUpload as DataManagementIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Anggota', icon: <PeopleIcon />, path: '/members' },
  { 
    text: 'Simpanan', 
    icon: <SavingsIcon />, 
    path: '/savings',
    children: [
      { text: 'Daftar Simpanan', icon: <ListIcon fontSize="small" />, path: '/savings' },
      { text: 'Setoran', icon: <AddIcon fontSize="small" />, path: '/savings/deposit' },
      { text: 'Penarikan', icon: <AddIcon fontSize="small" />, path: '/savings/withdraw' },
    ]
  },
  { 
    text: 'Pinjaman', 
    icon: <LoanIcon />, 
    path: '/loans',
    children: [
      { text: 'Daftar Pinjaman', icon: <ListIcon fontSize="small" />, path: '/loans' },
      { text: 'Pengajuan Baru', icon: <AddIcon fontSize="small" />, path: '/loans/new' },
    ]
  },
  { 
    text: 'Akuntansi', 
    icon: <AccountingIcon />, 
    path: '/accounting',
    children: [
      { text: 'Jurnal Umum', icon: <JournalIcon fontSize="small" />, path: '/accounting/journal' },
      { text: 'Buku Besar', icon: <LedgerIcon fontSize="small" />, path: '/accounting/ledger' },
      { text: 'Neraca Saldo', icon: <TrialBalanceIcon fontSize="small" />, path: '/accounting/trial-balance' },
    ]
  },
  {
    text: 'POS',
    icon: <POSIcon />,
    path: '/pos',
    children: [
      { text: 'Kasir', icon: <POSIcon fontSize="small" />, path: '/pos' },
      { text: 'Manajemen Produk', icon: <ProductIcon fontSize="small" />, path: '/pos/products' },
    ]
  },
  {
    text: 'Laporan',
    icon: <ReportIcon />,
    path: '/reports',
    children: [
      { text: 'Posisi Keuangan', path: '/reports/balance-sheet' },
      { text: 'Laba Rugi', path: '/reports/income-statement' },
      { text: 'Perubahan Ekuitas', path: '/reports/equity' },
      { text: 'Arus Kas', path: '/reports/cash-flow' },
    ]
  },
  {
    text: 'Data Management',
    icon: <DataManagementIcon />,
    path: '/data',
    children: [
      { text: 'Import Data', icon: <DataManagementIcon fontSize="small" />, path: '/data/import' },
      { text: 'Export Data', icon: <DataManagementIcon fontSize="small" />, path: '/data/export' },
    ]
  },
  { text: 'SHU', icon: <SHUIcon />, path: '/shu' },
  { text: 'Pengaturan', icon: <SettingsIcon />, path: '/settings' },
];

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Simple authentication check
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(() => {
    // Initialize openSubMenu based on current path
    const initialOpen = {};
    menuItems.forEach(item => {
      if (item.children && item.children.some(child => location.pathname === child.path)) {
        initialOpen[item.text] = true;
      }
    });
    return initialOpen;
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSubMenuToggle = (text) => {
    setOpenSubMenu((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isSubMenuOpen = openSubMenu[item.text];
    const isSelected = location.pathname === item.path || 
                     (hasChildren && item.children.some(child => location.pathname === child.path));

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isSelected && !hasChildren}
            onClick={() => {
              if (hasChildren) {
                handleSubMenuToggle(item.text);
              } else {
                navigate(item.path);
              }
            }}
          >
            <ListItemIcon sx={{ color: isSelected ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
            {hasChildren ? (isSubMenuOpen ? <ExpandLess /> : <ExpandMore />) : null}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => (
                <ListItemButton
                  key={child.text}
                  sx={{ pl: 4 }}
                  selected={location.pathname === child.path}
                  onClick={() => navigate(child.path)}
                >
                  {child.icon && (
                    <ListItemIcon sx={{ minWidth: 35, color: location.pathname === child.path ? 'primary.main' : 'inherit' }}>
                      {child.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText 
                    primary={child.text} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: location.pathname === child.path ? 'bold' : 'normal' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
          Koperasi Desa
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', mb: 1, mx: 'auto' }}>
            <AccountCircle />
          </Avatar>
          <Typography variant="body2" fontWeight="bold">Administrator</Typography>
          <Typography variant="caption" color="text.secondary">Level: Admin Utama</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Keluar" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => location.pathname === item.path)?.text || 'Koperasi Desa'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default AppLayout;
