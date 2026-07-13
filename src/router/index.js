import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '@/lib/auth'

/**
 * ROUTER — daftar halaman + penjaga akses (guard).
 *
 * Strategi migrasi bertahap:
 *   - `readyRoutes`   : halaman yang SUDAH diport ke komponen asli.
 *   - `pendingRoutes` : halaman yang BELUM diport -> sementara pakai _Placeholder.vue
 *                       supaya menu/link tidak pernah error.
 *
 * Cara "menyelesaikan" sebuah modul: pindahkan namanya dari `pendingRoutes`
 * ke `readyRoutes` dan arahkan ke komponennya. Selesai.
 */

// Halaman placeholder untuk route yang belum diport.
const Placeholder = () => import('@/views/_Placeholder.vue')

// Komponen reusable (dipakai banyak route dengan props berbeda).
const RestituteList = () => import('@/views/restitusi/RestituteList.vue')
const ClaimList = () => import('@/views/klaim/ClaimList.vue')
const EligibleSubmissionList = () => import('@/views/shared/EligibleSubmissionList.vue')
const SubmissionListPage = () => import('@/views/penutupan/SubmissionListPage.vue')
const RecordReport = () => import('@/views/reports/RecordReport.vue')
const RiskProfilePage = () => import('@/views/dashboard/RiskProfilePage.vue')
const TopTenCriteriaPage = () => import('@/views/dashboard/TopTenCriteriaPage.vue')
const CsvImportPage = () => import('@/views/csv/CsvImportPage.vue')

// Opsi status dipakai di filter laporan (mengikuti aslinya).
const CLAIM_STATUS = ['Semua', 'Klaim Register', 'Klaim Proses', 'Klaim Diterima', 'Klaim Ditolak', 'Klaim Dibayar']
const RESTITUTE_STATUS = ['Semua', 'Restitusi Register', 'Restitusi Proses', 'Restitusi Diterima', 'Restitusi Ditolak', 'Restitusi Dibayar']
const RESTITUTE_TYPE = ['Semua', 'Lapse', 'Top Up / Roll Over']

// Konfigurasi RecordReport untuk Klaim & Restitusi (dipakai bersama tab utama & tab "Asuransi").
const KLAIM_REPORT = {
  endpoint: 'report/claim/record',
  buttonLabel: 'Cetak Excel',
  extraFilters: [{ key: 'claim_status', label: 'Status Klaim', options: CLAIM_STATUS }],
  tabs: [
    { label: 'Klaim', route: 'laporan-klaim' },
    { label: 'Asuransi', route: 'laporan-klaim-asuransi', nonBankOnly: true },
  ],
}
const RESTITUSI_REPORT = {
  endpoint: 'report/restitute/record',
  buttonLabel: 'Cetak Excel',
  extraFilters: [
    { key: 'restitute_type', label: 'Jenis Restitusi', options: RESTITUTE_TYPE },
    { key: 'restitute_status', label: 'Status Restitusi', options: RESTITUTE_STATUS },
  ],
  tabs: [
    { label: 'Restitusi', route: 'laporan-restitusi' },
    { label: 'Asuransi', route: 'laporan-restitusi-asuransi', nonBankOnly: true },
  ],
}

const pembayaranBulananRoutes = [
  { path: '/input-pembayaran-bulanan', name: 'input-pembayaran-bulanan', component: () => import('@/views/pembayaran-bulanan/InputPembayaranBulanan.vue') },
  { path: '/list-pembayaran-bulanan', name: 'list-pembayaran-bulanan', component: () => import('@/views/pembayaran-bulanan/MonthlyPaymentList.vue'), props: { status: 'paid', title: 'List Pembayaran Bulanan' } },
  { path: '/list-pembayaran-bulanan/belum-dibayar', name: 'list-pembayaran-bulanan-belum-dibayar', component: () => import('@/views/pembayaran-bulanan/MonthlyPaymentList.vue'), props: { status: 'unpaid_payment', title: 'Pembayaran Bulanan Belum Dibayar' } },
  { path: '/list-pembayaran-bulanan/sisa-pembayaran', name: 'list-pembayaran-bulanan-sisa-pembayaran', component: () => import('@/views/pembayaran-bulanan/MonthlyPaymentList.vue'), props: { status: 'remaining_payment', title: 'Sisa Pembayaran Bulanan' } },
]

