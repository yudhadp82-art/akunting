import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccountBalance as BalanceIcon,
  TrendingUp as RevenueIcon,
  Payments as LoanIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardStats();
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { stats, trends, savings_distribution } = data || {};

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard Utama
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Section */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Anggota"
            value={stats?.total_members || 0}
            icon={<PeopleIcon />}
            color="primary"
            subtitle="Anggota aktif saat ini"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Simpanan"
            value={formatCurrency(stats?.total_savings || 0)}
            icon={<BalanceIcon />}
            color="success"
            subtitle="Saldo seluruh anggota"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Pinjaman"
            value={formatCurrency(stats?.total_loans || 0)}
            icon={<LoanIcon />}
            color="warning"
            subtitle="Saldo outstanding aktif"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="SHU Berjalan"
            value={formatCurrency(stats?.current_shu || 0)}
            icon={<RevenueIcon />}
            color="secondary"
            subtitle={`Estimasi tahun buku ${new Date().getFullYear()}`}
          />
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tren Pendapatan & Beban (6 Bulan Terakhir)
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value / 1000000}jt`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" name="Pendapatan" fill="#1976d2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Beban" fill="#dc004e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Distribusi Simpanan
            </Typography>
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={savings_distribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {savings_distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {savings_distribution?.map((item, index) => (
                <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index], mr: 1 }} />
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>{item.name}</Typography>
                  <Typography variant="body2" fontWeight="bold">{item.value}%</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Activity Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Aktivitas Terkini
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {[
              { time: 'Sekarang', user: 'Sistem', action: 'Data statistik diperbarui secara otomatis' },
              { time: '10:30', user: 'Admin', action: 'Posting Jurnal Manual JV2403080001' },
              { time: '09:15', user: 'Kasir', action: 'Setoran Simpanan Sukarela - Budi Santoso' },
            ].map((activity, index) => (
              <Box key={index} sx={{ py: 1.5, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                  {activity.time}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {activity.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Oleh: {activity.user}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
