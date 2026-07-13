<script setup>
/**
 * DETAIL KLAIM — TAB SLA.
 * Menampilkan tahapan SLA dari claim/sla/{id}.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClaimSla } from '@/lib/services/claim'
import { klaimDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import SlaTable from '@/components/shared/SlaTable.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Klaim — SLA' })

const route = useRoute()
const id = route.params.id
const stages = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    stages.value = await getClaimSla(id)
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
    <SlaTable v-else :stages="stages" />
  </DetailTabsLayout>
</template>