const dashboardRoutes = [
  { path: '/profil-risiko', name: 'profil-risiko', component: RiskProfilePage },
  { path: '/profil-risiko/polis-klaim', name: 'profil-risiko-polis-klaim', component: RiskProfilePage },
  { path: '/profil-risiko/polis-lapses', name: 'profil-risiko-polis-lapses', component: RiskProfilePage },
  { path: '/profil-risiko/polis-berjalan', name: 'profil-risiko-polis-berjalan', component: RiskProfilePage },
  { path: '/profil-loss-ratio-polis-berjalan', name: 'profil-loss-ratio-polis-berjalan', component: RiskProfilePage },
  { path: '/top-ten-criteria', name: 'top-ten-criteria', component: TopTenCriteriaPage },
  { path: '/top-ten-criteria-klaim', name: 'top-ten-criteria-klaim', component: TopTenCriteriaPage },
  { path: '/top-ten-criteria-lapses', name: 'top-ten-criteria-lapses', component: TopTenCriteriaPage },
  { path: '/top-ten-criteria-klaim-value', name: 'top-ten-criteria-klaim-value', component: TopTenCriteriaPage },
  { path: '/top-ten-criteria-premi-value', name: 'top-ten-criteria-premi-value', component: TopTenCriteriaPage },
]

/**
 * Route modul CSV / Excel.
 * Endpoint dan payload mengikuti ehd-backoffice:
 * - CSV Pengajuan Sumut      -> submission/sumut/insurance/*
 * - Data Loan Jambi          -> submission/jambi/insurance/*
 * - CSV Sertifikat Sumut     -> submission/sumut/certificate/*
 * - Excel Certificate BJB    -> submission/excel/certificate/*
 */
const csvRoutes = [
  {
    path: '/csv/pengajuan',
    name: 'csv-pengajuan',
    component: CsvImportPage,
    props: {
      title: 'CSV Pengajuan Asuransi',
      accept: '.csv',
      allowedExtensions: ['csv'],
      listEndpoint: 'submission/sumut/insurance/list',
      uploadEndpoint: 'submission/sumut/insurance/upload',
      uploadMethod: 'post',
      payloadKey: 'upload_url',
      columnsType: 'insurance',
    },
  },
  {
    path: '/csv/data-loan',
    name: 'csv-data-loan',
    component: CsvImportPage,
    props: {
      title: 'Data Loan',
      accept: '.xlsx,.xls',
      allowedExtensions: ['xlsx', 'xls'],
      listEndpoint: 'submission/jambi/insurance/list',
      uploadEndpoint: 'submission/jambi/insurance/upload',
      uploadMethod: 'post',
      payloadKey: 'url_path',
      extraPayload: { partner_id: 31, product_code: 'TBC6' },
      columnsType: 'insurance',
    },
  },
  {
    path: '/csv/sertifikat',
    name: 'csv-sertifikat',
    component: CsvImportPage,
    props: {
      title: 'CSV Sertifikat Asuransi',
      accept: '.csv',
      allowedExtensions: ['csv'],
      listEndpoint: 'submission/sumut/certificate/list',
      uploadEndpoint: 'submission/sumut/certificate/upload',
      uploadMethod: 'put',
      payloadKey: 'url_path',
      columnsType: 'certificate',
    },
  },
  {
    path: '/excel/certificate',
    name: 'excel-certificate',
    component: CsvImportPage,
    props: {
      title: 'Excel Certificate',
      accept: '.xlsx',
      allowedExtensions: ['xlsx'],
      listEndpoint: 'submission/excel/certificate/list',
      uploadEndpoint: 'submission/excel/certificate/upload',
      uploadMethod: 'post',
      payloadKey: 'url_path',
      columnsType: 'excel-certificate',
      templateUrl: 'https://seleris.s3.ap-southeast-1.amazonaws.com/document/file-1758087009934704384-2oy5wt.xlsx',
    },
  },
]

