<script setup>
/**
 * DETAIL PENUTUPAN — FAKULTATIF.
 * Endpoint sumber:
 * - submission/facultative/{id}
 * - submission/facultative/reassurance/{treatyId}
 * - submission/facultative/retrosesi/{treatyId}
 */
import { onMounted, ref } from 'vue'
import {
  getSubmissionFacultative,
  updateFacultativeReassurance,
  updateFacultativeRetrosesi,
} from '@/lib/services/submission'
import { formatNumber, parseNumber, rupiah } from '@/lib/format'
import { penutupanDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import { useRoute } from 'vue-router'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import Card from '@/components/ui/Card.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Penutupan — Fakultatif' })

const route = useRoute()
const id = route.params.id
const loading = ref(true)
const reassurances = ref([])
const retrocessions = ref([])
const savingKey = ref('')
const treatyTypes = ['Quota Share', 'Surplus', 'Combination']

onMounted(async () => {
  try {
    const data = await getSubmissionFacultative(id)
    reassurances.value = normalizeList(data.reassurance || [], 'reassurance_treaty_id')
    retrocessions.value = normalizeList(data.retrosesi || [], 'retrosesi_treaty_id')
  } finally {
    loading.value = false
  }
})

function normalizeList(list, idKey) {
  return list.map((item) => ({
    ...item,
    _idKey: idKey,
    _surplusText: item.surplus ? formatNumber(item.surplus) : '',
    _quotaShareText: item.quota_share ?? '',
  }))
}

function normalizeSurplus(item) {
  const n = parseNumber(item._surplusText)
  item._surplusText = n ? formatNumber(n) : ''
}

function payload(item) {
  return {
    treaty_type: item.treaty_type,
    quota_share: parseInt(item._quotaShareText || 0, 10),
    surplus: parseNumber(item._surplusText),
  }
}

async function save(item, type) {
  const idKey = type === 'reassurance' ? 'reassurance_treaty_id' : 'retrosesi_treaty_id'
  const treatyId = item[idKey]
  savingKey.value = `${type}:${treatyId}`
  try {
    const res = type === 'reassurance'
      ? await updateFacultativeReassurance(treatyId, payload(item))
      : await updateFacultativeRetrosesi(treatyId, payload(item))
    if (res.data?.status === 200) {
      window.Swal.fire({ icon: 'success', title: 'Berhasil!', padding: '2em' })
    } else {
      window.Swal.fire({ icon: 'error', text: 'Terjadi Kesalahan', padding: '1em' })
    }
  } catch {
    window.Swal.fire({ icon: 'error', title: 'Terjadi Kesalahan', padding: '2em' })
  } finally {
    savingKey.value = ''
  }
}
</script>

<template>
  <DetailTabsLayout :tabs="penutupanDetailTabs" :id="id" title="Detail Penutupan" :back="{ name: 'list-data-pengajuan-non-medis' }">
    <div v-if="loading" class="flex justify-center py-16 text-slate-400">
      <Spinner size="lg" />
    </div>

    <div v-else class="space-y-5">
      <Card title="Reasuransi">
        <EmptyState v-if="!reassurances.length" message="Tidak ada data reasuransi fakultatif" />
        <div v-else class="space-y-4">
          <div v-for="item in reassurances" :key="item.reassurance_treaty_id" class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 class="font-semibold text-slate-800 dark:text-slate-100">{{ item.reassurance_name || item.company_name || 'Reasuransi' }}</h4>
                <p class="text-sm text-slate-500">Treaty ID: {{ item.reassurance_treaty_id }}</p>
              </div>
              <p class="text-sm text-slate-500">Surplus saat ini: {{ rupiah(item.surplus) }}</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <BaseSelect v-model="item.treaty_type" :options="treatyTypes" label="Treaty Type" placeholder="Pilih Treaty" />
              <div>
                <label class="form-label">Quota Share (%)</label>
                <input v-model="item._quotaShareText" class="form-input" inputmode="numeric" @input="item._quotaShareText = String(item._quotaShareText).replace(/\\D/g, '')" />
              </div>
              <div>
                <label class="form-label">Surplus</label>
                <input v-model="item._surplusText" class="form-input" @input="normalizeSurplus(item)" />
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <BaseButton :loading="savingKey === `reassurance:${item.reassurance_treaty_id}`" @click="save(item, 'reassurance')">Simpan Reasuransi</BaseButton>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Retrosesi">
        <EmptyState v-if="!retrocessions.length" message="Tidak ada data retrosesi fakultatif" />
        <div v-else class="space-y-4">
          <div v-for="item in retrocessions" :key="item.retrosesi_treaty_id" class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 class="font-semibold text-slate-800 dark:text-slate-100">{{ item.retrosesi_name || item.company_name || 'Retrosesi' }}</h4>
                <p class="text-sm text-slate-500">Treaty ID: {{ item.retrosesi_treaty_id }}</p>
              </div>
              <p class="text-sm text-slate-500">Surplus saat ini: {{ rupiah(item.surplus) }}</p>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <BaseSelect v-model="item.treaty_type" :options="treatyTypes" label="Treaty Type" placeholder="Pilih Treaty" />
              <div>
                <label class="form-label">Quota Share (%)</label>
                <input v-model="item._quotaShareText" class="form-input" inputmode="numeric" @input="item._quotaShareText = String(item._quotaShareText).replace(/\\D/g, '')" />
              </div>
              <div>
                <label class="form-label">Surplus</label>
                <input v-model="item._surplusText" class="form-input" @input="normalizeSurplus(item)" />
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <BaseButton :loading="savingKey === `retrosesi:${item.retrosesi_treaty_id}`" @click="save(item, 'retrosesi')">Simpan Retrosesi</BaseButton>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </DetailTabsLayout>
</template>
