# Panduan Penggunaan Aplikasi Koperasi Desa
## Sistem Informasi Manajemen Koperasi - SAK EP Compliant

---

## 📚 Daftar Isi

1. [Pengantar Koperasi](#pengantar-koperasi)
2. [Instalasi dan Setup Awal](#instalasi-dan-setup-awal)
3. [Dashboard](#dashboard)
4. [Manajemen Anggota](#manajemen-anggota)
5. [Manajemen Simpanan](#manajemen-simpanan)
6. [Manajemen Pinjaman](#manajemen-pinjaman)
7. [Point of Sale (POS)](#point-of-sale-pos)
8. [Sistem Akuntansi](#sistem-akuntansi)
9. [Laporan Keuangan SAK EP](#laporan-keuangan-sak-ep)
10. [Manajemen SHU](#manajemen-shu)
11. [FAQ dan Troubleshooting](#faq-dan-troubleshooting)

---

## 🏢 Pengantar Koperasi

### Apa itu Koperasi?

**Koperasi** adalah badan usaha yang terdiri dari orang-orang atau badan hukum koperasi dengan berlandaskan kegiatan berdasarkan prinsip koperasi serta sebagai gerakan ekonomi rakyat yang berdasarkan asas kekeluargaan (UU No. 25 Tahun 1992).

### Prinsip-Prinsip Koperasi

1. **Keanggotaan Sukarela dan Terbuka**
   - Setiap orang dapat bergabung dan keluar dari koperasi dengan sukarela

2. **Pengelolaan Demokratis**
   - Setiap anggota memiliki satu suara dalam rapat anggota

3. **Partisipasi Ekonomi Anggota**
   - Anggota harus berpartisipasi dalam aktivitas ekonomi koperasi

4. **Kemandirian**
   - Koperasi harus mandiri dalam pengelolaan usahanya

5. **Pendidikan dan Pelatihan**
   - Koperasi wajib menyelenggarakan pendidikan koperasi

6. **Kerja Sama Antar Koperasi**
   - Koperasi bekerja sama dengan koperasi lainnya

7. **Keadilan Pembagian Hasil Usaha**
   - SHU dibagikan sesuai kontribusi anggota

### Jenis-Jenis Koperasi

1. **Koperasi Konsumsi** - Melayani kebutuhan konsumsi anggota
2. **Koperasi Produksi** - Mengolah hasil produksi anggota
3. **Koperasi Simpan Pinjam** - Menyediakan jasa simpanan dan pinjaman
4. **Koperasi Serba Usaha** - Berbagai jenis usaha sekaligus

### Peran Aplikasi Koperasi Desa

Aplikasi ini membantu pengelola koperasi desa dalam:
- **Manajemen Anggota**: Database anggota dan keanggotaan
- **Simpanan dan Pinjaman**: Transaksi simpanan dan pinjaman
- **Pembukuan**: Catatan transaksi sesuai SAK EP
- **Laporan Keuangan**: Laporan standar SAK EP
- **POS (Point of Sale)**: Sistem kasir untuk usaha koperasi
- **SHU**: Perhitungan dan pembagian Sisa Hasil Usaha

---

## 💻 Instalasi dan Setup Awal

### Persyaratan Sistem

**Minimum Requirements:**
- OS: Windows 10+, macOS 10.15+, atau Linux
- RAM: 4 GB minimum
- Storage: 10 GB available space
- Browser: Chrome 90+, Firefox 88+, Edge 90+

**Backend Requirements:**
- Node.js: v18.x atau lebih baru
- MySQL: v8.0 atau lebih baru
- RAM: 2 GB minimum

### Langkah Instalasi

#### 1. Instalasi Backend

```bash
# Masuk ke direktori backend
cd koperasi-desa/backend

# Install dependencies
npm install

# Setup Database
# 1. Buat database MySQL
mysql -u root -p
CREATE DATABASE koperasi_desa;
exit;

# 2. Konfigurasi environment
# Edit file .env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=koperasi_desa
DB_USER=root
DB_PASSWORD=password_anda

# 3. Jalankan migrasi (buat tabel)
npm run migrate

# 4. Seed data awal (akun-akun default)
npm run seed

# 5. Jalankan server backend
npm run dev
# Server akan berjalan di http://localhost:3000
```

#### 2. Instalasi Frontend

```bash
# Masuk ke direktori frontend
cd koperasi-desa/frontend

# Install dependencies
npm install

# Jalankan server frontend
npm start
# Aplikasi akan berjalan di http://localhost:3001
```

#### 3. Akses Aplikasi

Buka browser dan akses:
- **Frontend**: http://localhost:3001
- **API Backend**: http://localhost:3000

### Login Awal

1. Halaman login akan muncul
2. Username: `admin`
3. Password: `admin123` (default, segera ganti!)
4. Klik tombol "Masuk"

⚠️ **PENTING**: Segera ganti password default setelah login pertama!

---

## 📊 Dashboard

### Gambaran Umum Dashboard

Dashboard memberikan ringkasan real-time dari operasional koperasi:

```
┌─────────────────────────────────────────────┐
│  DASHBOARD - KOPERASI DESA           │
├─────────────────────────────────────────────┤
│                                       │
│  [Statistik Kartu]                     │
│  ┌─────────┐ ┌─────────┐           │
│  │ 150     │ │  25     │           │
│  │ Anggota │ │ Pinjaman│           │
│  └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐           │
│  │ Rp 500M│ │ Rp 200M │           │
│  │Simpanan │ │  SHU    │           │
│  └─────────┘ └─────────┘           │
│                                       │
│  [Grafik Tren Bulanan]               │
│  ┌─────────────────────────┐           │
│  │        ▲              │           │
│  │      / \             │           │
│  │     /   \            │           │
│  │    /─────\           │           │
│  └─────────────────────────┘           │
│                                       │
│  [Transaksi Terbaru]                  │
│  • Setor Simpanan - Budi S.          │
│  • Bayar Angsuran - Siti A.          │
│  • POS Transaksi #12345               │
│                                       │
└─────────────────────────────────────────────┘
```

### Keterangan Dashboard

| Komponen | Deskripsi |
|-----------|-----------|
| **Total Anggota** | Jumlah seluruh anggota aktif koperasi |
| **Total Simpanan** | Jumlah seluruh simpanan anggota (Pokok, Wajib, Sukarela) |
| **Total Pinjaman** | Jumlah pinjaman yang sedang berjalan |
| **SHU Tahun Berjalan** | Estimasi SHU periode saat ini |
| **Grafik** | Tren penjualan/simpanan/pinjaman per bulan |
| **Transaksi Terbaru** | 10 transaksi terakhir di sistem |

### Tips Menggunakan Dashboard

1. **Cek Dashboard Setiap Hari**
   - Monitor angka kunci secara harian
   - Perhatikan tren penurunan/kenaikan

2. **Gunakan Grafik untuk Analisis**
   - Identifikasi pola musiman
   - Prediksi kebutuhan dana

3. **Quick Actions**
   - Klik kartu untuk navigasi cepat
   - Tombol aksi cepat di kanan atas

---

## 👥 Manajemen Anggota

### Konsep Keanggotaan Koperasi

**Anggota Koperasi** adalah pihak yang:
- Telah memenuhi persyaratan keanggotaan
- Telah disetujui oleh rapat anggota
- Memiliki simpanan pokok
- Memiliki hak dan kewajiban sebagai anggota

### Hak dan Kewajiban Anggota

**Hak Anggota:**
1. Menghadiri rapat anggota
2. Memilih dan dipilih menjadi pengurus
3. Mengajukan usul/pendapat
4. Menikmati jasa koperasi
5. Menerima bagian SHU

**Kewajiban Anggota:**
1. Mengikuti AD/ART koperasi
2. Menyetor simpanan pokok dan wajib
3. Memelihara nama baik koperasi
4. Partisipasi dalam usaha koperasi
5. Mematuhi keputusan rapat

### Cara Menambah Anggota Baru

#### Langkah 1: Akses Halaman Anggota

1. Klik menu **Anggota** di sidebar
2. Klik tombol **Tambah Anggota** (ikon + di kanan atas)
3. Form pendaftaran anggota akan muncul

#### Langkah 2: Isi Form Data Anggota

**Form Pendaftaran Anggota:**

```
┌────────────────────────────────────────┐
│  FORM PENDAFTARAN ANGGOTA      │
├────────────────────────────────────────┤
│                                 │
│  [No. Anggota Otomatis]        │
│  Contoh: ANG-2024-001         │
│                                 │
│  Nama Lengkap: *               │
│  [____________________________]     │
│                                 │
│  No. KTP: *                    │
│  [____________________________]     │
│                                 │
│  Tanggal Lahir: *               │
│  [DD/MM/YYYY]                   │
│                                 │
│  Jenis Kelamin: *               │
│  ○ Laki-laki  ○ Perempuan     │
│                                 │
│  No. Telepon:                   │
│  [0812-3456-7890]             │
│                                 │
│  Email:                         │
│  [email@contoh.com]              │
│                                 │
│  Alamat Lengkap: *              │
│  [____________________________]     │
│  [____________________________]     │
│                                 │
│  Tanggal Bergabung: *            │
│  [DD/MM/YYYY]                   │
│                                 │
│  Status:                        │
│  ○ Aktif  ○ Tidak Aktif       │
│                                 │
│  [Batal]  [Simpan]             │
└────────────────────────────────────────┘
```

#### Langkah 3: Simpan Data

1. Isi semua field bertanda * (wajib)
2. Klik tombol **Simpan**
3. No. Anggota akan di-generate otomatis
4. Data anggota tersimpan di database

### Cara Melihat Detail Anggota

1. Klik nama anggota di list
2. Halaman detail akan menampilkan:
   - Informasi pribadi
   - Statistik keanggotaan
   - Riwayat simpanan
   - Riwayat pinjaman
   - Total SHU yang diterima

### Cara Edit/Hapus Anggota

**Edit Anggota:**
1. Klik ikon ✏️ (edit) di baris anggota
2. Ubah data yang diinginkan
3. Klik **Simpan**

**Hapus Anggota:**
1. Klik ikon 🗑️ (hapus) di baris anggota
2. Konfirmasi penghapusan
3. ⚠️ Data tidak dapat dikembalikan

### Pencarian Anggota

Gunakan kolom pencarian untuk:
- Cari berdasarkan nama
- Cari berdasarkan nomor anggota
- Cari berdasarkan no. KTP

### Best Practices Manajemen Anggota

✅ **DO:**
- Validasi data sebelum input (cek KTP asli)
- Buat foto anggota (opsional tapi disarankan)
- Catat tanggal bergabung dengan tepat
- Update status keanggotaan secara berkala
- Arsipkan dokumen anggota (KTP, KK, dll)

❌ **DON'T:**
- Input data anggota ganda
- Input data tidak valid
- Menghapus anggota tanpa alasan yang jelas
- Mengubah nomor anggota (sistem auto-generate)

---

## 💰 Manajemen Simpanan

### Teori Simpanan Koperasi

**Simpanan Koperasi** adalah dana yang dikumpulkan dari anggota untuk:
- Modal usaha koperasi
- Cadangan dana
- Simpanan sukarela untuk kepentingan anggota

### Jenis-Jenis Simpanan

| Jenis Simpanan | Deskripsi | Kewajiban | Min. Setoran |
|----------------|-----------|-------------|--------------|
| **Simpanan Pokok** | Simpanan wajib saat bergabung | Wajib sekali | Rp 100.000 |
| **Simpanan Wajib** | Simpanan bulanan wajib | Wajib bulanan | Rp 50.000 |
| **Simpanan Sukarela** | Simpanan sesuai kemampuan | Sukarela | Rp 10.000 |

### Cara Membuka Rekening Simpanan

#### Langkah 1: Pilih Anggota

1. Akses menu **Simpanan**
2. Cari atau pilih anggota
3. Klik **Buka Rekening Simpanan**

#### Langkah 2: Pilih Jenis Simpanan

```
┌────────────────────────────────────────┐
│  BUKA REKENING SIMPANAN          │
├────────────────────────────────────────┤
│                                 │
│  Nama Anggota: Budi Santoso      │
│  No. Anggota: ANG-2024-001       │
│                                 │
│  Jenis Simpanan: *               │
│  ◉ Simpanan Pokok               │
│  ○ Simpanan Wajib               │
│  ○ Simpanan Sukarela             │
│                                 │
│  Jumlah Awal: *                 │
│  [Rp 100.000]                    │
│                                 │
│  [Batal]  [Buka Rekening]        │
└────────────────────────────────────────┘
```

#### Langkah 3: Konfirmasi

1. Cek data yang diinput
2. Klik **Buka Rekening**
3. No. Rekening akan di-generate otomatis
4. Jurnal pembukuan akan terbentuk otomatis

### Cara Melakukan Setoran Simpanan

#### Langkah 1: Akses Menu Simpanan

1. Klik menu **Simpanan** di sidebar
2. Cari rekening simpanan yang diinginkan
3. Klik tombol **Setor**

#### Langkah 2: Input Data Setoran

```
┌────────────────────────────────────────┐
│  SETORAN SIMPANAN                │
├────────────────────────────────────────┤
│                                 │
│  No. Rekening: SIM-2024-001      │
│  Nama Anggota: Budi Santoso      │
│  Jenis: Simpanan Wajib          │
│  Saldo Awal: Rp 250.000          │
│                                 │
│  Jumlah Setoran: *               │
│  [Rp 50.000]                     │
│                                 │
│  Keterangan:                     │
│  [Setoran bulan Januari 2024]     │
│                                 │
│  Total Saldo Baru: Rp 300.000    │
│                                 │
│  [Batal]  [Proses Setoran]        │
└────────────────────────────────────────┘
```

#### Langkah 3: Konfirmasi dan Proses

1. Verifikasi jumlah setoran
2. Klik **Proses Setoran**
3. Saldo rekening akan bertambah
4. Jurnal pembukuan otomatis terbentuk:
   - **Debit**: Kas dan Bank
   - **Credit**: Simpanan Anggota (sub-akun per anggota)

### Cara Melakukan Penarikan Simpanan

**Aturan Penarikan:**
- Simpanan Pokok: Tidak dapat ditarik (kecuali keluar)
- Simpanan Wajib: Tidak dapat ditarik (kecuali keluar)
- Simpanan Sukarela: Dapat ditarik kapan saja

#### Langkah 1: Pilih Rekening

1. Akses menu **Simpanan**
2. Cari rekening simpanan sukarela
3. Klik tombol **Tarik**

#### Langkah 2: Input Data Penarikan

```
┌────────────────────────────────────────┐
│  PENARIKAN SIMPANAN              │
├────────────────────────────────────────┤
│                                 │
│  No. Rekening: SIM-2024-003      │
│  Nama Anggota: Budi Santoso      │
│  Jenis: Simpanan Sukarela        │
│  Saldo Tersedia: Rp 500.000      │
│                                 │
│  Jumlah Penarikan: *             │
│  [Rp 100.000]                    │
│                                 │
│  Keterangan:                     │
│  [Untuk biaya sekolah anak]       │
│                                 │
│  Total Saldo Baru: Rp 400.000    │
│                                 │
│  [Batal]  [Proses Penarikan]      │
└────────────────────────────────────────┘
```

#### Langkah 3: Konfirmasi dan Proses

1. Pastikan saldo mencukupi
2. Klik **Proses Penarikan**
3. Saldo rekening akan berkurang
4. Jurnal pembukuan otomatis terbentuk:
   - **Debit**: Simpanan Anggota
   - **Credit**: Kas dan Bank

### Cara Melihat Mutasi Rekening

1. Klik rekening simpanan di list
2. Halaman detail akan menampilkan:
   - Informasi rekening
   - Saldo saat ini
   - Tabel mutasi (setoran/penarikan)
   - Total setoran & penarikan

### Best Practices Manajemen Simpanan

✅ **DO:**
- Buat bukti setoran/penarikan
- Update saldo secara real-time
- Cek kebijakan penarikan sebelum proses
- Catat keterangan yang jelas
- Rekapitulasi setoran bulanan

❌ **DON'T:**
- Izinkan penarikan melebihi saldo
- Proses penarikan simpanan pokok/wajib
- Lupa update saldo setelah transaksi
- Input salah jenis simpanan

---

## 💵 Manajemen Pinjaman

### Teori Pinjaman Koperasi

**Pinjaman Koperasi** adalah fasilitas pembiayaan untuk anggota dengan:
- Bunga yang lebih rendah dari bank
- Syarat yang lebih mudah
- Tenor yang fleksibel
- Proses yang cepat

### Jenis-Jenis Pinjaman

| Jenis | Maksimum Pinjaman | Bunga | Tenor | Jaminan |
|--------|-------------------|-------|--------|----------|
| **Pinjaman Mikro** | Rp 5.000.000 | 2%/bln | 12 bulan | Tidak wajib |
| **Pinjaman Menengah** | Rp 20.000.000 | 1.75%/bln | 24 bulan | Wajib |
| **Pinjaman Konsumtif** | Rp 10.000.000 | 1.5%/bln | 18 bulan | Wajib |

### Alur Proses Pinjaman

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Pengajuan  │────▶│ Approval  │────▶│ Pencairan│────▶│Angsuran  │────▶│  Pelunasan │
│  Anggota  │     │ Pengurus │     │  Dana    │     │ Bulanan  │     │           │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
     1                  2                  3                  4                  5
```

### Cara Mengajukan Pinjaman

#### Langkah 1: Akses Form Pengajuan

1. Klik menu **Pinjaman**
2. Klik **Ajukan Pinjaman Baru**
3. Form pengajuan akan muncul

#### Langkah 2: Isi Data Pinjaman

```
┌────────────────────────────────────────┐
│  FORM PENGAJUAN PINJAMAN         │
├────────────────────────────────────────┤
│                                 │
│  Nama Anggota: *               │
│  [Budi Santoso]                   │
│  (ANG-2024-001)                 │
│                                 │
│  Jenis Pinjaman: *               │
│  ◉ Pinjaman Mikro                │
│  ○ Pinjaman Menengah              │
│  ○ Pinjaman Konsumtif             │
│                                 │
│  Jumlah Pinjaman: *             │
│  [Rp 5.000.000]                  │
│  (Max: Rp 5.000.000)             │
│                                 │
│  Jangka Waktu: *                │
│  [12 bulan]                      │
│                                 │
│  Tujuan Penggunaan: *            │
│  [Modal usaha warung]             │
│                                 │
│  Jaminan:                       │
│  [Tidak ada jaminan]              │
│                                 │
│  [Batal]  [Ajukan]              │
└────────────────────────────────────────┘
```

#### Langkah 3: Submit Pengajuan

1. Klik **Ajukan**
2. Nomor pinjaman akan di-generate
3. Status pinjaman: **PENDING**
4. Menunggu approval pengurus

### Cara Approval Pinjaman (Pengurus)

1. Akses menu **Pinjaman**
2. Cari pinjaman status PENDING
3. Klik **Setujui**
4. Input approval details:
   - Nama pengurus yang menyetujui
   - Catatan approval
5. Klik **Setujui**
6. Status berubah menjadi **ACTIVE**

### Cara Pencairan Dana Pinjaman

1. Klik pinjaman yang sudah di-approve
2. Klik **Cairkan Dana**
3. Sistem akan:
   - Hitung jadwal angsuran
   - Buat jurnal pembukuan:
     - **Debit**: Piutang Anggota
     - **Credit**: Kas dan Bank
   - Update status menjadi **ACTIVE**
4. Dana dapat diberikan ke anggota

### Cara Membayar Angsuran

#### Langkah 1: Pilih Pinjaman

1. Akses menu **Pinjaman**
2. Cari pinjaman yang aktif
3. Klik pinjaman untuk lihat detail

#### Langkah 2: Lihat Jadwal Angsuran

```
┌────────────────────────────────────────┐
│  JADWAL ANGSURAN PINJAMAN       │
├────────────────────────────────────────┤
│                                 │
│  No. Pinjaman: PINJ-2024-001    │
│  Jumlah: Rp 5.000.000           │
│  Bunga: 2% per bulan             │
│                                 │
│  ┌───┬────────┬────────┬────────┐│
│  │ No │Tgl Jatuh│Pokok   │Bunga   ││
│  ├───┼────────┼────────┼────────┤│
│  │ 1  │15/02/24 │416.667 │100.000 ││
│  │ 2  │15/03/24 │416.667 │100.000 ││
│  │ 3  │15/04/24 │416.667 │100.000 ││
│  │... │...      │...     │...     ││
│  └───┴────────┴────────┴────────┘│
│                                 │
│  Status Lunas: 3/12 bulan         │
└────────────────────────────────────────┘
```

#### Langkah 3: Bayar Angsuran

1. Klik tombol **Bayar** pada angsuran yang jatuh tempo
2. Input data pembayaran:
```
┌────────────────────────────────────────┐
│  PEMBAYARAN ANGSURAN            │
├────────────────────────────────────────┤
│                                 │
│  Angsuran Ke-: 4               │
│  Jatuh Tempo: 15/05/2024        │
│  Pokok: Rp 416.667             │
│  Bunga: Rp 100.000             │
│  Total: Rp 516.667             │
│                                 │
│  Jumlah Dibayar: *             │
│  [Rp 516.667]                   │
│                                 │
│  [Batal]  [Bayar]               │
└────────────────────────────────────────┘
```
3. Klik **Bayar**
4. Jurnal pembukuan otomatis terbentuk:
   - **Debit**: Kas dan Bank (pokok + bunga)
   - **Credit**: Piutang Anggota (pokok)
   - **Credit**: Pendapatan Jasa Pinjaman (bunga)

### Cara Lihat Riwayat Pinjaman

1. Klik nama anggota di halaman Pinjaman
2. Semua riwayat pinjaman anggota akan ditampilkan
3. Klik detail untuk lihat angsuran

### Best Practices Manajemen Pinjaman

✅ **DO:**
- Cek riwayat kredit sebelum approve
- Verifikasi jaminan jika diperlukan
- Hitung kemampuan bayar anggota
- Buat surat perjanjian pinjaman
- Follow-up angsuran jatuh tempo
- Catat alasan penolakan jika reject

❌ **DON'T:**
- Approve tanpa verifikasi
- Cairkan tanpa approval
- Lupa hitung bunga
- Izinkan pinjaman melebihi plafon

---

## 🛒 Point of Sale (POS)

### Konsep POS Koperasi

**POS (Point of Sale)** adalah sistem kasir untuk usaha ritel koperasi:
- Toko kelontong
- Toko serba usaha
- Warung koperasi

### Fitur-fitur POS

1. **Katalog Produk**
   - Grid produk dengan foto
   - Filter kategori
   - Pencarian produk
   - Indikator stok

2. **Keranjang Belanja**
   - Tambah/hapus produk
   - Ubah quantity
   - Hitung otomatis
   - Aplikasi diskon

3. **Checkout**
   - Pilih metode pembayaran
   - Input jumlah bayar
   - Hitung kembalian
   - Cetak struk

4. **Manajemen Stok**
   - Update stok otomatis
   - Alert stok rendah
   - Restock produk

### Cara Menggunakan POS

#### Langkah 1: Akses Halaman POS

1. Klik menu **POS → Kasir**
2. Halaman POS akan terbuka

#### Langkah 2: Tambah Produk ke Keranjang

**Cara 1: Klik Produk**
- Klik kartu produk
- Produk masuk keranjang

**Cara 2: Pencarian**
- Ketik nama/kode produk di kolom search
- Hasil akan filter secara real-time

**Cara 3: Scan Barcode** (jika ada scanner)
- Scan barcode produk
- Produk otomatis masuk keranjang

#### Langkah 3: Ubah Quantity

1. Klik tombol keranjang di kanan atas
2. Dialog keranjang akan muncul
3. Klik **+** atau **-** untuk ubah quantity
4. Klik **🗑️** untuk hapus item

#### Langkah 4: Pilih Anggota (Opsional)

1. Di dialog keranjang, search anggota
2. Pilih anggota jika pembelian anggota
3. Biarkan kosong jika pembelian umum

#### Langkah 5: Checkout

1. Klik tombol **Bayar** di keranjang
2. Pilih metode pembayaran:
   - Tunai
   - Kartu Debit
   - Kartu Kredit
   - Transfer
   - E-Wallet
3. Input jumlah bayar
4. Sistem hitung kembalian otomatis
5. Klik **Bayar**

#### Langkah 6: Cetak Struk

1. Dialog struk akan muncul otomatis
2. Cek detail pembelian
3. Klik **Cetak** untuk print
4. Tutup dialog

### Cara Menambah Produk Baru

#### Langkah 1: Akses Manajemen Produk

1. Klik menu **POS → Manajemen Produk**
2. List produk akan muncul

#### Langkah 2: Tambah Produk

1. Klik **Tambah Produk**
2. Form produk akan muncul:
```
┌────────────────────────────────────────┐
│  FORM PRODUK                      │
├────────────────────────────────────────┤
│                                 │
│  Kode Produk: *                 │
│  [P011]                          │
│                                 │
│  Barcode:                        │
│  [8991011]                       │
│                                 │
│  Nama Produk: *                  │
│  [Kecap Manis 250g]             │
│                                 │
│  Kategori: *                    │
│  [Sembako ▼]                     │
│                                 │
│  Satuan: *                      │
│  [PCS ▼]                         │
│                                 │
│  Harga Beli:                    │
│  [Rp 12.000]                     │
│                                 │
│  Harga Jual: *                  │
│  [Rp 15.000]                     │
│                                 │
│  Stok Awal: *                   │
│  [50]                             │
│                                 │
│  Stok Minimum:                   │
│  [10]                             │
│                                 │
│  Deskripsi:                      │
│  [____________________________]     │
│                                 │
│  [Batal]  [Simpan]              │
└────────────────────────────────────────┘
```

3. Klik **Simpan**

### Cara Mengedit/Hapus Produk

**Edit:**
1. Klik ikon ✏️ di baris produk
2. Ubah data yang diinginkan
3. Klik **Simpan**

**Hapus:**
1. Klik ikon 🗑️ di baris produk
2. Konfirmasi penghapusan
3. ⚠️ Stok produk akan dihapus juga

### Best Practices POS

✅ **DO:**
- Scan barcode untuk akurasi
- Update stok secara berkala
- Cek stok minimum untuk restock
- Buat struk untuk setiap transaksi
- Backup data transaksi harian
- Rekapitulasi penjualan harian

❌ **DON'T:**
- Input produk ganda
- Lupa update stok setelah penjualan
- Izinkan penjualan melebihi stok
- Input harga salah
- Lupa cetak struk

---

## 📒 Sistem Akuntansi

### Konsep Akuntansi Koperasi

**Akuntansi** adalah sistem pencatatan transaksi keuangan dengan prinsip:
- **Double-Entry (Pembukuan Berpasangan)**
- Setiap transaksi memiliki debit dan credit
- Total debit = Total credit

### Prinsip Double-Entry

```
Setiap transaksi minimal punya 2 akun:

Contoh: Setor Simpanan Rp 100.000

  ┌─────────────────┐
  │  JURNAL #123  │
  ├─────────────────┤
  │               │
  │  Akun          │  Debit   │  Credit  │
  │  ─────────────────────────── │
  │  Kas dan Bank  │  100.000 │          │
  │  Simpanan Budi  │          │  100.000 │
  │  ─────────────────────────── │
  │  TOTAL         │  100.000 │  100.000 │
  └─────────────────┘
  Balance ✓
```

### Akun-Akun Pembukuan (Chart of Accounts)

**Klasifikasi Akun SAK EP:**

| Kode | Jenis Akun | Contoh | Balance |
|-------|-------------|---------|----------|
| 1-x-x-x | **ASET** | Kas, Piutang, Peralatan | Debit |
| 2-x-x-x | **KEWAJIBAN** | Simpanan, Utang | Credit |
| 3-x-x-x | **EKUITAS** | Modal, Dana Cadangan | Credit |
| 4-x-x-x | **PENDAPATAN** | Jasa Pinjaman, Jasa Lain | Credit |
| 5-x-x-x | **BEBAN** | Operasional, Penyusutan | Debit |

### Cara Membuat Jurnal Manual

#### Langkah 1: Akses Jurnal Umum

1. Klik menu **Akuntansi → Jurnal Umum**
2. Form jurnal akan muncul

#### Langkah 2: Input Data Jurnal

```
┌────────────────────────────────────────┐
│  JURNAL PEMBUKUAN                │
├────────────────────────────────────────┤
│                                 │
│  No. Voucher: JNL-2024-001      │
│  Tanggal: *                     │
│  [15/01/2024]                   │
│                                 │
│  Deskripsi: *                    │
│  [____________________________]     │
│                                 │
│  [+] Tambah Baris Jurnal         │
│                                 │
│  ┌───┬─────────┬────────┬────────┐│
│  │No.│  Akun   │ Debit  │Credit ││
│  ├───┼─────────┼────────┼────────┤│
│  │ 1  │Kas     │100.000 │       ││
│  │ 2  │Beban   │ 10.000 │       ││
│  │ 3  │Utang   │       │ 90.000 ││
│  └───┴─────────┴────────┴────────┘│
│  │ TOTAL │ 110.000│ 90.000 ││
│                                 │
│  Balance: Rp 20.000 (TIDAK)       │
│  ❌ Total Debit ≠ Total Credit   │
│                                 │
│  [Batal]  [Posting Jurnal]        │
└────────────────────────────────────────┘
```

#### Langkah 3: Validasi

1. Cek balance (total debit = total credit)
2. Jika tidak balance, sistem akan reject
3. Perbaiki sampai balance

#### Langkah 4: Posting Jurnal

1. Klik **Posting Jurnal**
2. Saldo akun akan diperbarui
3. Status jurnal: POSTED
4. Tidak bisa diedit setelah posting

### Cara Melihat Buku Besar

1. Klik menu **Akuntansi → Buku Besar**
2. Pilih akun yang ingin dilihat
3. Semua transaksi akun akan ditampilkan:
   - Tanggal
   - No. voucher
   - Deskripsi
   - Debit/Credit
   - Saldo berjalan

### Cara Lihat Neraca Saldo (Trial Balance)

1. Klik menu **Akuntansi → Neraca Saldo**
2. Tabel neraca saldo akan muncul:
   - Semua akun
   - Total debit
   - Total credit
   - Saldo akhir
3. Validasi: Total debit harus = Total credit

### Mapping Transaksi ke Jurnal

**Transaksi Otomatis ke Jurnal:**

| Transaksi | Akun Debit | Akun Credit |
|-----------|--------------|--------------|
| Setor Simpanan | Kas dan Bank | Simpanan Anggota |
| Tarik Simpanan | Simpanan Anggota | Kas dan Bank |
| Cairkan Pinjaman | Piutang Anggota | Kas dan Bank |
| Bayar Pokok | Kas dan Bank | Piutang Anggota |
| Bayar Bunga | Kas dan Bank | Pendapatan Jasa |
| POS Penjualan | Kas dan Bank | Pendapatan Usaha |
| POS Pembelian | Beban Operasional | Kas dan Bank |

### Best Practices Akuntansi

✅ **DO:**
- Input jurnal setiap hari
- Validasi double-entry
- Posting rutin (harian/mingguan)
- Rekapitulasi bulanan
- Arsip voucher fisik
- Backup data akuntansi

❌ **DON'T:**
- Input jurnal tidak balance
- Lupa posting jurnal
- Edit jurnal yang sudah posting
- Salah klasifikasi akun
- Lupa catat referensi transaksi

---

## 📈 Laporan Keuangan SAK EP

### Standar Akuntansi Keuangan (SAK EP)

**SAK EP** adalah standar akuntansi Indonesia untuk entitas privat:
- Sesuai IAI (Institut Akuntan Indonesia)
- Disahkan oleh DSAK
- Wajib untuk koperasi

### Laporan-Laporan SAK EP

#### 1. Laporan Posisi Keuangan (Neraca)

**Definisi:**
Laporan keuangan yang menunjukkan aset, kewajiban, dan ekuitas pada tanggal tertentu.

**Struktur:**
```
┌────────────────────────────────────────┐
│  LAPORAN POSISI KEUANGAN        │
│  KOPERASI DESA                   │
│  Per: 31 Desember 2024           │
├────────────────────────────────────────┤
│                                 │
│  ASET                             │
│  ┌─────────────────────────────┐   │
│  │ Aset Lancar            │   │
│  │   Kas dan Bank        Rp  │   │
│  │   Piutang Anggota    Rp  │   │
│  │   Persediaan         Rp  │   │
│  │   Total Aset Lancar    Rp  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Aset Tetap             │   │
│  │   Peralatan          Rp  │   │
│  │   Kendaraan          Rp  │   │
│  │   Akumul. Penyusutan (Rp)│   │
│  │   Total Aset Tetap      Rp  │   │
│  └─────────────────────────────┘   │
│  TOTAL ASET                 Rp  │   │
│                                 │
│  KEWAJIBAN DAN EKUITAS           │
│  ┌─────────────────────────────┐   │
│  │ Kewajiban Jangka Pendek│   │
│  │   Simpanan Anggota   Rp  │   │
│  │   Utang Pihak Ketiga  Rp  │   │
│  │   Total Kewajiban J.P.  Rp  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Ekuitas                 │   │
│  │   Simpanan Pokok     Rp  │   │
│  │   Dana Cadangan       Rp  │   │
│  │   SHU Tahun Berjalan Rp  │   │
│  │   Total Ekuitas        Rp  │   │
│  └─────────────────────────────┘   │
│  TOTAL KEWAJIBAN & EKUITAS  Rp  │   │
└────────────────────────────────────────┘
```

**Cara Generate:**
1. Klik menu **Laporan → Posisi Keuangan**
2. Pilih tanggal laporan
3. Klik **Generate**
4. Laporan akan muncul
5. Export ke PDF/Excel jika diperlukan

#### 2. Laporan Laba Rugi

**Definisi:**
Laporan yang menunjukkan pendapatan, beban, dan laba/rugi suatu periode.

**Struktur:**
```
┌────────────────────────────────────────┐
│  LAPORAN LABA RUGI              │
│  KOPERASI DESA                   │
│  Per: 1 Jan - 31 Des 2024       │
├────────────────────────────────────────┤
│                                 │
│  PENDAPATAN                      │
│  ┌─────────────────────────────┐   │
│  │ Pendapatan Jasa Pinjaman│   │
│  │ Pendapatan Jasa Lain     │   │
│  │ Pendapatan Usaha Lain    │   │
│  │ Total Pendapatan          │   │
│  └─────────────────────────────┘   │
│                                 │
│  BEBAN                           │
│  ┌─────────────────────────────┐   │
│  │ Beban Operasional       │   │
│  │ Beban Penyusutan       │   │
│  │ Beban Lain-lain        │   │
│  │ Total Beban             │   │
│  └─────────────────────────────┘   │
│                                 │
│  LABA BERSIH SEBELUM PAJAK    │   │
│  Beban Pajak                      │   │
│  LABA BERSIH                      │   │
└────────────────────────────────────────┘
```

#### 3. Laporan Perubahan Ekuitas

**Definisi:**
Laporan yang menunjukkan perubahan ekuitas koperasi selama suatu periode.

#### 4. Laporan Arus Kas

**Definisi:**
Laporan yang menunjukkan aliran kas masuk dan keluar dari aktivitas operasional, investasi, dan pendanaan.

**Kategori:**
- **Arus Kas dari Aktivitas Operasional**
- **Arus Kas dari Aktivitas Investasi**
- **Arus Kas dari Aktivitas Pendanaan**

### Cara Membuat Laporan

#### Langkah 1: Pilih Jenis Laporan

1. Klik menu **Laporan**
2. Pilih jenis laporan yang diinginkan

#### Langkah 2: Filter Periode

1. Pilih tanggal awal dan akhir
2. Atau pilih periode pre-defined (bulanan/tahunan)
3. Klik **Generate**

#### Langkah 3: Review dan Export

1. Review data laporan
2. Klik **Export PDF** atau **Export Excel**
3. Laporan dapat diarsip atau dicetak

### Catatan atas Laporan Keuangan (CAK)

**Catatan yang wajib dibuat:**
1. Informasi Umum Koperasi
2. Kebijakan Akuntansi Penting
3. Penjelasan Akun-Akun Signifikan
4. Kewajiban Kontinjensi
5. Transaksi Pihak Berelasi
6. Jatuh Tempo dan Jenis Utang

### Best Practices Laporan

✅ **DO:**
- Buat laporan rutin (bulanan/tahunan)
- Validasi angka sebelum publish
- Simpan laporan untuk audit
- Distribusi ke pengurus sesuai aturan
- Backup laporan digital

❌ **DON'T:**
- Buat laporan tanpa validasi
- Lupa catat CAK
- Publish laporan yang salah
- Lupa backup laporan

---

## 🎯 Manajemen SHU

### Konsep SHU (Sisa Hasil Usaha)

**SHU** adalah selisih antara seluruh pendapatan dan seluruh beban koperasi dalam satu tahun buku yang tidak dibagi-bagikan.

### Rumus SHU

```
Total SHU = Total Pendapatan - Total Beban
```

### Pembagian SHU

**Komponen Pembagian SHU:**

| Komponen | Prosentase | Deskripsi |
|-----------|------------|-----------|
| **Jasa Modal** | 25-40% | Bagian SHU berdasarkan simpanan anggota |
| **Jasa Usaha** | 40-55% | Bagian SHU berdasarkan transaksi anggota |
| **Pendidikan** | 5-10% | Dana pendidikan koperasi |
| **Sosial** | 5-10% | Dana sosial koperasi |
| **Dana Cadangan** | 5-10% | Dana cadangan koperasi |

**Total untuk Anggota:**
```
SHU Anggota = Jasa Modal + Jasa Usaha
```

### Rumus Perhitungan SHU Anggota

```
Jasa Modal = (Simpanan Anggota / Total Simpanan) × % Jasa Modal × Total SHU

Jasa Usaha = (Volume Transaksi Anggota / Total Transaksi) × % Jasa Usaha × Total SHU

Total SHU Anggota = Jasa Modal + Jasa Usaha
```

### Cara Menghitung SHU

#### Langkah 1: Buat Periode SHU

1. Klik menu **SHU**
2. Klik **Buat Periode SHU**
3. Input data periode:
```
┌────────────────────────────────────────┐
│  BUAT PERIODE SHU               │
├────────────────────────────────────────┤
│                                 │
│  Nama Periode: *               │
│  [Tahun Buku 2024]              │
│                                 │
│  Tanggal Mulai: *              │
│  [01/01/2024]                   │
│                                 │
│  Tanggal Akhir: *               │
│  [31/12/2024]                   │
│                                 │
│  [Batal]  [Buat Periode]        │
└────────────────────────────────────────┘
```
4. Klik **Buat Periode**
5. Status: **OPEN**

#### Langkah 2: Hitung SHU

1. Klik tombol **Hitung SHU** pada periode
2. Sistem akan:
   - Hitung total pendapatan dari jurnal
   - Hitung total beban dari jurnal
   - Hitung SHU bersih
   - Buat aturan pembagian SHU
3. Status berubah: **CALCULATED**

#### Langkah 3: Review Perhitungan

1. Klik periode untuk lihat detail
2. Review:
   - Total pendapatan
   - Total beban
   - SHU bersih
   - Aturan pembagian
3. Validasi perhitungan

#### Langkah 4: Distribusikan SHU

1. Klik tombol **Bagikan SHU**
2. Sistem akan:
   - Hitung Jasa Modal per anggota
   - Hitung Jasa Usaha per anggota
   - Jumlahkan total SHU per anggota
   - Update saldo anggota
   - Buat jurnal pembukuan:
     - **Debit**: SHU Tahun Berjalan
     - **Credit**: Bagian SHU yang Belum Dibagikan
3. Status berubah: **DISTRIBUTED**

#### Langkah 5: Bayarkan SHU ke Anggota

1. Ambil list distribusi SHU
2. Hubungi anggota untuk pembayaran
3. Update status distribusi setelah dibayar

### Cara Melihat Detail SHU

**Lihat Periode:**
1. Klik menu **SHU**
2. List semua periode akan muncul
3. Klik periode untuk lihat detail

**Lihat Distribusi:**
1. Dalam detail periode, klik **Lihat Detail**
2. Semua distribusi ke anggota akan ditampilkan
3. Export jika diperlukan

### Cara Mengubah Aturan Pembagian SHU

1. Klik menu **SHU → Aturan Pembagian**
2. Aturan default akan muncul:
   - Jasa Modal: 30%
   - Jasa Usaha: 50%
   - Pendidikan: 5%
   - Sosial: 5%
   - Dana Cadangan: 10%
3. Ubah sesuai keputusan RAT
4. Klik **Simpan**

### Best Practices SHU

✅ **DO:**
- Hitung SHU rutin (tahunan)
- Validasi perhitungan
- Dapatkan persetujuan RAT
- Dokumentasikan pembagian
- Bayarkan SHU tepat waktu
- Update saldo anggota
- Buat laporan SHU

❌ **DON'T:**
- Hitung SHU tanpa validasi
- Bagikan SHU tanpa persetujuan RAT
- Salah hitung komponen SHU
- Lupa update saldo anggota
- Lupa catat jurnal SHU

---

## ❓ FAQ dan Troubleshooting

### FAQ Umum

**Q: Apa yang harus dilakukan jika lupa password?**
A: Hubungi administrator sistem untuk reset password.

**Q: Bagaimana cara backup data?**
A:
1. Backend: Export database MySQL
2. Frontend: Data tersimpan di server backend
3. File backup simpan di lokasi aman

**Q: Apakah aplikasi bisa diakses secara offline?**
A: Tidak, aplikasi memerlukan koneksi internet untuk akses server.

**Q: Bagaimana cara restore data?**
A:
1. Import database MySQL dari backup
2. Verifikasi data sesudah restore
3. Notifikasi ke semua pengguna

**Q: Apakah ada limitasi jumlah anggota?**
A: Tidak, sistem dapat menangani jumlah anggota yang tidak terbatas.

### Troubleshooting

**Masalah: Tidak bisa login**
- Cek koneksi internet
- Cek username/password
- Clear cache browser
- Coba browser lain

**Masalah: Data tidak tersimpan**
- Cek koneksi database
- Cek error di browser console
- Cek permission database user
- Coba refresh halaman

**Masalah: Laporan tidak muncul**
- Cek data jurnal sudah posting
- Cek periode laporan benar
- Cek filter tanggal
- Refresh halaman

**Masalah: Hitungan tidak balance**
- Cek jurnal ada yang tidak balance
- Cek ada jurnal yang belum posting
- Cek akun yang salah klasifikasi
- Rehitung neraca saldo

**Masalah: Stok tidak update otomatis**
- Cek POS transaction sudah complete
- Cek jurnal terbentuk
- Cek error di log
- Restart server jika perlu

### Error Messages dan Solusi

| Error | Penyebab | Solusi |
|--------|-----------|---------|
| "Database connection failed" | MySQL tidak berjalan | Start MySQL service |
| "Insufficient stock" | Stok kurang | Update stok produk |
| "Invalid credentials" | Username/password salah | Cek login data |
| "Balance not equal" | Debit ≠ Credit | Perbaiki jurnal |
| "Duplicate entry" | Data sudah ada | Cek data duplicate |

### Technical Support

Jika mengalami masalah teknis:
1. Cek dokumentasi ini
2. Cek log error
3. Hubungi technical support
4. Screenshot error message
5. Catat langkah-langkah yang menyebabkan error

---

## 📝 Checklist Harian Pengelola Koperasi

### Pagi (Setiap Hari)
- [ ] Cek Dashboard ringkasan
- [ ] Review transaksi hari sebelumnya
- [ ] Proses transaksi pending
- [ ] Cek notifikasi penting

### Siang (Setiap Hari)
- [ ] Proses setoran simpanan
- [ ] Proses penarikan simpanan
- [ ] Proses approval pinjaman
- [ ] Jalankan POS jika ada transaksi
- [ ] Proses pembayaran angsuran

### Sore (Setiap Hari)
- [ ] Input jurnal manual jika ada
- [ ] Review posisi kas
- [ ] Backup data harian
- [ ] Close kas hari ini

### Mingguan
- [ ] Rekapitulasi transaksi mingguan
- [ ] Generate laporan mingguan
- [ ] Review stok produk
- [ ] Follow-up angsuran jatuh tempo
- [ ] Meeting evaluasi mingguan

### Bulanan
- [ ] Hitung SHU bulanan (jika ada)
- [ ] Generate laporan bulanan
- [ ] Rekapitulasi anggota baru/keluar
- [ ] Audit internal bulanan
- [ ] RAT (Rapat Anggota Tahunan)
- [ ] Backup bulanan

### Tahunan
- [ ] Tutup buku tahunan
- [ ] Generate laporan tahunan
- [ ] Hitung dan bagikan SHU tahunan
- [ ] Audit eksternal
- [ ] Persiapkan tahun buku baru

---

## 🎓 Sumber Belajar Tambahan

### Buku Referensi

1. **UU Koperasi No. 25 Tahun 1992**
   - Dasar hukum koperasi di Indonesia

2. **SAK ETAP/SAK EMKM (PSAK 2018)**
   - Standar akuntansi untuk entitas mikro dan kecil

3. **SAK EP**
   - Standar akuntansi untuk entitas privat

4. **Peraturan Menteri Koperasi**
   - Aturan teknis operasional koperasi

### Pelatihan

1. Pelatihan Akuntansi Dasar
2. Pelatihan SAK EP
3. Pelatihan Manajemen Koperasi
4. Pelatihan Penggunaan Aplikasi

---

**Dokumentasi ini dibuat untuk membantu pengelola koperasi desa dalam menggunakan aplikasi secara efektif dan efisien.**

*Versi: 1.0*
*Update Terakhir: Januari 2024*

**© 2024 Koperasi Desa - Sistem Informasi Manajemen Koperasi**