/**
 * Route modul LAPORAN.
 * Laporan Klaim & Restitusi memakai komponen RecordReport (filter cascading).
 */
const laporanRoutes = [
  // Tab Akseptasi punya komponen khusus (port 1:1 dari production_report_akseptasi.vue:
  // role/partner-aware, cascade "Semua ...", aturan partner 26/29/40, alur Broker GRM).
  { path: '/laporan-produksi', name: 'laporan-produksi', component: () => import('@/views/reports/ProductionReportAkseptasi.vue') },
  { path: '/laporan-surat-feebase', name: 'laporan-produksi-surat-feebase', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'surat-feebase' } },
  { path: '/laporan-produksi/asuransi', name: 'laporan-produksi-asuransi', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'asuransi' } },
  { path: '/laporan-produksi/summary', name: 'laporan-produksi-summary', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'summary' } },
  { path: '/laporan-produksi/sppa', name: 'laporan-produksi-sppa', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'sppa' } },
  { path: '/laporan-produksi/restrukturisasi', name: 'laporan-produksi-restrukturisasi', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'restrukturisasi' } },
  { path: '/laporan-produksi/revisi', name: 'laporan-produksi-revisi', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'revisi' } },
  { path: '/laporan-produksi/produksi-telat', name: 'laporan-produksi-produksi-telat', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'produksi-telat' } },
  { path: '/laporan-produksi/produksi-pending', name: 'laporan-produksi-produksi-pending', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'produksi-pending' } },
  { path: '/laporan-produksi/bordero', name: 'laporan-produksi-bordero', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'bordero' } },
  { path: '/laporan-produksi/tanggungan', name: 'laporan-produksi-tanggungan', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'tanggungan' } },
  { path: '/laporan-produksi/yes-file', name: 'laporan-produksi-yes-file', component: () => import('@/views/reports/ProductionReportPage.vue'), props: { variant: 'yes-file' } },
  // Laporan Klaim — punya tab "Klaim | Asuransi" (Asuransi hanya non-bank), sama seperti aslinya.
  {
    path: '/laporan-klaim',
    name: 'laporan-klaim',
    component: RecordReport,
    props: { title: 'Laporan Klaim', subtitle: 'Unduh laporan klaim berdasarkan filter.', ...KLAIM_REPORT },
  },
  {
    path: '/laporan-klaim/asuransi',
    name: 'laporan-klaim-asuransi',
    component: RecordReport,
    props: { title: 'Laporan Klaim', subtitle: 'Unduh laporan klaim berdasarkan filter.', ...KLAIM_REPORT },
  },
  // Laporan Restitusi — punya tab "Restitusi | Asuransi".
  {
    path: '/laporan-restitusi',
    name: 'laporan-restitusi',
    component: RecordReport,
    props: { title: 'Laporan Restitusi', subtitle: 'Unduh laporan restitusi berdasarkan filter.', ...RESTITUSI_REPORT },
  },
  {
    path: '/laporan-restitusi/asuransi',
    name: 'laporan-restitusi-asuransi',
    component: RecordReport,
    props: { title: 'Laporan Restitusi', subtitle: 'Unduh laporan restitusi berdasarkan filter.', ...RESTITUSI_REPORT },
  },
  { path: '/laporan-cetak-invoice', name: 'laporan-cetak-invoice', component: () => import('@/views/reports/LaporanCetakInvoice.vue') },
]

/**
 * Route modul RESTITUSI.
 * Semua tampilan daftar memakai komponen yang sama (RestituteList) dengan
 * `status` berbeda (props). Ini menggantikan 7 file terpisah di aplikasi lama.
 */
