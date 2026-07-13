<script setup>
/**
 * HALAMAN DAFTAR PENUTUPAN.
 *
 * Di ehd-backoffice, Penutupan terdiri dari banyak file list-data yang mirip,
 * tetapi tidak identik: route tab berbeda, filter API berbeda, beberapa kolom
 * berubah sesuai partner, dan Debit Note punya aksi konfirmasi pendebitan.
 *
 * Komponen ini tetap reusable, tetapi `view` menentukan konfigurasi persis:
 * filter `submission/list`, grup tab, kolom, dan aksi khusus.
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { submissionListFetcher, h2hLogsFetcher, confirmSubmissionDebet } from '@/lib/services/submission'
import { getSession } from '@/lib/auth'
import { useAuthStore } from '@/stores/auth'
import { rupiah } from '@/lib/format'
import { useMeta } from '@/composables/useMeta'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Badge from '@/components/ui/Badge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { CheckCircle2, ClipboardCopy, Eye, FileText } from 'lucide-vue-next'

const props = defineProps({
  // Nama view internal, mis. 'pengajuan-non-medis', 'debit-note'.
  view: { type: String, default: '' },
  // Kompatibilitas route lama yang masih mengirim props manual.
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  filter: { type: Object, default: null },
  detailRoute: { type: String, default: 'detail-debitur' },
})

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const session = getSession()
const partnerId = Number(session.partnerId || 0)

const selectedIds = ref([])
const tableRef = ref(null)
const confirming = ref(false)

// Filter khusus Logs H2H (mengikuti h2h_logs.vue lama).
const h2hStartDate = ref('')
const h2hEndDate = ref('')
const h2hPartnerId = ref(0)
const h2hAppliedFilter = ref({})
const h2hPartnerOptions = ref([{ partner_id: 0, partner_name: 'Semua Bank' }])
let h2hInitialized = false

// Tab PERSIS pengajuan_non_medis.vue asli: "Otomatis" di-comment (tidak ada),
// label memakai kata "Pengajuan ...", dan "Logs H2H" hanya untuk Administrator.
const penutupanTabs = [
  { label: 'Pengajuan HD', route: 'list-data-pengajuan-ehd' },
  { label: 'Pengajuan Non Medis', route: 'list-data-pengajuan-non-medis' },
  { label: 'Pengajuan Medis', route: 'list-data-pengajuan-medis' },
  { label: 'Pengajuan Lengkap', route: 'list-data-pengajuan-lengkap' },
  { label: 'Pengajuan Ditolak', route: 'list-data-pengajuan-ditolak' },
  { label: 'Logs H2H', route: 'list-data-h2h', adminOnly: true },
]

const underwritingTabs = [
  { label: 'Otomatis', route: 'list-data-underwriting' },
  { label: 'Non Medis', route: 'list-data-underwriting-non-medis' },
  { label: 'Medis', route: 'list-data-underwriting-medis' },
]

const keputusanTabs = [
  { label: 'Diterima', route: 'list-data-keputusan' },
  { label: 'Ditolak', route: 'list-data-keputusan-ditolak' },
  { label: 'Ditunda', route: 'list-data-keputusan-ditunda' },
]

const statusTabs = [
  { label: 'Inforce', route: 'list-pengajuan-inforce' },
  { label: 'Pending', route: 'list-pengajuan-pending' },
  { label: 'Outstanding', route: 'list-pengajuan-outstanding' },
  { label: 'Incomplete', route: 'list-data-pengajuan-lengkap' },
  { label: 'Dibatalkan', route: 'list-pembatalan' },
  { label: 'Ditolak', route: 'list-pengajuan-ditolak' },
]

const coverNoteTabs = [
  { label: 'Sudah Bayar', route: 'list-cover-note' },
  { label: 'Belum Bayar', route: 'list-cover-note-belum-bayar' },
]

const debitNoteTabs = [
  { label: 'Belum Dikonfirmasi', route: 'list-debit-note' },
  { label: 'Sudah Dikonfirmasi', route: 'list-debit-note-sudah-dikonfirmasi' },
]

const pembatalanTabs = [
  { label: 'Pengajuan Dibatalkan', route: 'list-pembatalan' },
  { label: 'Pembatalan Nomor Sertifikat', route: 'list-pembatalan-nomor-sertifikat' },
]

const viewConfigs = {
  'pengajuan-otomatis': { title: 'List Pengajuan', filter: { submission: 'fcl' }, group: 'pengajuan', columns: 'pengajuan' },
  'pengajuan-ehd': { title: 'List Pengajuan', filter: { acceptance: 'onreview', submission: 'ehd' }, group: 'pengajuan', columns: 'pengajuan' },
  'pengajuan-non-medis': { title: 'List Pengajuan', filter: { acceptance: 'onreview', submission: 'non-medis' }, group: 'pengajuan', columns: 'pengajuan' },
  'pengajuan-medis': { title: 'List Pengajuan', filter: { acceptance: 'onreview', submission: 'medis' }, group: 'pengajuan', columns: 'pengajuan' },
  'pengajuan-lengkap': { title: 'List Pengajuan Belum Lengkap', filter: { acceptance: 'unrisked' }, group: 'pengajuan', columns: 'pengajuan' },
  'pengajuan-ditolak': { title: 'List Pengajuan Ditolak', filter: { acceptance: 'rejected' }, group: 'pengajuan', columns: 'pengajuan' },

  'underwriting': { title: 'List Data Underwriting', filter: { submission: 'fcl' }, group: 'underwriting', columns: 'underwriting' },
  'underwriting-non-medis': { title: 'List Data Underwriting', filter: { acceptance: 'accepted', submission: 'non-medis' }, group: 'underwriting', columns: 'underwriting' },
  'underwriting-medis': { title: 'List Data Underwriting', filter: { acceptance: 'accepted', submission: 'medis' }, group: 'underwriting', columns: 'underwriting' },

  'keputusan': { title: 'List Keputusan', filter: { acceptance: 'accepted' }, group: 'keputusan', columns: 'keputusan' },
  'keputusan-ditolak': { title: 'List Keputusan Ditolak', filter: { acceptance: 'rejected' }, group: 'keputusan', columns: 'keputusan' },
  'keputusan-ditunda': { title: 'List Keputusan Ditunda', filter: { acceptance: 'cancelled' }, group: 'keputusan', columns: 'keputusan' },

  'pengajuan-inforce': { title: 'List Pengajuan Inforce', filter: { acceptance: 'accepted', already_recon: true, payment_status: 'paid_by_recon' }, group: 'status', columns: 'keputusan' },
  'pengajuan-pending': { title: 'List Pengajuan Pending', filter: { acceptance: 'accepted', already_recon: true, payment_status: 'paid' }, group: 'status', columns: 'keputusan' },
  'pengajuan-outstanding': { title: 'List Pengajuan Outstanding', filter: { acceptance: 'accepted', already_recon: false }, group: 'status', columns: 'keputusan' },
  'pengajuan-dibatalkan': { title: 'List Pengajuan Dibatalkan', filter: { acceptance: 'cancelled' }, group: 'pembatalan', columns: 'pembatalan' },
  'pengajuan-ditolak-status': { title: 'List Pengajuan Ditolak', filter: { acceptance: 'rejected' }, group: 'status', columns: 'pengajuan' },
  'pembatalan-nomor-sertifikat': { title: 'Pembatalan Nomor Sertifikat', filter: { acceptance: 'cancelled' }, group: 'pembatalan', columns: 'pembatalan-sertifikat' },

  'cover-note': { title: 'List Cover Note', filter: { acceptance: 'accepted', payment: 'paid' }, group: 'cover-note', columns: 'cover-note', exportPdf: true },
  'cover-note-belum-bayar': { title: 'List Cover Note Belum Bayar', filter: { acceptance: 'accepted', payment: 'unpaid' }, group: 'cover-note', columns: 'cover-note', exportPdf: true },
  'debit-note': { title: 'List Debit Note', filter: { acceptance: 'accepted', payment: 'unpaid' }, group: 'debit-note', columns: 'debit-note', selectable: true },
  'debit-note-sudah-dikonfirmasi': { title: 'List Debit Note Sudah Dikonfirmasi', filter: { acceptance: 'accepted', payment: 'paid' }, group: 'debit-note', columns: 'cover-note' },
  'dokumen-surat': { title: 'Dokumen & Surat', filter: { acceptance: 'accepted', payment: 'paid' }, columns: 'dokumen' },

  h2h: { title: 'Logs H2H', filter: {}, group: 'pengajuan', columns: 'h2h', h2h: true },
}

const config = computed(() => {
  if (props.view && viewConfigs[props.view]) return viewConfigs[props.view]
  return {
    title: props.title || 'List Pengajuan',
    filter: props.filter || {},
    columns: 'pengajuan',
  }
})

useMeta({ title: () => config.value.title })

const isAdministrator = computed(() => session.role === 'Admin')

const tabs = computed(() => {
  let list = []
  switch (config.value.group) {
    case 'pengajuan': list = penutupanTabs; break
    case 'underwriting': list = underwritingTabs; break
    case 'keputusan': list = keputusanTabs; break
    case 'status': list = statusTabs; break
    case 'cover-note': list = coverNoteTabs; break
    case 'debit-note': list = debitNoteTabs; break
    case 'pembatalan': list = pembatalanTabs; break
    default: return []
  }
  // Tab bertanda adminOnly (mis. Logs H2H) hanya tampil untuk Administrator.
  return list.filter((t) => !t.adminOnly || isAdministrator.value)
})

function submissionIdentifier(row) {
  if (partnerId === 26) return row.submission_unique_code || row.submission_number
  return row.submission_number || row.contract_number
}

function submissionIdentifierLabel() {
  if (partnerId === 26) return 'Kode Unik Broker'
  if (partnerId === 25) return 'Nomor Registrasi'
  return 'No. Pengajuan Kredit'
}

function noAkadLabel() {
  if (partnerId === 16) return 'No. Akad'
  if (partnerId === 31) return 'Nomor Surat'
  return 'No. Akad'
}

const baseColumns = {
  aksi: { key: 'aksi', label: 'Aksi', align: 'center', width: '84px' },
  broker: { key: 'insurance_broker', label: 'Nama Broker', hidden: partnerId !== 26 },
  pengajuanNumber: { key: 'submission_identifier', label: submissionIdentifierLabel(), formatter: (_, row) => submissionIdentifier(row), hidden: partnerId === 31 },
  ehd: { key: 'ehd_number', label: 'Kode Unik e-HD' },
  kodeAo: { key: 'submission_number', label: 'Kode AO', hidden: partnerId !== 26 },
  akad: { key: 'contract_number', label: noAkadLabel(), hidden: !(partnerId === 16 || partnerId === 31) },
  nik: { key: 'id_card_number', label: 'NIK' },
  identitas: { key: 'id_card_number', label: 'No. Identitas' },
  member: { key: 'member', label: 'Nama Cabang' },
  kantor: { key: 'member', label: 'Nama Kantor' },
  debitur: { key: 'debitur_name', label: 'Nama Debitur' },
  produk: { key: 'product_id', label: 'Nama Produk' },
  usia: { key: 'age', label: 'Usia', formatter: (v) => `${v || 0} Tahun` },
  period: { key: 'insurance_period', label: 'Masa Asuransi', formatter: (v) => `${v || 0} Bulan` },
  start: { key: 'start_date', label: 'Mulai Asuransi' },
  end: { key: 'end_date', label: 'Akhir Asuransi' },
  sum: { key: 'sum_insured', label: 'Uang Pertanggungan', align: 'right', formatter: (v) => rupiah(v) },
  basic: { key: 'basic_premium', label: 'Premi', align: 'right', formatter: (v) => rupiah(v) },
  extra: { key: 'extra_premium', label: 'Premi EM/EP', align: 'right', formatter: (v) => rupiah(v) },
  rate: { key: 'extra_premium_rate', label: 'EM' },
  total: { key: 'total_premium', label: 'Total Premi', align: 'right', formatter: (v) => rupiah(v) },
  status: { key: 'acceptance_status_description', label: 'Status' },
  created: { key: 'created_at', label: 'Tanggal Input' },
}

function columnsFor(type) {
  const commonPengajuan = [
    baseColumns.aksi, baseColumns.broker, baseColumns.pengajuanNumber, baseColumns.ehd,
    baseColumns.kodeAo, baseColumns.nik, baseColumns.member, baseColumns.debitur,
    baseColumns.produk, baseColumns.usia, baseColumns.period, baseColumns.sum,
    baseColumns.basic, baseColumns.extra, baseColumns.total, baseColumns.status,
    baseColumns.created,
  ]

  const withDates = [
    baseColumns.aksi, baseColumns.broker, baseColumns.pengajuanNumber, baseColumns.ehd,
    baseColumns.kodeAo, baseColumns.akad, baseColumns.nik, baseColumns.member,
    baseColumns.debitur, baseColumns.produk, baseColumns.usia, baseColumns.period,
    baseColumns.start, baseColumns.end, baseColumns.sum, baseColumns.basic,
    baseColumns.extra, baseColumns.rate, baseColumns.status, baseColumns.created,
  ]

  if (type === 'underwriting') {
    return [
      baseColumns.aksi, baseColumns.broker, baseColumns.pengajuanNumber, baseColumns.ehd,
      baseColumns.kodeAo, baseColumns.identitas, baseColumns.kantor, baseColumns.debitur,
      baseColumns.produk, baseColumns.usia, baseColumns.period, baseColumns.start,
      baseColumns.end, baseColumns.sum, baseColumns.basic, baseColumns.extra,
      baseColumns.status, baseColumns.created,
    ].filter((c) => !c.hidden)
  }
  if (type === 'keputusan') return withDates.filter((c) => !c.hidden)
  if (type === 'pembatalan') return withDates.filter((c) => !c.hidden)
  if (type === 'pembatalan-sertifikat') {
    return [
      baseColumns.aksi,
      { key: 'contract_number', label: 'No. Akad' },
      baseColumns.identitas, baseColumns.kantor, baseColumns.debitur, baseColumns.produk,
      baseColumns.usia, baseColumns.period, baseColumns.start, baseColumns.end,
      baseColumns.sum, baseColumns.basic, baseColumns.extra, baseColumns.status,
      baseColumns.created,
    ].filter((c) => !c.hidden)
  }
  if (type === 'cover-note' || type === 'dokumen') {
    return [
      baseColumns.aksi, baseColumns.broker, baseColumns.pengajuanNumber, baseColumns.ehd,
      baseColumns.kodeAo, baseColumns.akad, baseColumns.identitas, baseColumns.kantor,
      baseColumns.debitur, baseColumns.produk, baseColumns.usia, baseColumns.period,
      baseColumns.start, baseColumns.end, baseColumns.sum, baseColumns.basic,
      baseColumns.extra, baseColumns.status, baseColumns.created,
    ].filter((c) => !c.hidden)
  }
  if (type === 'debit-note') {
    return [
      { key: 'select', label: '', align: 'center', width: '48px' },
      ...columnsFor('cover-note'),
    ]
  }
  if (type === 'h2h') {
    return [
      { key: 'aksi', label: 'Aksi', align: 'center' },
      { key: 'ehd_number', label: 'EHD Number', formatter: (_, row) => row.ehd_number || row.submission_number || row.contract_number },
      { key: 'payload', label: 'Payload', formatter: (v) => previewBase64Json(v) },
      { key: 'response', label: 'Response', formatter: (v) => previewBase64Json(v) },
      { key: 'method', label: 'Method' },
      { key: 'created_at', label: 'Created At' },
      { key: 'updated_at', label: 'Updated At' },
    ]
  }
  return commonPengajuan.filter((c) => !c.hidden)
}

const columns = computed(() => columnsFor(config.value.columns))
const activeFilter = computed(() => (
  config.value.h2h
    ? { ...config.value.filter, ...h2hAppliedFilter.value }
    : config.value.filter
))
const fetcher = computed(() => config.value.h2h ? h2hLogsFetcher(activeFilter.value) : submissionListFetcher(activeFilter.value))
const tableKey = computed(() => `${props.view || route.name}:${JSON.stringify(activeFilter.value)}`)

watch(tableKey, () => {
  selectedIds.value = []
})

watch(
  () => config.value.h2h,
  async (enabled) => {
    if (!enabled || h2hInitialized) return
    h2hInitialized = true
    const user = auth.user || (await auth.fetchUser())
    if (user?.role && user.role !== 'Admin') {
      router.push({ name: 'list-data-pengajuan-ehd' })
      return
    }
    try {
      const partners = await auth.loadPartners()
      h2hPartnerOptions.value = [{ partner_id: 0, partner_name: 'Semua Bank' }, ...partners]
    } catch {
      h2hPartnerOptions.value = [{ partner_id: 0, partner_name: 'Semua Bank' }]
    }
  },
  { immediate: true },
)

function openDetail(row) {
  if (row?.id) router.push({ name: props.detailRoute, params: { id: row.id } })
}

function statusVariant(text) {
  const t = (text || '').toLowerCase()
  if (t.includes('tolak') || t.includes('reject') || t.includes('batal') || t.includes('cancel')) return 'danger'
  if (t.includes('accept') || t.includes('terima') || t.includes('inforce') || t.includes('paid')) return 'success'
  if (t.includes('review') || t.includes('pending') || t.includes('tunda') || t.includes('outstanding')) return 'warning'
  return 'primary'
}

function toggleSelected(id, checked) {
  const value = Number(id)
  if (!value) return
  if (checked && !selectedIds.value.includes(value)) selectedIds.value.push(value)
  if (!checked) selectedIds.value = selectedIds.value.filter((item) => item !== value)
}

async function confirmDebet() {
  if (!selectedIds.value.length) {
    return window.Swal.fire({ icon: 'warning', title: 'Pilih minimal satu pengajuan', padding: '2em' })
  }
  const result = await window.Swal.fire({
    title: 'Konfirmasi Pendebitan?',
    text: `${selectedIds.value.length} pengajuan akan dikonfirmasi.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Konfirmasi',
    cancelButtonText: 'Batal',
    padding: '2em',
  })
  if (!result.isConfirmed) return

  confirming.value = true
  try {
    await confirmSubmissionDebet(selectedIds.value)
    selectedIds.value = []
    tableRef.value?.reload()
    window.Swal.fire({ icon: 'success', title: 'Pendebetan berhasil dikonfirmasi', padding: '2em' })
  } catch {
    window.Swal.fire({ icon: 'error', title: 'Terjadi kesalahan saat konfirmasi pendebitan', padding: '2em' })
  } finally {
    confirming.value = false
  }
}

function formatDateTimeFilter(value) {
  return value ? value.replace('T', ' ') : ''
}

function applyH2hFilter() {
  const next = {}
  if (h2hStartDate.value) next.start_date = formatDateTimeFilter(h2hStartDate.value)
  if (h2hEndDate.value) next.end_date = formatDateTimeFilter(h2hEndDate.value)
  if (Number(h2hPartnerId.value) > 0) next.partner_id = Number(h2hPartnerId.value)
  h2hAppliedFilter.value = next
}

function resetH2hFilter() {
  h2hStartDate.value = ''
  h2hEndDate.value = ''
  h2hPartnerId.value = 0
  h2hAppliedFilter.value = {}
}

function exportCoverNote() {
  window.open(`${window.location.origin}/pdf-cover-note`, '_blank', 'noopener')
}

function copyJson(row) {
  const text = JSON.stringify({
    payload: decodeBase64(row.payload),
    response: decodeBase64(row.response),
  }, null, 2)
  navigator.clipboard?.writeText(text)
  window.Swal.fire({ icon: 'success', title: 'Log disalin', timer: 1200, showConfirmButton: false })
}

function decodeBase64(value) {
  if (!value) return null
  try {
    return JSON.parse(atob(value))
  } catch {
    return value
  }
}

function previewBase64Json(value) {
  const decoded = decodeBase64(value)
  const text = decoded === null || decoded === undefined ? '-' : JSON.stringify(decoded)
  return text.length > 48 ? `${text.slice(0, 48)}...` : text
}
</script>

<template>
  <div>
    <PageHeader :title="config.title" :subtitle="subtitle || 'Data Penutupan mengikuti filter dan status dari sistem lama.'" />

    <div v-if="tabs.length" class="mb-4 flex flex-wrap gap-2">
      <router-link
        v-for="tab in tabs"
        :key="tab.route"
        :to="{ name: tab.route }"
        class="rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
        :class="
          $route.name === tab.route
            ? 'bg-primary-500 text-white shadow-sm'
            : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        "
      >
        {{ tab.label }}
      </router-link>
    </div>

    <Card v-if="config.h2h" class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label class="form-label">Start Date</label>
          <input v-model="h2hStartDate" type="datetime-local" class="form-input" />
        </div>
        <div>
          <label class="form-label">End Date</label>
          <input v-model="h2hEndDate" type="datetime-local" class="form-input" />
        </div>
        <BaseSelect
          v-model="h2hPartnerId"
          :options="h2hPartnerOptions"
          option-label="partner_name"
          option-value="partner_id"
          label="Bank"
          placeholder="Pilih Bank"
        />
        <div class="flex items-end gap-2">
          <BaseButton variant="primary" class="flex-1" @click="applyH2hFilter">Filter</BaseButton>
          <BaseButton variant="secondary" class="flex-1" @click="resetH2hFilter">Reset</BaseButton>
        </div>
      </div>
    </Card>

    <Card no-body class="p-4">
      <DataTable
        ref="tableRef"
        :key="tableKey"
        :columns="columns"
        server-side
        :fetcher="fetcher"
        :search-placeholder="config.h2h ? 'Cari nomor EHD, method, payload...' : 'Cari pengajuan, NIK, debitur...'"
        empty-message="Belum ada data"
      >
        <template #toolbar>
          <BaseButton v-if="config.selectable" variant="success" :loading="confirming" @click="confirmDebet">
            <CheckCircle2 class="h-4 w-4" /> Konfirmasi Pendebitan
          </BaseButton>
          <BaseButton v-if="config.exportPdf" variant="outline-primary" @click="exportCoverNote">
            <FileText class="h-4 w-4" /> PDF Cover Note
          </BaseButton>
        </template>

        <template #cell-select="{ row }">
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            :checked="selectedIds.includes(Number(row.id))"
            @change="toggleSelected(row.id, $event.target.checked)"
          />
        </template>

        <template #cell-aksi="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <button
              v-if="config.columns === 'h2h'"
              class="btn-icon btn-ghost text-primary-500"
              title="Salin payload/response"
              @click="copyJson(row)"
            >
              <ClipboardCopy class="h-5 w-5" />
            </button>
            <button
              v-else
              class="btn-icon btn-ghost text-primary-500"
              title="Lihat detail"
              @click="openDetail(row)"
            >
              <Eye class="h-5 w-5" />
            </button>
          </div>
        </template>

        <template #cell-acceptance_status_description="{ value }">
          <Badge :variant="statusVariant(value)">{{ value }}</Badge>
        </template>
      </DataTable>
    </Card>
  </div>
</template>
