<script setup>
/**
 * DAFTAR KLAIM (reusable).
 * Satu komponen untuk list utama & semua tab status klaim (register, proses
 * broker/asuransi, ditolak, diterima, dibayar, settle, banding, dibatalkan).
 * Data per-halaman dari server (endpoint claim/list). Klik ikon mata -> detail debitur.
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { claimListFetcher } from '@/lib/services/claim'
import { rupiah } from '@/lib/format'
import { useMeta } from '@/composables/useMeta'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Badge from '@/components/ui/Badge.vue'
import { Eye } from 'lucide-vue-next'

const props = defineProps({
  status: { type: String, default: 'claim_registered' },
  title: { type: String, default: 'List Klaim' },
})

useMeta({ title: () => props.title })

const router = useRouter()

const tabs = [
  { label: 'Terdaftar', route: 'list-klaim-register' },
  { label: 'Proses Broker', route: 'list-klaim-diproses-broker' },
  { label: 'Proses Asuransi', route: 'list-klaim-diproses-asuransi' },
  { label: 'Ditolak', route: 'list-klaim-ditolak' },
  { label: 'Diterima', route: 'list-klaim-diterima' },
  { label: 'Dibayar', route: 'list-klaim-dibayar' },
  { label: 'Settle', route: 'list-klaim-settle' },
  { label: 'Banding', route: 'list-klaim-banding' },
  { label: 'Dibatalkan', route: 'list-klaim-dibatalkan' },
]

const columns = [
  { key: 'aksi', label: 'Aksi', align: 'center' },
  { key: 'contract_number', label: 'No. Akad' },
  { key: 'id_card_number', label: 'No. Identitas' },
  { key: 'partner_name', label: 'Perusahaan/Client' },
  { key: 'member_name', label: 'Nama Cabang' },
  { key: 'debitur_name', label: 'Nama Debitur' },
  { key: 'start_date', label: 'Mulai Asuransi' },
  { key: 'end_date', label: 'Akhir Asuransi' },
  { key: 'certificate_number', label: 'No. Sertifikat' },
  { key: 'sum_insured', label: 'Uang Pertanggungan', align: 'right', formatter: (v) => rupiah(v) },
  { key: 'date_incident', label: 'Tanggal Kejadian' },
  { key: 'claim_type', label: 'Jenis Klaim' },
  { key: 'claim_submitted', label: 'Total Diajukan', align: 'right', formatter: (v) => rupiah(v) },
  { key: 'date_submission_claim', label: 'Tanggal Klaim' },
  { key: 'claim_status_description', label: 'Status' },
  { key: 'user_name', label: 'User Input' },
  { key: 'bank_name', label: 'Nama Bank Umum' },
  { key: 'account_name', label: 'Nama Akun Penerima' },
  { key: 'account_number', label: 'No. Rekening Penerima' },
]

const fetcher = computed(() => claimListFetcher(props.status))

function openDetail(row) {
  if (row?.claim_id) router.push({ name: 'detail-klaim-data-debitur', params: { id: row.claim_id } })
}

function statusVariant(text) {
  const t = (text || '').toLowerCase()
  if (t.includes('tolak') || t.includes('unclaim') || t.includes('batal')) return 'danger'
  if (t.includes('bayar') || t.includes('paid') || t.includes('clear') || t.includes('terima') || t.includes('confirm')) return 'success'
  if (t.includes('proses') || t.includes('waiting') || t.includes('banding') || t.includes('appeal')) return 'warning'
  return 'primary'
}
</script>

<template>
  <div>
    <PageHeader :title="title" subtitle="Kelola dan pantau pengajuan klaim." />

    <div class="mb-4 flex flex-wrap gap-2">
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

    <Card no-body class="p-4">
      <DataTable
        :key="status"
        :columns="columns"
        server-side
        :fetcher="fetcher"
        search-placeholder="Cari nomor akad, debitur, sertifikat..."
        empty-message="Belum ada data klaim"
      >
        <template #cell-aksi="{ row }">
          <button class="btn-icon btn-ghost text-primary-500" title="Lihat detail" @click="openDetail(row)">
            <Eye class="h-5 w-5" />
          </button>
        </template>

        <template #cell-claim_status_description="{ value }">
          <Badge :variant="statusVariant(value)">{{ value }}</Badge>
        </template>
      </DataTable>
    </Card>
  </div>
</template>
