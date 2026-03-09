# Aplikasi Keuangan Koperasi Desa (SAK EP Compliant)

Aplikasi manajemen keuangan koperasi desa yang sesuai dengan Standar Akuntansi Keuangan Entitas Privat (SAK EP) Indonesia.

## Fitur Utama

- **Manajemen Anggota**: Registrasi, update data, dan status keanggotaan
- **Manajemen Simpanan**: Simpanan Pokok, Simpanan Wajib, Simpanan Sukarela
- **Manajemen Pinjaman**: Pengajuan, approval, pencairan, dan angsuran
- **Sistem Akuntansi**: Pembukuan double-entry, jurnal, buku besar, neraca saldo
- **Laporan SAK EP**: Laporan Posisi Keuangan, Laba Rugi, Perubahan Ekuitas, Arus Kas
- **Manajemen SHU**: Perhitungan dan pembagian Sisa Hasil Usaha

## Teknologi

### Backend
- Node.js + Express.js
- MySQL 8.0
- Sequelize ORM

### Frontend
- React 18
- Material-UI
- React Router
- Axios

## Instalasi

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm atau yarn

### Setup Database

1. Buat database MySQL baru:
```sql
CREATE DATABASE koperasi_desa;
```

2. Update konfigurasi database di `backend/.env`

### Setup Backend

```bash
cd backend
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Jalankan migrasi
npm run migrate

# Seed data awal
npm run seed

# Jalankan server
npm run dev
```

Server backend akan berjalan di `http://localhost:3000`

### Setup Frontend

```bash
cd frontend
npm install

# Jalankan development server
npm start
```

Frontend akan berjalan di `http://localhost:3001`

## Struktur Proyek

```
koperasi-desa/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigurasi database dan constants
│   │   ├── controllers/     # Logic kontroler
│   │   ├── middleware/      # Middleware (auth, error handling)
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Entry point Express
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Initial data seeds
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

## API Endpoints

### Members
- `GET /api/members` - List semua anggota
- `POST /api/members` - Buat anggota baru
- `GET /api/members/:id` - Detail anggota
- `PUT /api/members/:id` - Update anggota
- `DELETE /api/members/:id` - Hapus/deaktifkan anggota

### Savings
- `GET /api/savings` - List simpanan
- `POST /api/savings` - Buka rekening simpanan
- `POST /api/savings/:id/deposit` - Setor simpanan
- `POST /api/savings/:id/withdraw` - Tarik simpanan

### Loans
- `GET /api/loans` - List pinjaman
- `POST /api/loans` - Ajukan pinjaman
- `POST /api/loans/:id/approve` - Setujui pinjaman
- `POST /api/loans/:id/disburse` - Cairkan pinjaman
- `POST /api/loans/:id/repayment` - Bayar angsuran

### Accounting
- `GET /api/accounting/accounts` - Chart of accounts
- `GET /api/accounting/journal` - List jurnal
- `POST /api/accounting/journal` - Buat jurnal
- `POST /api/accounting/journal/:id/post` - Posting jurnal
- `GET /api/accounting/trial-balance` - Neraca saldo

### Reports (SAK EP)
- `GET /api/reports/balance-sheet` - Laporan Posisi Keuangan
- `GET /api/reports/income-statement` - Laporan Laba Rugi
- `GET /api/reports/equity` - Laporan Perubahan Ekuitas
- `GET /api/reports/cash-flow` - Laporan Arus Kas
- `GET /api/reports/notes` - Catatan atas Laporan Keuangan

### SHU
- `GET /api/shu/periods` - List periode SHU
- `POST /api/shu/periods` - Buat periode SHU
- `POST /api/shu/periods/:id/calculate` - Hitung SHU
- `POST /api/shu/periods/:id/distribute` - Bagikan SHU

## Chart of Accounts SAK EP

### Aset (ASET)
- 1-1-1-01: Kas dan Bank
- 1-1-2-01: Piutang Anggota
- 1-1-3-01: Piutang Lain-lain
- 1-2-1-01: Peralatan dan Kendaraan
- 1-2-2-01: Akumulasi Penyusutan

### Kewajiban (KEWAJIBAN)
- 2-1-1-01: Simpanan Anggota
- 2-1-1-02: Simpanan Pokok
- 2-1-1-03: Simpanan Wajib
- 2-1-1-04: Simpanan Sukarela
- 2-1-2-01: Utang Pihak Ketiga
- 2-1-3-01: Bagian SHU yang Belum Dibagikan

### Ekuitas (EKUITAS)
- 3-1-1-01: Simpanan Pokok
- 3-1-2-01: Dana Cadangan
- 3-1-3-01: SHU Tahun Berjalan

### Pendapatan (PENDAPATAN)
- 4-1-1-01: Pendapatan Jasa Pinjaman
- 4-1-2-01: Pendapatan Jasa Lain-lain
- 4-1-3-01: Pendapatan Usaha Lain-lain

### Beban (BEBAN)
- 5-1-1-01: Beban Operasional
- 5-1-2-01: Beban Penyusutan
- 5-1-3-01: Beban Lain-lain
- 5-1-4-01: Beban Pembagian SHU

## Kontribusi

Proyek ini dikembangkan untuk membantu koperasi desa dalam pengelolaan keuangan sesuai standar SAK EP Indonesia.

## Lisensi

ISC
