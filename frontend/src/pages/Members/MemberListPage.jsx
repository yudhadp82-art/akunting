import React, { useEffect, useState, useCallback } from 'react';
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

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        search: searchTerm
      };
      const response = await apiService.getMembers(params);
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      // Fallback to empty or previous data on error
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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

  const handleSubmitForm = async (data) => {
    try {
      if (selectedMember) {
        // Update member
        await apiService.updateMember(selectedMember.id, data);
        alert(`Berhasil memperbarui data anggota: ${data.name}`);
      } else {
        // Create member
        await apiService.createMember(data);
        alert(`Berhasil mendaftarkan anggota baru: ${data.name}`);
      }
      setOpenDialog(false);
      fetchMembers(); // Refresh list
    } catch (err) {
      console.error('Error saving member:', err);
      alert('Gagal menyimpan data anggota. Pastikan backend terhubung.');
    }
  };

  const handleDeleteMember = async (member) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus anggota ${member.name}?`)) {
      try {
        await apiService.deleteMember(member.id);
        alert('Anggota berhasil dihapus.');
        fetchMembers();
      } catch (err) {
        console.error('Error deleting member:', err);
        alert('Gagal menghapus anggota.');
      }
    }
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
                          onClick={() => handleDeleteMember(member)}
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
