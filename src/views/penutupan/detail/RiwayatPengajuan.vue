<script setup>
/**
 * DETAIL PENUTUPAN — RIWAYAT PENGAJUAN.
 * Endpoint sumber: submission/history/{id} dan submission/required-document/{id}.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSubmissionHistory, getSubmissionRequiredDocuments } from '@/lib/services/submission'
import { penutupanDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import HistoryTimeline from '@/components/shared/HistoryTimeline.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Penutupan — Riwayat Pengajuan' })

const route = useRoute()
const id = route.params.id
const histories = ref([])
const documents = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [h, d] = await Promise.all([
      getSubmissionHistory(id),
      getSubmissionRequiredDocuments(id),
    ])
    histories.value = h
    documents.value = d
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <DetailTabsLayout :tabs="penutupanDetailTabs" :id="id" title="Detail Penutupan" :back="{ name: 'list-data-pengajuan-non-medis' }">
    <div v-if="loading" class="flex justify-center py-16 text-slate-400">
      <Spinner size="lg" />
    </div>
    <HistoryTimeline v-else :histories="histories" :documents="documents" />
  </DetailTabsLayout>
</template>
