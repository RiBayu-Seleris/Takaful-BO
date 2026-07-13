<script setup>
/**
 * DETAIL KLAIM — TAB CATATAN BANK.
 * Menampilkan riwayat aktivitas (claim/history/{id}) + dokumen wajib
 * (claim/required-document/{id}).
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClaimHistory, getClaimRequiredDocuments } from '@/lib/services/claim'
import { klaimDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import HistoryTimeline from '@/components/shared/HistoryTimeline.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Klaim — Catatan Bank' })

const route = useRoute()
const id = route.params.id
const histories = ref([])
const documents = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [h, d] = await Promise.all([
      getClaimHistory(id),
      getClaimRequiredDocuments(id),
    ])
    histories.value = h
    documents.value = d
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <DetailTabsLayout :tabs="klaimDetailTabs" :id="id" title="Detail Klaim" :back="{ name: 'list-klaim-register' }">
    <div v-if="loading" class="flex justify-center py-16 text-slate-400">
      <Spinner size="lg" />
    </div>
    <HistoryTimeline v-else :histories="histories" :documents="documents" />
  </DetailTabsLayout>
</template>
