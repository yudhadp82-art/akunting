import React, { useEffect, useState } from 'react';
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
  Paper,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatDate, getStatusLabel, getStatusColor } from '../../utils/formatters';
import MemberFormDialog from './MemberFormDialog';

function MemberListPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMembers([
        {
          id: 1,
          member_number: 'ANGG-2024-0001',
          name: 'Budi Santoso',
          id_card_number: '1234567890123456',
          phone: '081234567890',
          join_date: '2024-01-15',
          status: 'ACTIVE',
          total_shu_earned: 1250000,
        },
        {
          id: 2,
          member_number: 'ANGG-2024-0002',
          name: 'Siti Aminah',
          id_card_number: '1234567890123457',
          phone: '081234567891',
          join_date: '2024-02-01',
          status: 'ACTIVE',
          total_shu_earned: 875000,
        },
        {
          id: 3,
          member_number: 'ANGG-2024-0003',
          name: 'Ahmad Yani',
          id_card_number: '1234567890123458',
          phone: '081234567892',
          join_date: '2024-02-15',
          status: 'ACTIVE',
          total_shu_earned: 500000,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddMember = () => {
    setSelectedMember(null);
    setOpenDialog(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMember(null);
  };

  const handleSubmitForm = (data) => {
    if (selectedMember) {
      // Update member (simulate)
      setMembers(members.map(m => m.id === selectedMember.id ? { ...m, ...data } : m));
      alert(`Berhasil memperbarui data anggota: ${data.name}`);
    } else {
      // Create member (simulate)
      const newMember = {
        ...data,
        id: members.length + 1,
        member_number: `ANGG-2024-${String(members.length + 1).padStart(4, '0')}`,
        status: 'ACTIVE',
        total_shu_earned: 0,
      };
      setMembers([...members, newMember]);
      alert(`Berhasil mendaftarkan anggota baru: ${data.name}`);
    }
    setOpenDialog(false);
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.member_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Typography variant="h4">Manajemen Anggota</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddMember}
        >
          Tambah Anggota
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Cari anggota berdasarkan nama atau nomor anggota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nomor Anggota</TableCell>
                  <TableCell>Nama</TableCell>
                  <TableCell>No. KTP</TableCell>
                  <TableCell>Telepon</TableCell>
                  <TableCell>Tanggal Gabung</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total SHU</TableCell>
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
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Tidak ada anggota ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>{member.member_number}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.id_card_number}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{formatDate(member.join_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(member.status)}
                          color={getStatusColor(member.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('id-ID').format(member.total_shu_earned)}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEditMember(member)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => alert(`Hapus ${member.name}`)}
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

      <MemberFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitForm}
        member={selectedMember}
      />
    </Box>
  );
}

export default MemberListPage;