const restitusiRoutes = [
  { path: '/input-restitusi', name: 'input-restitusi', component: EligibleSubmissionList, props: { title: 'Input Restitusi', subtitle: 'Pilih polis yang akan diajukan restitusinya.', startRoute: 'detail-input-restitusi' } },
  { path: '/detail-restitusi/:id', name: 'detail-input-restitusi', component: () => import('@/views/restitusi/DetailInputRestitusi.vue') },
  { path: '/list-restitusi', name: 'list-restitusi', component: RestituteList, props: { status: 'restitute_registered', title: 'List Restitusi' } },
  { path: '/list-restitusi/proses-broker', name: 'list-restitusi-diproses-broker', component: RestituteList, props: { status: 'waiting_broker_confirmation', title: 'Restitusi Proses Broker' } },
  { path: '/list-restitusi/proses-asuransi', name: 'list-restitusi-diproses-asuransi', component: RestituteList, props: { status: 'waiting_insurance_confirmation', title: 'Restitusi Proses Asuransi' } },
  { path: '/list-restitusi/ditolak', name: 'list-restitusi-ditolak', component: RestituteList, props: { status: 'unrestituted', title: 'Restitusi Ditolak' } },
  { path: '/list-restitusi/diterima', name: 'list-restitusi-diterima', component: RestituteList, props: { status: 'confirmed_by_insurance', title: 'Restitusi Diterima' } },
  { path: '/list-restitusi/dibayar', name: 'list-restitusi-dibayar', component: RestituteList, props: { status: 'restitute_paid', title: 'Restitusi Dibayar' } },
  { path: '/list-restitusi/settle', name: 'list-restitusi-settle', component: RestituteList, props: { status: 'restitute_clear', title: 'Restitusi Settle' } },
  // Detail restitusi (tab lain menyusul)
  { path: '/detail-restitusi/data-debitur/:id', name: 'detail-restitusi-data-debitur', component: () => import('@/views/restitusi/detail/DataDebitur.vue') },
  { path: '/detail-restitusi/data-asuransi/:id', name: 'detail-restitusi-data-asuransi', component: () => import('@/views/restitusi/detail/DataAsuransi.vue') },
  { path: '/detail-restitusi/sla/:id', name: 'detail-restitusi-sla', component: () => import('@/views/restitusi/detail/Sla.vue') },
  { path: '/detail-restitusi/catatan-restitusi/:id', name: 'detail-restitusi-catatan-restitusi', component: () => import('@/views/restitusi/detail/Catatan.vue') },
  { path: '/detail-restitusi/dokumen-restitusi/:id', name: 'detail-restitusi-dokumen-restitusi', component: () => import('@/views/restitusi/detail/Dokumen.vue') },
  { path: '/detail-restitusi/penyebaran-restitusi/:id', name: 'detail-restitusi-penyebaran-restitusi', component: () => import('@/views/restitusi/detail/RiskDistribution.vue'), props: { mode: 'table' } },
  { path: '/detail-restitusi/diagram-restitusi/:id', name: 'detail-restitusi-diagram-restitusi', component: () => import('@/views/restitusi/detail/RiskDistribution.vue'), props: { mode: 'diagram' } },
]

/**
 * Route modul KLAIM (pola sama dengan restitusi).
 * Semua daftar memakai ClaimList dengan `status` berbeda.
 */
