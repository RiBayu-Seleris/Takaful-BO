/**
 * Definisi TAB untuk halaman detail (restitusi & klaim).
 * Dipisah agar semua tab pada satu modul memakai daftar yang sama & konsisten.
 * Nama route harus cocok dengan yang terdaftar di src/router/index.js.
 */

export const restitusiDetailTabs = [
  { label: 'Data Debitur', route: 'detail-restitusi-data-debitur' },
  { label: 'Data Asuransi', route: 'detail-restitusi-data-asuransi' },
  { label: 'Dokumen', route: 'detail-restitusi-dokumen-restitusi' },
  { label: 'Catatan', route: 'detail-restitusi-catatan-restitusi' },
  { label: 'Diagram Risiko', route: 'detail-restitusi-diagram-restitusi' },
  { label: 'Penyebaran Risiko', route: 'detail-restitusi-penyebaran-restitusi' },
  { label: 'SLA', route: 'detail-restitusi-sla' },
]

export const klaimDetailTabs = [
  { label: 'Data Debitur', route: 'detail-klaim-data-debitur' },
  { label: 'Data Asuransi', route: 'detail-klaim-data-asuransi' },
  { label: 'Dokumen', route: 'detail-klaim-dokumen-klaim' },
  { label: 'Hasil Analisa', route: 'detail-klaim-hasil-analisa-klaim' },
  { label: 'Catatan Bank', route: 'detail-klaim-catatan-bank' },
  { label: 'Revisi Klaim', route: 'detail-klaim-revisi-klaim' },
  { label: 'SLA', route: 'detail-klaim-sla' },
]

export const penutupanDetailTabs = [
  { label: 'Data Debitur', route: 'detail-debitur' },
  { label: 'Data Asuransi', route: 'detail-data-asuransi' },
  { label: 'Dokumen SPAJK', route: 'detail-dokumen-spajk' },
  { label: 'Dokumen Medis', route: 'detail-dokumen-medis-tambahan' },
  { label: 'EM/EP', route: 'detail-em-ep' },
  { label: 'Riwayat Pengajuan', route: 'detail-riwayat-pengajuan' },
  { label: 'SLA', route: 'detail-sla' },
  { label: 'Riwayat', route: 'detail-riwayat' },
  { label: 'Revisi Data', route: 'detail-revisi-data' },
  { label: 'Topup Khusus', route: 'detail-topup-khusus' },
  { label: 'Penyebaran Risiko', route: 'detail-penyebaran-risiko' },
  { label: 'Diagram Risiko', route: 'detail-diagram-penyebaran-risiko' },
  { label: 'Fakultatif', route: 'detail-fakultatif' },
]
