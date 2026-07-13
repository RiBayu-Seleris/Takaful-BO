/**
 * Tab LAPORAN PRODUKSI — dipakai bersama oleh halaman Akseptasi (komponen khusus)
 * dan ProductionReportPage (tab lainnya), supaya daftar & gating-nya satu sumber.
 *
 * Gating persis production_report_akseptasi.vue asli:
 *  - 'all'       : selalu tampil (Akseptasi)
 *  - 'brokergrm' : hanya Broker GRM (role Broker & broker_id 1) -> Surat Fee Base
 *  - 'nonbank'   : hanya non-bank (role != Bank/Branch Bank)    -> selebihnya
 */
export const PRODUCTION_TABS = [
  { key: 'akseptasi', label: 'Akseptasi', route: 'laporan-produksi', scope: 'all' },
  { key: 'surat-feebase', label: 'Surat Fee Base', route: 'laporan-produksi-surat-feebase', scope: 'brokergrm' },
  { key: 'asuransi', label: 'Asuransi', route: 'laporan-produksi-asuransi', scope: 'nonbank' },
  { key: 'summary', label: 'Summary', route: 'laporan-produksi-summary', scope: 'nonbank' },
  { key: 'sppa', label: 'SPPA', route: 'laporan-produksi-sppa', scope: 'nonbank' },
  { key: 'restrukturisasi', label: 'Restrukturisasi', route: 'laporan-produksi-restrukturisasi', scope: 'nonbank' },
  { key: 'revisi', label: 'Revisi', route: 'laporan-produksi-revisi', scope: 'nonbank' },
  { key: 'produksi-telat', label: 'Produksi Telat', route: 'laporan-produksi-produksi-telat', scope: 'nonbank' },
  { key: 'produksi-pending', label: 'Produksi Pending', route: 'laporan-produksi-produksi-pending', scope: 'nonbank' },
  { key: 'bordero', label: 'Bordero', route: 'laporan-produksi-bordero', scope: 'nonbank' },
  { key: 'tanggungan', label: 'Tanggungan', route: 'laporan-produksi-tanggungan', scope: 'nonbank' },
  { key: 'yes-file', label: 'YES File', route: 'laporan-produksi-yes-file', scope: 'nonbank' },
]

/**
 * Saring tab sesuai role user (mengikuti v-if nav aslinya).
 * @param {string} role         role dari sesi (Admin/Bank/Broker/...)
 * @param {number} brokerUserId broker_id user (untuk deteksi Broker GRM)
 */
export function filterProductionTabs(role, brokerUserId) {
  const nonBank = role !== 'Bank' && role !== 'Branch Bank'
  const brokerGrm = role === 'Broker' && Number(brokerUserId) === 1
  return PRODUCTION_TABS.filter((t) => {
    if (t.scope === 'brokergrm') return brokerGrm
    if (t.scope === 'nonbank') return nonBank
    return true
  })
}