const klaimRoutes = [
  { path: '/input-klaim', name: 'input-klaim', component: EligibleSubmissionList, props: { title: 'Input Klaim', subtitle: 'Pilih polis yang akan diajukan klaimnya.', startRoute: 'detail-input-klaim' } },
  { path: '/detail-klaim/:id', name: 'detail-input-klaim', component: () => import('@/views/klaim/DetailInputKlaim.vue') },
  { path: '/list-klaim', name: 'list-klaim-register', component: ClaimList, props: { status: 'claim_registered', title: 'List Klaim' } },
  { path: '/list-klaim/proses-broker', name: 'list-klaim-diproses-broker', component: ClaimList, props: { status: 'waiting_broker_confirmation', title: 'Klaim Proses Broker' } },
  { path: '/list-klaim/proses-asuransi', name: 'list-klaim-diproses-asuransi', component: ClaimList, props: { status: 'waiting_insurance_confirmation', title: 'Klaim Proses Asuransi' } },
  { path: '/list-klaim/ditolak', name: 'list-klaim-ditolak', component: ClaimList, props: { status: 'claim_rejected', title: 'Klaim Ditolak' } },
  { path: '/list-klaim/diterima', name: 'list-klaim-diterima', component: ClaimList, props: { status: 'confirmed_by_insurance', title: 'Klaim Diterima' } },
  { path: '/list-klaim/dibayar', name: 'list-klaim-dibayar', component: ClaimList, props: { status: 'claim_paid', title: 'Klaim Dibayar' } },
  { path: '/list-klaim/settle', name: 'list-klaim-settle', component: ClaimList, props: { status: 'claim_clear', title: 'Klaim Settle' } },
  { path: '/list-klaim/banding', name: 'list-klaim-banding', component: ClaimList, props: { status: 'claim_appeal', title: 'Klaim Banding' } },
  { path: '/list-klaim/dibatalkan', name: 'list-klaim-dibatalkan', component: ClaimList, props: { status: 'unclaimed', title: 'Klaim Dibatalkan' } },
  // Detail klaim (tab lain menyusul)
  { path: '/detail-klaim/data-debitur/:id', name: 'detail-klaim-data-debitur', component: () => import('@/views/klaim/detail/DataDebitur.vue') },
  { path: '/detail-klaim/data-asuransi/:id', name: 'detail-klaim-data-asuransi', component: () => import('@/views/klaim/detail/DataAsuransi.vue') },
  { path: '/detail-klaim/sla/:id', name: 'detail-klaim-sla', component: () => import('@/views/klaim/detail/Sla.vue') },
  { path: '/detail-klaim/catatan-bank/:id', name: 'detail-klaim-catatan-bank', component: () => import('@/views/klaim/detail/CatatanBank.vue') },
  { path: '/detail-klaim/dokumen-klaim/:id', name: 'detail-klaim-dokumen-klaim', component: () => import('@/views/klaim/detail/DokumenKlaim.vue') },
  { path: '/detail-klaim/hasil-analisa-klaim/:id', name: 'detail-klaim-hasil-analisa-klaim', component: () => import('@/views/klaim/detail/HasilAnalisaKlaim.vue') },
  { path: '/detail-klaim/revisi-klaim/:id', name: 'detail-klaim-revisi-klaim', component: () => import('@/views/klaim/detail/RevisiKlaim.vue') },
]

/**
 * Route modul PENUTUPAN / LIST-DATA.
 * Semua daftar memakai SubmissionListPage dengan `filter` berbeda (endpoint submission/list).
 * Menggantikan 13 file terpisah di aplikasi lama.
 */
