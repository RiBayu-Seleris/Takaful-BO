<script setup>
/**
 * DETAIL PENUTUPAN — REVISI DATA.
 * Endpoint sumber:
 * - GET  submission/revision-data/{id}?field_name=...
 * - PUT  submission/revision-data/{id}
 * - GET  submission/revision-data/history/{id}
 * - POST upload-file (opsional dokumen)
 */
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSession } from '@/lib/auth'
import { formatDate, formatNumber, parseNumber } from '@/lib/format'
import { safeUrl } from '@/lib/sanitize'
import {
  getSubmissionRevisionField,
  submissionRevisionHistoryFetcher,
  updateSubmissionRevision,
} from '@/lib/services/submission'
import { uploadFile } from '@/lib/services/upload'
import { penutupanDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import Card from '@/components/ui/Card.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DataTable from '@/components/ui/DataTable.vue'
import { Download } from 'lucide-vue-next'

useMeta({ title: 'Detail Penutupan — Revisi Data' })

const route = useRoute()
const session = getSession()
const id = route.params.id

const category = ref(null)
const existingData = ref('')
const revisionData = ref('')
const description = ref('')
const file = ref(null)
const loadingField = ref(false)
const saving = ref(false)
const rawValue = ref('')

const categoryMap = {
  'No. Akad': { key: 'contract_number', type: 'text' },
  'No. Rekening': { key: 'account_number', type: 'text' },
  Nama: { key: 'debitur_name', type: 'text' },
  'Jenis Kelamin': { key: 'gender', type: 'text' },
  NIK: { key: 'id_card_number', type: 'text' },
  Pekerjaan: { key: 'occupation', type: 'text' },
  'Instansi Pekerjaan': { key: 'company_name', type: 'text' },
  'Detail Pekerjaan': { key: 'detail_occupation', type: 'text' },
  'Tempat Lahir': { key: 'pob', type: 'text' },
  'Tanggal Lahir': { key: 'dob', type: 'date' },
  'Masa Asuransi': { key: 'insurance_period', type: 'text' },
  'Mulai Asuransi': { key: 'start_date', type: 'date' },
  'Uang Pertanggungan': { key: 'sum_insured', type: 'currency' },
  Premi: { key: 'premium', type: 'currency' },
  Usia: { key: 'age', type: 'text' },
  'No. Pengajuan Kredit': { key: 'submission_number', type: 'text' },
  'Kode Unik Broker': { key: 'submission_unique_code', type: 'text' },
  'Tanggal Pengajuan': { key: 'submission_date', type: 'date' },
  'Alamat Pekerjaan': { key: 'company_address', type: 'text' },
  Gaji: { key: 'annual_income', type: 'currency' },
  'Ibu Kandung': { key: 'biological_mother_name', type: 'text' },
  Agama: { key: 'religion', type: 'text' },
  Alamat: { key: 'address', type: 'text' },
}

const categoryOptions = Object.keys(categoryMap)
const categoryType = computed(() => category.value ? categoryMap[category.value]?.type || 'text' : '')
const historyFetcher = submissionRevisionHistoryFetcher(id)

const columns = [
  { key: 'aksi', label: 'Aksi', align: 'center' },
  { key: 'field_name', label: 'Kategori' },
  { key: 'data_before', label: 'Data Lama', formatter: formatRevisionValue },
  { key: 'data_after', label: 'Data Baru', formatter: formatRevisionValue },
  { key: 'description', label: 'Keterangan' },
  { key: 'created_at', label: 'Tanggal Ubah', formatter: (v) => formatDate(v, 'HH:mm DD-MM-YYYY', 'YYYY-MM-DD HH:mm:ss.SSS') },
  { key: 'user_name', label: 'User Input' },
]

function formatRevisionValue(value, row) {
  if ((row?.field_name === 'Uang Pertanggungan' || row?.field_name === 'Premi' || row?.field_name === 'Gaji') && value) {
    return 'Rp ' + Number(value).toLocaleString('id-ID')
  }
  return value || '-'
}

async function loadCategory() {
  existingData.value = ''
  revisionData.value = ''
  rawValue.value = ''
  if (!category.value) return
  loadingField.value = true
  try {
    const res = await getSubmissionRevisionField(id, category.value)
    if (res.is_revision) {
      category.value = null
      return window.Swal.fire({
        icon: 'error',
        title: 'Perubahan Sudah Dilakukan',
        text: 'Hubungi customer service untuk melakukan perubahan data kembali',
        padding: '2em',
      })
    }
    const meta = categoryMap[category.value]
    let value = res[meta.key]
    if (meta.type === 'currency' && value != null) value = 'Rp ' + Number(value).toLocaleString('id-ID')
    existingData.value = value || ''
  } catch {
    window.Swal.fire({ icon: 'error', title: 'Terjadi Kesalahan', padding: '2em' })
  } finally {
    loadingField.value = false
  }
}

function normalizeCurrency() {
  const n = parseNumber(revisionData.value)
  rawValue.value = n ? String(n) : ''
  revisionData.value = n ? 'Rp ' + formatNumber(n) : ''
}

function cleanNewValue() {
  if (categoryType.value === 'currency') return rawValue.value
  if (categoryType.value === 'date') return revisionData.value ? formatDate(revisionData.value, 'DD/MM/YYYY') : ''
  return revisionData.value
}

async function save() {
  if (!category.value || !revisionData.value) {
    return window.Swal.fire({ icon: 'error', text: 'Kategori dan data baru wajib diisi', padding: '1em' })
  }
  saving.value = true
  try {
    const check = await getSubmissionRevisionField(id, category.value)
    if (check.is_revision) {
      return window.Swal.fire({
        icon: 'error',
        title: `Perubahan ${category.value} Sudah Dilakukan`,
        text: 'Hubungi customer service untuk melakukan perubahan data kembali',
        padding: '2em',
      })
    }
    let documentUrl = null
    const selectedFile = file.value?.files?.[0]
    if (selectedFile) documentUrl = await uploadFile(selectedFile)

    await updateSubmissionRevision(id, {
      new_value: cleanNewValue(),
      description: description.value,
      document_url: documentUrl,
      user_id: parseInt(session.userId, 10),
      field_name: category.value,
    })
    await window.Swal.fire({ icon: 'success', title: 'Berhasil!', padding: '2em' })
    category.value = null
    existingData.value = ''
    revisionData.value = ''
    description.value = ''
    if (file.value) file.value.value = ''
  } catch {
    window.Swal.fire({ icon: 'error', title: 'Terjadi Kesalahan', padding: '2em' })
  } finally {
    saving.value = false
  }
}

function download(row) {
  if (row.document_url) window.open(safeUrl(row.document_url), '_blank', 'noopener')
}
</script>

<template>
  <DetailTabsLayout :tabs="penutupanDetailTabs" :id="id" title="Detail Penutupan" :back="{ name: 'list-data-pengajuan-non-medis' }">
    <div class="space-y-5">
      <Card title="Form Revisi Data">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseSelect
            v-model="category"
            :options="categoryOptions"
            label="Kategori"
            placeholder="Pilih Kategori"
            required
            @update:model-value="loadCategory"
          />
          <div>
            <label class="form-label">Data Lama</label>
            <input :value="loadingField ? 'Memuat...' : existingData" class="form-input" disabled />
          </div>
          <div>
            <label class="form-label">Data Baru <span class="text-danger">*</span></label>
            <input
              v-if="categoryType === 'date'"
              v-model="revisionData"
              type="date"
              class="form-input"
            />
            <input
              v-else-if="categoryType === 'currency'"
              v-model="revisionData"
              class="form-input"
              placeholder="Rp 0"
              @input="normalizeCurrency"
            />
            <input
              v-else
              v-model="revisionData"
              class="form-input"
              @input="revisionData = revisionData?.toUpperCase()"
            />
          </div>
          <div>
            <label class="form-label">Dokumen Pendukung</label>
            <input ref="file" type="file" class="form-input" />
          </div>
          <div class="sm:col-span-2">
            <label class="form-label">Keterangan</label>
            <input v-model="description" class="form-input" @input="description = description?.toUpperCase()" />
          </div>
        </div>
        <div class="mt-5 flex justify-end">
          <BaseButton :loading="saving" @click="save">Simpan Revisi</BaseButton>
        </div>
      </Card>

      <Card no-body class="p-4">
        <DataTable
          :columns="columns"
          server-side
          :fetcher="historyFetcher"
          search-placeholder="Cari history revisi..."
          empty-message="Belum ada history revisi"
        >
          <template #cell-aksi="{ row }">
            <button
              v-if="row.document_url"
              class="btn-icon btn-ghost text-primary-500"
              title="Unduh dokumen"
              @click="download(row)"
            >
              <Download class="h-5 w-5" />
            </button>
          </template>
        </DataTable>
      </Card>
    </div>
  </DetailTabsLayout>
</template>
