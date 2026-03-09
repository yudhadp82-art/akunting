# Tutorial Lengkap PDF untuk Aplikasi Koperasi Desa
## Panduan Generate dan Manajemen Dokumen PDF

---

## 📚 Daftar Isi

1. [Instalasi Dependencies](#instalasi-dependencies)
2. [Overview Fitur PDF](#overview-fitur-pdf)
3. [Generate Laporan Keuangan SAK EP](#generate-laporan-keuangan-sak-ep)
4. [Generate Struk POS](#generate-struk-pos)
5. [Generate Laporan SHU](#generate-laporan-shu)
6. [Troubleshooting PDF](#troubleshooting-pdf)
7. [Tips dan Best Practices](#tips-dan-best-practices)

---

## 🔧 Instalasi Dependencies

### 1. Install Frontend Dependencies

Jalankan perintah berikut di direktori frontend:

```bash
cd koperasi-desa/frontend
npm install jspdf jspdf-autotable
```

**Dependencies:**
- `jspdf` (^2.5.1) - Library utama untuk generate PDF
- `jspdf-autotable` (^3.5.29) - Plugin untuk tabel di PDF

### 2. Verifikasi Instalasi

Cek file `package.json` untuk memastikan dependencies sudah terinstall:

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.5.29"
  }
}
```

---

## 📊 Overview Fitur PDF

### Fitur-fitur yang Tersedia

| Fitur | Deskripsi | Lokasi File |
|--------|-----------|-------------|
| **Laporan Posisi Keuangan (Neraca)** | Generate PDF Neraca sesuai SAK EP | `exportUtils.js` |
| **Laporan Laba Rugi** | Generate PDF Laba Rugi SAK EP | `exportUtils.js` |
| **Laporan Perubahan Ekuitas** | Generate PDF laporan ekuitas | `exportUtils.js` |
| **Laporan Arus Kas** | Generate PDF laporan arus kas | `exportUtils.js` |
| **Laporan SHU** | Generate PDF laporan SHU dan distribusi | `exportUtils.js` |
| **Struk POS** | Generate PDF struk pembelian | `exportUtils.js` |
| **Export CSV** | Export data ke file CSV | `exportUtils.js` |

---

## 📈 Generate Laporan Keuangan SAK EP

### 1. Laporan Posisi Keuangan (Neraca)

#### Struktur PDF Neraca

```
┌────────────────────────────────────┐
│  LAPORAN POSISI KEUANGAN        │
│  KOPERASI DESA                   │
│  Per: 31 Desember 2024           │
├────────────────────────────────────┤
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
└────────────────────────────────────┘
```

#### Cara Generate Neraca PDF

**Dari Frontend:**

1. Akses halaman **Laporan → Posisi Keuangan**
2. Pilih tanggal laporan yang diinginkan
3. Klik tombol **Generate PDF**
4. PDF akan tergenerate dan terdownload otomatis

**Dari Kode:**

```javascript
import { generateBalanceSheetPDF } from '../../utils/exportUtils';

const handleGeneratePDF = () => {
  const data = {
    assets: [
      { name: 'Kas dan Bank', amount: 50000000 },
      { name: 'Piutang Anggota', amount: 25000000 },
      { name: 'Persediaan', amount: 10000000 },
    ],
    liabilitiesAndEquity: [
      { name: 'Simpanan Anggota', amount: 40000000 },
      { name: 'Dana Cadangan', amount: 15000000 },
      { name: 'SHU Tahun Berjalan', amount: 5000000 },
    ]
  };

  const koperasiInfo = {
    name: 'Koperasi Desa Maju Jaya',
    address: 'Jl. Raya Desa No. 123'
  };

  generateBalanceSheetPDF(
    data,
    '31-12-2024',
    koperasiInfo
  );
};
```

### 2. Laporan Laba Rugi

#### Struktur PDF Laba Rugi

```
┌────────────────────────────────────┐
│  LAPORAN LABA RUGI              │
│  KOPERASI DESA                   │
│  Periode: 1 Jan - 31 Des 2024   │
├────────────────────────────────────┤
│                                 │
│  PENDAPATAN                      │
│  ┌─────────────────────────────┐   │
│  │ Pendapatan Jasa Pinjaman│   │
│  │   Bulan Ini        Rp  │   │
│  │   Bulan Lalu      Rp  │   │
│  │   Total            Rp  │   │
│  │ Pendapatan Jasa Lain     │   │
│  │   Total            Rp  │   │
│  │ Pendapatan Usaha Lain    │   │
│  │   Total            Rp  │   │
│  │   Total Pendapatan      Rp  │   │
│  └─────────────────────────────┘   │
│                                 │
│  BEBAN                           │
│  ┌─────────────────────────────┐   │
│  │ Beban Operasional       │   │
│  │   Total            Rp  │   │
│  │ Beban Penyusutan       │   │
│  │   Total            Rp  │   │
│  │ Beban Lain-lain        │   │
│  │   Total            Rp  │   │
│  │   Total Beban         Rp  │   │
│  └─────────────────────────────┘   │
│                                 │
│  LABA BERSIH              Rp  │   │
└────────────────────────────────────┘
```

#### Cara Generate Laba Rugi PDF

**Dari Frontend:**

1. Akses halaman **Laporan → Laba Rugi**
2. Pilih periode laporan (tanggal awal dan akhir)
3. Klik tombol **Generate PDF**
4. PDF akan tergenerate dengan perincian pendapatan dan beban

**Dari Kode:**

```javascript
import { generateIncomeStatementPDF } from '../../utils/exportUtils';

const handleGeneratePDF = () => {
  const data = {
    revenue: [
      { name: 'Jasa Pinjaman', amount: 25000000 },
      { name: 'Jasa Lain-lain', amount: 5000000 },
    ],
    expenses: [
      { name: 'Beban Operasional', amount: 10000000 },
      { name: 'Beban Penyusutan', amount: 5000000 },
      { name: 'Beban Lain-lain', amount: 2000000 },
    ]
  };

  generateIncomeStatementPDF(
    data,
    '01-01-2024',
    '31-12-2024',
    { name: 'Koperasi Desa' }
  );
};
```

### 3. Laporan Perubahan Ekuitas

#### Struktur PDF Perubahan Ekuitas

```
┌────────────────────────────────────┐
│  LAPORAN PERUBAHAN EKUITAS     │
│  KOPERASI DESA                   │
│  Periode: 1 Jan - 31 Des 2024   │
├────────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐   │
│  │ Deskripsi            │Awal  │ Perubahan│ Akhir │   │
│  ├───┼─────────┼───────┼───────┤   │
│  │Saldo Awal Ekuitas  │Rp    │  Rp      │ Rp    │   │
│  │Tambah Simpanan Pokok │Rp    │  Rp      │ Rp    │   │
│  │Tambah SHU Tahun Ini  │Rp    │  Rp      │ Rp    │   │
│  │Bagian SHU ke Anggota  │Rp    │  Rp      │ Rp    │   │
│  │Tambah Dana Cadangan  │Rp    │  Rp      │ Rp    │   │
│  │Saldo Akhir Ekuitas   │Rp    │  Rp      │ Rp    │   │
│  └─────────────────────────────┘   │
└────────────────────────────────────┘
```

### 4. Laporan Arus Kas

#### Struktur PDF Arus Kas

```
┌────────────────────────────────────┐
│  LAPORAN ARUS KAS                │
│  KOPERASI DESA                   │
│  Periode: 1 Jan - 31 Des 2024   │
├────────────────────────────────────┤
│                                 │
│  ARUS KAS DARI AKTIVITAS       │
│  ┌─────────────────────────────┐   │
│  │ Penerimaan Setoran    │ Rp  │   │
│  │ Pembayaran Angsuran  │ Rp  │   │
│  │ Penjualan POS        │ Rp  │   │
│  │ Lain-lain           │ Rp  │   │
│  │ Total Masuk        │ Rp  │   │
│  └─────────────────────────────┘   │
│                                 │
│  ┌─────────────────────────────┐   │
│  │ Pembayaran Penarikan  │ Rp  │   │
│  │ Pembayaran Beban      │ Rp  │   │
│  │ Lain-lain           │ Rp  │   │
│  │ Total Keluar       │ Rp  │   │
│  └─────────────────────────────┘   │
│                                 │
│  KENAIKAN ARUS KAS     │ Rp  │   │
└────────────────────────────────────┘
```

---

## 🧾 Generate Struk POS

### Struktur Struk POS

```
┌────────────────────────────────────┐
│  STRUK PEMBELIAN                 │
├────────────────────────────────────┤
│                                 │
│        KOPERASI DESA               │
│     Jl. Raya Desa No. 1        │
│                                 │
│  No: POS-2024-00123             │
│  Tanggal: 15 Jan 2024, 10:30      │
│  Kasir: Administrator             │
│  Anggota: Budi Santoso (ANG-001) │
├────────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐   │
│  │ PRODUK           │Qty   │Harga  │Total│   │
│  ├───┼──────────┼──────┼─────┤   │
│  │Beras Premium 5kg  │ 2   │ 65.000│130.000│   │
│  │Minyak Goreng 2L  │ 1   │ 32.000│ 32.000│   │
│  │Gula Pasir 1kg    │ 3   │ 15.000│ 45.000│   │
│  └─────────────────────────────┘   │
│                                 │
│  Subtotal: Rp 207.000            │
│  Diskon: -Rp 7.000              │
│  Total: Rp 200.000               │
│                                 │
│  Bayar (Tunai): Rp 200.000       │
│  Kembalian: Rp 0                  │
├────────────────────────────────────┤
│                                 │
│  Terima kasih atas kunjungan Anda! │
│  Simpan struk ini sebagai bukti     │
│  pembayaran yang sah.              │
└────────────────────────────────────┘
```

### Cara Generate Struk POS

#### Langkah 1: Selesaikan Transaksi POS

1. Akses halaman **POS → Kasir**
2. Tambah produk ke keranjang
3. Pilih anggota (opsional)
4. Pilih metode pembayaran
5. Input jumlah bayar
6. Klik **Bayar**

#### Langkah 2: Generate PDF Struk

Struk akan otomatis muncul setelah transaksi berhasil:

**Dialog Struk akan menampilkan:**
- No. transaksi
- Tanggal dan waktu
- Kasir dan anggota
- List item pembelian
- Subtotal, diskon, pajak
- Total, bayar, kembalian
- Pesan penutup

#### Langkah 3: Cetak atau Save PDF

```
┌────────────────────────────────────┐
│  [Tutup]  [Cetak]            │
└────────────────────────────────────┘
```

1. **Cetak Langsung**: Klik tombol **Cetak** untuk print ke printer
2. **Save PDF**: Browser akan otomatis download PDF struk
3. **Tutup**: Klik tutup untuk kembali ke POS

---

## 🎯 Generate Laporan SHU

### Struktur PDF Laporan SHU

```
┌────────────────────────────────────┐
│  LAPORAN SHU                     │
│  KOPERASI DESA                   │
│  Periode: Tahun Buku 2024      │
├────────────────────────────────────┤
│                                 │
│  RINGKASAN SHU                   │
│  ┌─────────────────────────────┐   │
│  │ Total Pendapatan    │ Rp  │   │
│  │ Total Beban         │ Rp  │   │
│  │ SHU Bersih         │ Rp  │   │
│  │ Jasa Modal (30%)    │ Rp  │   │
│  │ Jasa Usaha (50%)    │ Rp  │   │
│  │ Pendidikan (5%)      │ Rp  │   │
│  │ Sosial (5%)         │ Rp  │   │
│  │ Dana Cadangan (10%) │ Rp  │   │
│  └─────────────────────────────┘   │
├────────────────────────────────────┤
│                                 │
│  DISTRIBUSI SHU KE ANGGOTA      │
│  ┌─────────────────────────────┐   │
│  │No.  │Nama       │Simpanan│Jasa    │Jasa    │Total    │   │
│  │Ang.  │           │        │Modal   │Usaha   │SHU     │   │
│  ├───┼────────────┼────────┼────────┼────────┼────────┤   │
│  │001   │Budi S.    │500.000 │ 30.000  │ 50.000  │ 80.000  │   │
│  │002   │Siti A.    │250.000 │ 15.000  │ 25.000  │ 40.000  │   │
│  │003   │Ahmad Y.   │200.000 │ 12.000  │ 20.000  │ 32.000  │   │
│  └─────────────────────────────┘   │
│  │TOTAL              │950.000 │ 57.000  │ 95.000  │ 152.000 │   │
│  └─────────────────────────────┘   │
├────────────────────────────────────┤
│                                 │
│  TOTAL DISTRIBUSI KE ANGGOTA   │ 152.000 │   │
│                                 │
│  DANA KOPERASI                    │  68.000 │   │
│  (Pendidikan + Sosial + Cadangan) │           │   │
│                                 │
│  TOTAL SHU TAHUN BUKU             │ 220.000 │   │
└────────────────────────────────────┘
```

### Cara Generate Laporan SHU

#### Langkah 1: Hitung SHU

1. Akses halaman **SHU**
2. Pilih periode SHU
3. Klik **Hitung SHU**
4. Tunggu proses perhitungan

#### Langkah 2: Distribusikan SHU

1. Review hasil perhitungan
2. Cek aturan pembagian (Jasa Modal, Jasa Usaha, dll)
3. Klik **Bagikan SHU**
4. SHU akan didistribusikan ke semua anggota

#### Langkah 3: Generate PDF Laporan

1. Klik tombol **Export PDF** di halaman SHU
2. PDF akan tergenerate dengan:
   - Ringkasan SHU
   - Distribusi per anggota
   - Aturan pembagian
   - Total untuk koperasi
3. PDF terdownload otomatis

---

## 🐛 Troubleshooting PDF

### Masalah Umum dan Solusi

#### 1. PDF Tidak Terdownload

**Masalah:** Tombol export diklik tapi tidak ada file yang terdownload

**Penyebab:**
- Browser memblok download otomatis
- Popup blocker aktif
- Error di library jspdf

**Solusi:**
```javascript
// Pastikan library sudah terinstall dengan benar
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Cek jika library tersedia
console.log('jsPDF:', jsPDF);
console.log('autoTable:', autoTable);

// Gunakan try-catch untuk handle error
try {
  const doc = new jsPDF();
  doc.save('filename.pdf');
} catch (error) {
  console.error('PDF Generation Error:', error);
  alert('Gagal generate PDF: ' + error.message);
}
```

**Untuk Pengguna:**
1. Cek popup blocker → Allow popups
2. Cek browser → Coba browser lain (Chrome/Firefox)
3. Cek internet connection
4. Refresh halaman dan coba lagi
5. Cek console browser untuk error (F12)

#### 2. PDF Rusak / Blank

**Masalah:** File PDF terdownload tapi isi blank atau rusak

**Penyebab:**
- Data kosong
- Encoding karakter salah
- Font tidak tersedia
- Ukuran halaman salah

**Solusi:**
```javascript
// Validasi data sebelum generate PDF
if (!data || data.length === 0) {
  alert('Tidak ada data untuk PDF');
  return;
}

// Gunakan font yang sesuai untuk karakter Indonesia
doc.setFont('helvetica');
// Atau gunakan font khusus jika ada karakter khusus
doc.setFont('courier');

// Cek content sebelum save
if (doc.internal.getNumberOfPages() === 0) {
  console.error('PDF is empty');
  return;
}
```

**Untuk Pengguna:**
1. Refresh data sebelum export
2. Cek data terisi dengan benar
3. Coba export ulang setelah refresh
4. Hubungi admin jika masalah berlanjut

#### 3. Tabel PDF Tidak Rapi

**Masalah:** Tabel di PDF tidak sejajar atau format salah

**Penyebab:**
- Column width tidak diset
- Auto-table konfigurasi salah
- Data terlalu panjang untuk cell

**Solusi:**
```javascript
// Konfigurasi autoTable dengan benar
doc.autoTable({
  startY: y,
  head: headers,
  body: data,
  theme: 'grid',
  styles: {
    fontSize: 9,
    cellPadding: 2,
  },
  columnStyles: {
    // Set width spesifik untuk setiap kolom
    0: { cellWidth: 25 },  // Kolom pertama
    1: { cellWidth: 80 },  // Kolom kedua
    2: { cellWidth: 25 },  // Kolom ketiga
  },
  headStyles: {
    fillColor: [52, 152, 219],
    textColor: [255, 255, 255],
    fontStyle: 'bold',
  },
  margin: { top: 10, left: 15, right: 15, bottom: 10 },
});
```

#### 4. Masalah Kebijakan Print Browser

**Masalah:** Browser menampilkan print dialog yang tidak diinginkan

**Penyebab:**
- Print dialog default browser
- Tidak ada print styles khusus

**Solusi:**
```javascript
// Tambahkan print-only CSS
const handlePrint = () => {
  // Trigger browser print
  window.print();

  // Atau buat print styles khusus
  const styleElement = document.createElement('style');
  styleElement.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      #print-area, #print-area * { visibility: visible; }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
    }
  `;
  document.head.appendChild(styleElement);

  // Print dan hapus styles
  setTimeout(() => {
    document.head.removeChild(styleElement);
  }, 100);
};
```

**Untuk Pengguna:**
1. Cek printer settings di browser
2. Pilih "Save as PDF" jika ingin PDF
3. Pilih printer yang benar
4. Cek preview sebelum print
5. Gunakan print dialog browser untuk print

#### 5. Performance Issue (Slow PDF Generation)

**Masalah:** Proses generate PDF terlalu lambat

**Penyebab:**
- Terlalu banyak data
- Loop tidak optimal
- Tidak menggunakan async/await

**Solusi:**
```javascript
// Gunakan async processing
const generatePDF = async () => {
  try {
    // Tampilkan loading indicator
    setLoading(true);

    // Batch processing untuk data besar
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      // Process batch
      await processBatch(batch);

      // Beri browser waktu untuk render
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Generate PDF
    const doc = new jsPDF();
    // ... PDF generation code

    doc.save('file.pdf');
  } finally {
    setLoading(false);
  }
};

// Atau gunakan pagination
const generatePaginatedPDF = async () => {
  const doc = new jsPDF();
  let currentPage = 0;

  for (const item of data) {
    if (currentPage >= maxRowsPerPage) {
      doc.addPage();
      currentPage = 0;
    }
    // Add item to PDF
    doc.text(item.text, margin, y);
    y += lineHeight;
    currentPage++;
  }

  doc.save('file.pdf');
};
```

---

## 💡 Tips dan Best Practices

### Best Practices Generate PDF

#### 1. Validasi Data Sebelum Export

✅ **DO:**
- Cek data tidak kosong
- Validasi format data
- Cek nilai numeric
- Handle data null/undefined
- Validasi struktur data yang kompleks

❌ **DON'T:**
- Export data tanpa validasi
- Asumsi data selalu valid
- Lupa handle error
- Export data partial

#### 2. Optimize Performance

✅ **DO:**
- Gunakan batch processing
- Implementasi pagination untuk PDF besar
- Tampilkan loading indicator
- Beri feedback ke user
- Cache hasil yang sering diexport

❌ **DON'T:**
- Proses semua data sekaligus
- Blok UI thread
- Tidak memberikan feedback
- Generate PDF dalam UI thread utama

#### 3. User Experience

✅ **DO:**
- Tampilkan progress indicator
- Berikan pesan sukses/error yang jelas
- Sedot nama file yang deskriptif
- Sedot date ke nama file
- Berikan preview sebelum download
- Sedot konfirmasi untuk file besar

❌ **DON'T:**
- Tidak memberikan feedback
- Nama file yang tidak jelas
- Tanpa konfirmasi untuk operasi besar
- Timeout yang terlalu singkat
- Error message yang tidak membantu

#### 4. Data Management

✅ **DO:**
- Export data secara berkala
- Backup di lokasi yang aman
- Version control untuk laporan
- Archive laporan lama
- Compress PDF jika perlu
- Encrypt data sensitif

❌ **DON'T:**
- Export tanpa backup
- Simpan di tempat tidak aman
- Hapus laporan lama
- Overwrite backup
- Tidak ada versioning
- Lupa encrypt data sensitif

#### 5. Print Settings

✅ **DO:**
- Test print di berbagai browser
- Set print default yang benar
- Gunakan print stylesheet khusus
- Hide element yang tidak perlu dicetak
- Set page size dan margin yang benar
- Test dengan berbagai printer

❌ **DON'T:**
- Gunakan browser default saja
- Tidak hide element yang tidak perlu
- Tidak set page size
- Margin yang tidak konsisten
- Tidak test di berbagai browser

### Naming Convention untuk File PDF

**Format yang Disarankan:**
```
[Nama Koperasi]_[Jenis Laporan]_[Periode]_[Tanggal].pdf

Contoh:
- KoperasiDesa_Neraca_31-12-2024_2024-01-15.pdf
- KoperasiDesa_LabaRugi_Jan-Dec2024_2024-01-15.pdf
- KoperasiDesa_SHU_TahunBuku2024_2024-01-20.pdf
- KoperasiDesa_Struk_POS-2024-00123_2024-01-15.pdf
```

### Checklist Sebelum Generate PDF

Sebelum menekan tombol Export PDF:

- [ ] Data sudah divalidasi
- [ ] Periode laporan sudah benar
- [ ] Tidak ada error di console
- [ ] Loading indicator sudah di-show
- [ ] User sudah siap untuk download
- [ ] Nama file akan jelas dan unik
- [ ] Ada cukup storage untuk download

---

## 🔗 Integration dengan Fitur Lain

### PDF dengan POS

**Flow Integrasi:**
```
POS Transaction → Complete → Show Receipt Dialog → Generate PDF → User Download
```

**Trigger Points:**
- Setelah checkout berhasil
- Tombol "Cetak" di receipt dialog
- Tombol "Save PDF" di receipt dialog

### PDF dengan Laporan

**Flow Integrasi:**
```
Report Page → Generate Report → Preview → Download PDF → User File
```

**Trigger Points:**
- Tombol "Export PDF" di setiap halaman laporan
- Tombol "Export" di dashboard summary
- Tombol "Export" di list pages
- Tombol "Cetak" di preview dialog

---

## 📞 Support dan Bantuan

### Jika Mengalami Masalah

1. **Cek Browser Console**
   - Buka Developer Tools (F12)
   - Cek tab "Console" untuk error
   - Screenshot error untuk pelaporan

2. **Cek Network**
   - Buka Network tab di Developer Tools
   - Cek ada request yang failed
   - Cek status code dari response

3. **Cek Dependencies**
   - Buka browser console
   - Ketik: `window.jspdf`
   - Ketik: `window.jspdfAutoTable`
   - Pastikan libraries ter-loaded

4. **Restart Application**
   - Refresh halaman browser
   - Clear browser cache
   - Login ulang jika perlu
   - Coba generate PDF ulang

5. **Hubungi Technical Support**
   - Jelaskan masalah secara detail
   - Screenshot error message
   - Catat langkah-langkah yang menyebabkan error
   - Informasikan browser dan OS yang digunakan

### Error Message Reference

| Error Code | Deskripsi | Solusi |
|-----------|-----------|---------|
| `jspdf is not defined` | Library tidak terload | Install jspdf dependency |
| `autoTable is not a function` | Plugin tidak terload | Install jspdf-autotable |
| `Maximum call stack size exceeded` | Terlalu banyak data | Gunakan pagination |
| `Failed to execute 'appendChild'` | DOM issue | Cek browser compatibility |
| `Network request failed` | API error | Cek koneksi server |

---

## 🎓 Learning Resources

### Dokumentasi jsPDF

- **jsPDF Documentation**: https://github.com/MrRio/jsPDF
- **jspdf-autotable**: https://github.com/MrRio/jsPDF-AutoTable
- **Examples**: https://github.com/MrRio/jsPDF/tree/master/examples

### Tutorial Online

- **jsPDF Basic Tutorial**: https://parall.ax/products/jspdf
- **jsPDF Complex Tables**: https://simonbengtsson.github.io/jsPDF-AutoTable
- **React with jsPDF**: https://www.npmjs.com/package/react-jspdf

### Video Tutorial

- Tutorial PDF Basic (YouTube)
- Tutorial PDF Advanced (YouTube)
- Tutorial jsPDF-React (YouTube)

---

**Tutorial ini dibuat untuk membantu pengguna aplikasi Koperasi Desa dalam menghasilkan dan mengelola dokumen PDF dengan efektif.**

*Versi: 1.0*
*Update Terakhir: Januari 2024*

**© 2024 Koperasi Desa - Sistem Informasi Manajemen Koperasi**
