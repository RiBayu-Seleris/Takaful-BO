<script setup>
/**
 * DETAIL PENUTUPAN — SLA.
 * Endpoint sumber: submission/sla/{id}.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSubmissionSla } from '@/lib/services/submission'
import { penutupanDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import SlaTable from '@/components/shared/SlaTable.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Penutupan — SLA' })

const route = useRoute()
const id = route.params.id
const stages = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    stages.value = await getSubmissionSla(id)
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
    <SlaTable v-else :stages="stages" />
  </DetailTabsLayout>
</template>
