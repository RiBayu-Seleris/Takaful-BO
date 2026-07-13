<script setup>
/**
 * DETAIL RESTITUSI — TAB DATA ASURANSI.
 * Data dari restitute/detail-insurance/{id}. Field inti ditampilkan via AsuransiInfo,
 * ditambah info khusus restitusi (tanggal, status, sisa bulan).
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getRestituteInsurance } from '@/lib/services/restitute'
import { restitusiDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import AsuransiInfo from '@/components/shared/AsuransiInfo.vue'
import Card from '@/components/ui/Card.vue'
import InfoField from '@/components/ui/InfoField.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Restitusi — Data Asuransi' })

const route = useRoute()
const id = route.params.id
const data = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = await getRestituteInsurance(id)
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
    <AsuransiInfo v-else :data="data">
      <template #extra>
        <Card title="Info Restitusi">
          <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label="Tanggal Restitusi" :value="data.restitute_date" />
            <InfoField label="Status Restitusi" :value="data.restitute_status" />
            <InfoField label="Sisa Bulan" :value="data.month_remainder" />
          </dl>
        </Card>
      </template>
    </AsuransiInfo>
  </DetailTabsLayout>
</template>
