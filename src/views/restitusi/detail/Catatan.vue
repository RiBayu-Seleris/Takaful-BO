<script setup>
/**
 * DETAIL RESTITUSI — TAB CATATAN.
 * Menampilkan riwayat aktivitas (restitute/history/{id}) + dokumen wajib
 * (restitute/required-document/{id}).
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getRestituteHistory, getRestituteRequiredDocuments } from '@/lib/services/restitute'
import { restitusiDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import HistoryTimeline from '@/components/shared/HistoryTimeline.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Restitusi — Catatan' })

const route = useRoute()
const id = route.params.id
const histories = ref([])
const documents = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    // Ambil dua data sekaligus supaya lebih cepat.
    const [h, d] = await Promise.all([
      getRestituteHistory(id),
      getRestituteRequiredDocuments(id),
    ])
    histories.value = h
    documents.value = d
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <DetailTabsLayout :tabs="restitusiDetailTabs" :id="id" title="Detail Restitusi" :back="{ name: 'list-restitusi' }">
    <div v-if="loading" class="flex justify-center py-16 text-slate-400">
      <Spinner size="lg" />
    </div>
    <HistoryTimeline v-else :histories="histories" :documents="documents" />
  </DetailTabsLayout>
</template>
