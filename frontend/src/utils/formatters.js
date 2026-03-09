// Format currency to Indonesian Rupiah
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Format number with commas
export const formatNumber = (value) => {
  return new Intl.NumberFormat('id-ID').format(value || 0);
};

// Format date to Indonesian locale
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format date time
export const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format percentage
export const formatPercent = (value) => {
  return `${parseFloat(value || 0).toFixed(2)}%`;
};

// Format account number
export const formatAccountNumber = (number) => {
  return number || '-';
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    ACTIVE: 'success',
    INACTIVE: 'error',
    WITHDRAWN: 'default',
    PENDING: 'warning',
    APPROVED: 'info',
    REJECTED: 'error',
    COMPLETED: 'success',
    DEFAULTED: 'error',
    CANCELLED: 'default',
    OPEN: 'info',
    CALCULATED: 'warning',
    DISTRIBUTED: 'success',
    CLOSED: 'default',
    PAID: 'success',
    LATE: 'error',
  };
  return colors[status] || 'default';
};

// Get status label in Indonesian
export const getStatusLabel = (status) => {
  const labels = {
    ACTIVE: 'Aktif',
    INACTIVE: 'Tidak Aktif',
    WITHDRAWN: 'Keluar',
    PENDING: 'Menunggu',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
    COMPLETED: 'Selesai',
    DEFAULTED: 'Macet',
    CANCELLED: 'Dibatalkan',
    OPEN: 'Buka',
    CALCULATED: 'Dihitung',
    DISTRIBUTED: 'Dibagikan',
    CLOSED: 'Tutup',
    PAID: 'Lunas',
    LATE: 'Terlambat',
  };
  return labels[status] || status;
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Parse currency string to number
export const parseCurrency = (value) => {
  if (!value) return 0;
  return parseFloat(value.toString().replace(/[^0-9.-]+/g, ''));
};
