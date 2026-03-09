import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate PDF for Balance Sheet (Laporan Posisi Keuangan)
 */
export const generateBalanceSheetPDF = (data, date, koperasiInfo) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN POSISI KEUANGAN', margin, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`KOPERASI DESA`, margin, 28);
  doc.text(`Per: ${date}`, margin, 34);
  doc.line(margin, 38, pageWidth - margin, 38);

  // Content
  let y = 48;

  // Assets
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ASET', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const assetData = data.assets.map(item => [
    item.name,
    formatCurrency(item.amount)
  ]);

  doc.autoTable({
    startY: y,
    head: [['Nama Akun', 'Jumlah']],
    body: assetData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { top: 5, left: margin, right: margin, bottom: 10 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Liabilities & Equity
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('KEWAJIBAN DAN EKUITAS', margin, y);
  y += 10;

  const liabEqData = data.liabilitiesAndEquity.map(item => [
    item.name,
    formatCurrency(item.amount)
  ]);

  doc.autoTable({
    startY: y,
    head: [['Nama Akun', 'Jumlah']],
    body: liabEqData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { top: 5, left: margin, right: margin, bottom: 10 },
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dicetak pada: ' + new Date().toLocaleString('id-ID'), margin, finalY);
  doc.text('Ditanda tangani:', margin, finalY + 8);
  doc.line(margin + 50, finalY + 12, pageWidth - margin, finalY + 12);

  // Save
  doc.save(`Neraca-${date}.pdf`);
};

/**
 * Generate PDF for Income Statement (Laporan Laba Rugi)
 */
export const generateIncomeStatementPDF = (data, startDate, endDate, koperasiInfo) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN LABA RUGI', margin, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('KOPERASI DESA', margin, 28);
  doc.text(`Periode: ${startDate} - ${endDate}`, margin, 34);
  doc.line(margin, 38, pageWidth - margin, 38);

  let y = 48;

  // Revenue
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PENDAPATAN', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const revenueData = data.revenue.map(item => [
    item.name,
    formatCurrency(item.amount)
  ]);

  doc.autoTable({
    startY: y,
    head: [['Nama Akun', 'Jumlah']],
    body: revenueData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { top: 5, left: margin, right: margin, bottom: 10 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Total Revenue
  const totalRevenue = data.revenue.reduce((sum, item) => sum + item.amount, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Pendapatan: ${formatCurrency(totalRevenue)}`, margin, y);
  y += 15;

  // Expenses
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BEBAN', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const expenseData = data.expenses.map(item => [
    item.name,
    formatCurrency(item.amount)
  ]);

  doc.autoTable({
    startY: y,
    head: [['Nama Akun', 'Jumlah']],
    body: expenseData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [220, 53, 69],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { top: 5, left: margin, right: margin, bottom: 10 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // Total Expenses
  const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Beban: ${formatCurrency(totalExpenses)}`, margin, y);
  y += 15;

  // Net Income
  const netIncome = totalRevenue - totalExpenses;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`LABA BERSIH: ${formatCurrency(netIncome)}`, margin, y);

  // Footer
  const finalY = y + 30;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dicetak pada: ' + new Date().toLocaleString('id-ID'), margin, finalY);

  doc.save(`LabaRugi-${startDate}-${endDate}.pdf`);
};

/**
 * Generate PDF for SHU Report
 */
export const generateSHUPDF = (data, period, koperasiInfo) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN SHU', margin, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('KOPERASI DESA', margin, 28);
  doc.text(`Periode: ${period}`, margin, 34);
  doc.line(margin, 38, pageWidth - margin, 38);

  let y = 48;

  // Summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN SHU', margin, y);
  y += 10;

  const summaryData = [
    ['Total Pendapatan', formatCurrency(data.totalRevenue)],
    ['Total Beban', formatCurrency(data.totalExpense)],
    ['SHU Bersih', formatCurrency(data.netSHU)],
    ['Jasa Modal (' + data.jasaModalPercentage + '%)', formatCurrency(data.jasaModalAmount)],
    ['Jasa Usaha (' + data.jasaUsahaPercentage + '%)', formatCurrency(data.jasaUsahaAmount)],
  ];

  summaryData.forEach((item, index) => {
    doc.text(`${item[0]}: ${item[1]}`, margin, y + (index * 7));
  });

  y += summaryData.length * 7 + 10;

  // Member Distributions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DISTRIBUSI SHU KE ANGGOTA', margin, y);
  y += 10;

  const memberData = data.distributions.map(member => [
    member.memberNumber,
    member.memberName,
    member.savings,
    formatCurrency(member.jasaModal),
    formatCurrency(member.jasaUsaha),
    formatCurrency(member.totalSHU),
  ]);

  doc.autoTable({
    startY: y,
    head: [['No. Anggota', 'Nama', 'Simpanan', 'Jasa Modal', 'Jasa Usaha', 'Total SHU']],
    body: memberData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { top: 5, left: margin, right: margin, bottom: 10 },
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dicetak pada: ' + new Date().toLocaleString('id-ID'), margin, finalY);

  doc.save(`SHU-${period}.pdf`);
};

/**
 * Generate PDF for POS Receipt
 */
export const generatePOSReceiptPDF = (transaction, koperasiInfo) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('STRUK PEMBELIAN', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('KOPERASI DESA', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(koperasiInfo.address || 'Jl. Raya Desa No. 1', pageWidth / 2, 38, { align: 'center' });
  doc.line(margin, 45, pageWidth - margin, 45);

  let y = 55;

  // Transaction Info
  doc.text(`No: ${transaction.transaction_number}`, margin, y);
  doc.text(`Tanggal: ${new Date(transaction.date || transaction.created_at).toLocaleString('id-ID')}`, margin, y + 7);
  doc.text(`Kasir: Admin`, margin, y + 14);

  if (transaction.member) {
    doc.text(`Anggota: ${transaction.member.full_name || transaction.member}`, margin, y + 21);
  }

  y += 35;
  doc.line(margin, y, pageWidth - margin, y);

  // Items
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const items = transaction.line_items || transaction.items;

  const itemData = items.map(item => [
    item.product_name || item.name,
    `${item.quantity} x ${formatCurrency(item.unit_price || item.price)}`,
    formatCurrency(item.subtotal || (item.quantity * (item.unit_price || item.price)))
  ]);

  doc.autoTable({
    startY: y,
    head: [['Produk', 'Qty x Harga', 'Subtotal']],
    body: itemData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    margin: { top: 5, left: margin, right: margin, bottom: 10 },
  });

  // Totals
  y = doc.lastAutoTable.finalY + 10;

  doc.text(`Subtotal: ${formatCurrency(transaction.subtotal)}`, margin, y);
  if (transaction.discount > 0) {
    doc.text(`Diskon: -${formatCurrency(transaction.discount)}`, margin, y + 7);
  }
  if (transaction.tax > 0) {
    doc.text(`Pajak: ${formatCurrency(transaction.tax)}`, margin, y + 14);
  }

  y += 25;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: ${formatCurrency(transaction.total_amount)}`, margin, y);
  doc.text(`Bayar: ${formatCurrency(transaction.paid_amount)}`, margin, y + 8);
  doc.text(`Kembalian: ${formatCurrency(transaction.change_amount)}`, margin, y + 16);

  // Footer
  const finalY = y + 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Terima kasih atas kunjungan Anda!', pageWidth / 2, finalY, { align: 'center' });
  doc.text('Simpan struk ini sebagai bukti pembayaran yang sah.', pageWidth / 2, finalY + 7, { align: 'center' });

  doc.save(`Struk-${transaction.transaction_number}.pdf`);
};

/**
 * Export data to Excel/CSV
 */
export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      let cell = row[header];
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Format currency for PDF
 */
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + parseFloat(amount).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export default {
  generateBalanceSheetPDF,
  generateIncomeStatementPDF,
  generateSHUPDF,
  generatePOSReceiptPDF,
  exportToCSV
};