const penutupanRoutes = [
  { path: '/input-pengajuan', name: 'input-pengajuan', component: () => import('@/views/penutupan/InputPengajuan.vue') },
  { path: '/list-pengajuan/otomatis', name: 'list-data-pengajuan', component: SubmissionListPage, props: { view: 'pengajuan-otomatis' } },
  { path: '/list-pengajuan/hd', name: 'list-data-pengajuan-ehd', component: SubmissionListPage, props: { view: 'pengajuan-ehd' } },
  { path: '/list-pengajuan/non-medis', name: 'list-data-pengajuan-non-medis', component: SubmissionListPage, props: { view: 'pengajuan-non-medis' } },
  { path: '/list-pengajuan/medis', name: 'list-data-pengajuan-medis', component: SubmissionListPage, props: { view: 'pengajuan-medis' } },
  { path: '/list-pengajuan/lengkap', name: 'list-data-pengajuan-lengkap', component: SubmissionListPage, props: { view: 'pengajuan-lengkap' } },
  { path: '/list-pengajuan/ditolak', name: 'list-data-pengajuan-ditolak', component: SubmissionListPage, props: { view: 'pengajuan-ditolak' } },
  { path: '/list-pengajuan/h2h', name: 'list-data-h2h', component: SubmissionListPage, props: { view: 'h2h' } },

  { path: '/list-underwriting/otomatis', name: 'list-data-underwriting', component: SubmissionListPage, props: { view: 'underwriting' } },
  { path: '/list-underwriting/non-medis', name: 'list-data-underwriting-non-medis', component: SubmissionListPage, props: { view: 'underwriting-non-medis' } },
  { path: '/list-underwriting/medis', name: 'list-data-underwriting-medis', component: SubmissionListPage, props: { view: 'underwriting-medis' } },

  { path: '/list-keputusan/diterima', name: 'list-data-keputusan', component: SubmissionListPage, props: { view: 'keputusan' } },
  { path: '/list-keputusan/ditolak', name: 'list-data-keputusan-ditolak', component: SubmissionListPage, props: { view: 'keputusan-ditolak' } },
  { path: '/list-keputusan/ditunda', name: 'list-data-keputusan-ditunda', component: SubmissionListPage, props: { view: 'keputusan-ditunda' } },

  { path: '/list-pengajuan-inforce', name: 'list-pengajuan-inforce', component: SubmissionListPage, props: { view: 'pengajuan-inforce' } },
  { path: '/list-pengajuan-pending', name: 'list-pengajuan-pending', component: SubmissionListPage, props: { view: 'pengajuan-pending' } },
  { path: '/list-pengajuan-outstanding', name: 'list-pengajuan-outstanding', component: SubmissionListPage, props: { view: 'pengajuan-outstanding' } },
  { path: '/list-pengajuan-dibatalkan', name: 'list-pembatalan', component: SubmissionListPage, props: { view: 'pengajuan-dibatalkan' } },
  { path: '/list-pengajuan-ditolak', name: 'list-pengajuan-ditolak', component: SubmissionListPage, props: { view: 'pengajuan-ditolak-status' } },
  { path: '/list-pembatalan-nomor-sertifikat', name: 'list-pembatalan-nomor-sertifikat', component: SubmissionListPage, props: { view: 'pembatalan-nomor-sertifikat' } },

  { path: '/dokumen-surat/sertifikat-asuransi', name: 'dokumen-surat', component: SubmissionListPage, props: { view: 'dokumen-surat' } },
  { path: '/list-cover-note/sudah-bayar', name: 'list-cover-note', component: SubmissionListPage, props: { view: 'cover-note' } },
  { path: '/list-cover-note/belum-bayar', name: 'list-cover-note-belum-bayar', component: SubmissionListPage, props: { view: 'cover-note-belum-bayar' } },
  { path: '/list-debit-note/belum-dikonfirmasi', name: 'list-debit-note', component: SubmissionListPage, props: { view: 'debit-note' } },
  { path: '/list-debit-note/sudah-dikonfirmasi', name: 'list-debit-note-sudah-dikonfirmasi', component: SubmissionListPage, props: { view: 'debit-note-sudah-dikonfirmasi' } },

  { path: '/detail/data-debitur/:id', name: 'detail-debitur', component: () => import('@/views/penutupan/detail/DataDebitur.vue') },
  { path: '/detail/data-asuransi/:id', name: 'detail-data-asuransi', component: () => import('@/views/penutupan/detail/DataAsuransi.vue') },
  { path: '/detail/dokumen-spajk/:id', name: 'detail-dokumen-spajk', component: () => import('@/views/penutupan/detail/DokumenSpajk.vue') },
  { path: '/detail/dokumen-medis-tambahan/:id', name: 'detail-dokumen-medis-tambahan', component: () => import('@/views/penutupan/detail/DokumenMedisTambahan.vue') },
  { path: '/detail/em-ep/:id', name: 'detail-em-ep', component: () => import('@/views/penutupan/detail/EmEp.vue') },
  { path: '/detail/topup-khusus/:id', name: 'detail-topup-khusus', component: () => import('@/views/penutupan/detail/TopupKhusus.vue') },
  { path: '/detail/penyebaran-risiko/:id', name: 'detail-penyebaran-risiko', component: () => import('@/views/penutupan/detail/RiskDistribution.vue'), props: { mode: 'table' } },
  { path: '/detail/diagram-penyebaran-risiko/:id', name: 'detail-diagram-penyebaran-risiko', component: () => import('@/views/penutupan/detail/RiskDistribution.vue'), props: { mode: 'diagram' } },
  { path: '/detail/fakultatif/:id', name: 'detail-fakultatif', component: () => import('@/views/penutupan/detail/Fakultatif.vue') },
  { path: '/detail/sla/:id', name: 'detail-sla', component: () => import('@/views/penutupan/detail/Sla.vue') },
  { path: '/detail/riwayat-pengajuan/:id', name: 'detail-riwayat-pengajuan', component: () => import('@/views/penutupan/detail/RiwayatPengajuan.vue') },
  { path: '/detail/riwayat/:id', name: 'detail-riwayat', component: () => import('@/views/penutupan/detail/Riwayat.vue') },
  { path: '/detail/revisi-data/:id', name: 'detail-revisi-data', component: () => import('@/views/penutupan/detail/RevisiData.vue') },
  { path: '/perubahan-data-pic/:id', name: 'perubahan-data-pic', component: Placeholder },
]

