<script setup>
/**
 * DAFTAR RESTITUSI (reusable).
 *
 * Satu komponen dipakai untuk list utama DAN semua tab status (terdaftar,
 * proses broker/asuransi, ditolak, diterima, dibayar, settle) — cukup beda `status`.
 * Data diambil per-halaman dari server (endpoint restitute/list) lewat service.
 *
 * Kolom & aksi mengikuti aslinya. Klik ikon mata -> halaman detail debitur.
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { restituteListFetcher } from '@/lib/services/restitute'
import { rupiah } from '@/lib/format'
import { useMeta } from '@/composables/useMeta'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import DataTable from '@/components/ui/DataTable.vue'
import Badge from '@/components/ui/Badge.vue'
import { Eye } from 'lucide-vue-next'

const props = defineProps({
  status: { type: String, default: 'restitute_registered' },
  title: { type: String, default: 'List Restitusi' },
})

useMeta({ title: () => props.title })

const router = useRouter()

// Tab status (navigasi antar tampilan). Aktif ditentukan oleh route saat ini.
const tabs = [
  { label: 'Terdaftar', route: 'list-restitusi' },
  { label: 'Proses Broker', route: 'list-restitusi-diproses-broker' },
  { label: 'Proses Asuransi', route: 'list-restitusi-diproses-asuransi' },
  { label: 'Ditolak', route: 'list-restitusi-ditolak' },
  { label: 'Diterima', route: 'list-restitusi-diterima' },
  { label: 'Dibayar', route: 'list-restitusi-dibayar' },
  { label: 'Settle', route: 'list-restitusi-settle' },
]

// Definisi kolom tabel (key = nama field dari API).
const columns = [
  { key: 'aksi', label: 'Aksi', align: 'center' },
  { key: 'contract_number', label: 'No. Akad' },
  { key: 'id_card_number', label: 'No. Identitas' },
  { key: 'product_code', label: 'Plan ID' },
  { key: 'partner_name', label: 'Perusahaan/Client' },
  { key: 'member_name', label: 'Nama Cabang' },
  { key: 'debitur_name', label: 'Nama Debitur' },
  { key: 'product_name', label: 'Nama Produk' },
  { key: 'polis_number', label: 'No. Polis' },
  { key: 'certificate_number', label: 'No. Sertifikat' },
  { key: 'restitute_premium', label: 'Premi Restitusi', align: 'right', formatter: (v) => rupiah(v) },
  { key: 'restitute_date', label: 'Tanggal Restitusi' },
  { key: 'restitute_status_description', label: 'Status' },
  { key: 'user_name', label: 'User Input' },
]

// Fetcher dibuat ulang bila status berubah (dipakai bersama :key agar remount).
const fetcher = computed(() => restituteListFetcher(props.status))

function openDetail(row) {
  if (!row?.restitute_id) return
  router.push({ name: 'detail-restitusi-data-debitur', params: { id: row.restitute_id } })
}

// Tentukan warna badge status dari kata kuncinya.
function statusVariant(text) {
  const t = (text || '').toLowerCase()
  if (t.includes('tolak') || t.includes('unrestitut')) return 'danger'
  if (t.includes('bayar') || t.includes('paid') || t.includes('clear') || t.includes('terima') || t.includes('confirm')) return 'success'
  if (t.includes('proses') || t.includes('waiting')) return 'warning'
  return 'primary'
}
</script>

<template>
  <div>
    <PageHeader :title="title" subtitle="Kelola dan pantau pengajuan restitusi." />

    <!-- Tab status -->
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
        search-placeholder="Cari nomor akad, debitur, polis..."
        empty-message="Belum ada data restitusi"
      >
        <!-- Kolom Aksi -->
        <template #cell-aksi="{ row }">
          <button
            class="btn-icon btn-ghost text-primary-500"
            title="Lihat detail"
            @click="openDetail(row)"
          >
            <Eye class="h-5 w-5" />
          </button>
        </template>

        <!-- Kolom Status -->
        <template #cell-restitute_status_description="{ value }">
          <Badge :variant="statusVariant(value)">{{ value }}</Badge>
        </template>
      </DataTable>
    </Card>
  </div>
</template>
