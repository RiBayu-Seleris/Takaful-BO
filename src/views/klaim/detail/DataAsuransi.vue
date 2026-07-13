<script setup>
/**
 * DETAIL KLAIM — TAB DATA ASURANSI.
 * Data dari claim/detail-insurance/{id}. Field inti via AsuransiInfo,
 * ditambah info kejadian klaim.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClaimInsurance } from '@/lib/services/claim'
import { klaimDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import AsuransiInfo from '@/components/shared/AsuransiInfo.vue'
import Card from '@/components/ui/Card.vue'
import InfoField from '@/components/ui/InfoField.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Klaim — Data Asuransi' })

const route = useRoute()
const id = route.params.id
const data = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = await getClaimInsurance(id)
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
    <AsuransiInfo v-else :data="data">
      <template #extra>
        <Card title="Info Kejadian">
          <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoField label="Jenis Klaim" :value="data.claim_type" />
            <InfoField label="Tanggal Kejadian" :value="data.date_incident" />
            <InfoField label="Tempat Kejadian" :value="data.place_incident" />
            <InfoField label="Alasan Klaim" :value="data.claim_reasoning" />
          </dl>
        </Card>
      </template>
    </AsuransiInfo>
  </DetailTabsLayout>
</template>
