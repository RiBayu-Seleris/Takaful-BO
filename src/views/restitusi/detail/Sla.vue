<script setup>
/**
 * DETAIL RESTITUSI — TAB SLA.
 * Menampilkan tahapan SLA dari restitute/sla/{id}.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getRestituteSla } from '@/lib/services/restitute'
import { restitusiDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import SlaTable from '@/components/shared/SlaTable.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Restitusi — SLA' })

const route = useRoute()
const id = route.params.id
const stages = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    stages.value = await getRestituteSla(id)
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
    <SlaTable v-else :stages="stages" />
  </DetailTabsLayout>
</template>