// ---- Route publik (tanpa login) ----
const publicRoutes = [
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import('@/views/auth/SignIn.vue'),
    meta: { layout: 'auth', public: true },
  },
  {
    path: '/reset-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPassword.vue'),
    meta: { layout: 'auth', public: true },
  },
]

// ---- Route yang SUDAH diport ----
const readyRoutes = [
  { path: '/', name: 'Home', component: () => import('@/views/Dashboard.vue') },
  { path: '/ubah-kata-sandi', name: 'ubah-kata-sandi', component: () => import('@/views/UbahKataSandi.vue') },
  { path: '/profil', name: 'profile', component: () => import('@/views/users/Profile.vue') },
  { path: '/pengaturan-akun', name: 'account-setting', component: () => import('@/views/users/AccountSetting.vue') },
  // Laporan
  { path: '/laporan-ae-monitoring', name: 'laporan-ae-monitoring', component: () => import('@/views/reports/LaporanAeMonitoring.vue') },
]

/**
 * Nama-nama route yang BELUM diport. Path dibuat otomatis dari nama
 * (mis. 'list-restitusi' -> '/list-restitusi') agar konsisten & tanpa salah ketik.
 */
const pendingRouteNames = [
  // Data & CSV sudah diport.
  // Penutupan / Pengajuan
  // Klaim (input & list sudah diport; klaim khusus masih placeholder)
  'input-klaim-khusus', 'list-klaim-khusus',
  // Restitusi (list & input sudah diport; topup masih placeholder)
  'list-topup-khusus',
  // Restitusi detail sudah diport bertahap mengikuti ehd-backoffice.
  // Penutupan detail sudah diport bertahap mengikuti ehd-backoffice.
  // Laporan Produksi dan sub-route sudah diport.
  // Pembayaran Bulanan sudah diport.
  // Menu tunggal
  'pricing', 'valuasi', 'reasuransi', 'analisa-bisnis', 'layanan-pelanggan',
  'deteksi-fraud', 'habis-kontrak', 'layanan-data', 'kalkulator-asuransi', 'panduan-aplikasi',
]

const pendingPathMap = {}

const pendingRoutes = pendingRouteNames.map((name) => ({
  // Halaman detail menerima :id opsional agar link tab (yang membawa params.id)
  // tidak memicu peringatan Vue Router meski halamannya masih placeholder.
  path: pendingPathMap[name] || (name.startsWith('detail-') ? '/' + name + '/:id?' : '/' + name),
  name,
  component: Placeholder,
}))

// ---- 404 ----
const notFound = {
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('@/views/NotFound.vue'),
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...publicRoutes,
    ...readyRoutes,
    ...dashboardRoutes,
    ...csvRoutes,
    ...restitusiRoutes,
    ...klaimRoutes,
    ...penutupanRoutes,
    ...laporanRoutes,
    ...pembayaranBulananRoutes,
    ...pendingRoutes,
    notFound,
  ],
  // Selalu scroll ke atas saat pindah halaman.
  scrollBehavior: () => ({ top: 0 }),
})

/**
 * PENJAGA AKSES (guard) — jalan sebelum setiap perpindahan halaman.
 *  - Halaman non-publik wajib login; kalau belum -> lempar ke /sign-in.
 *  - Kalau sudah login tapi buka /sign-in -> lempar ke beranda.
 *
 * Catatan keamanan: ini hanya pengaman UX. Backend TETAP wajib memvalidasi
 * setiap request (guard frontend bisa dilewati oleh penyerang).
 */
router.beforeEach((to) => {
  const isPublic = to.meta.public === true

  if (!isPublic && !isLoggedIn()) {
    return { name: 'sign-in' }
  }
  if (isPublic && isLoggedIn() && to.name === 'sign-in') {
    return { name: 'Home' }
  }
  return true
})

export default router
