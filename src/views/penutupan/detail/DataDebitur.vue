<script setup>
/**
 * DETAIL PENUTUPAN — DATA DEBITUR.
 * Endpoint sumber: submission/detail/{id}.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSubmissionDebitur } from '@/lib/services/submission'
import { penutupanDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import DebiturProfile from '@/components/shared/DebiturProfile.vue'
import Card from '@/components/ui/Card.vue'
import InfoField from '@/components/ui/InfoField.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Penutupan — Data Debitur' })

const route = useRoute()
const id = route.params.id
const data = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = await getSubmissionDebitur(id)
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
    <div v-else class="space-y-5">
      <DebiturProfile :data="data" :status-value="data.acceptance_status" :show-email="false" />

      <Card title="Informasi Tambahan">
        <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="No. Rekening Pinjaman" :value="data.account_number" />
          <InfoField label="Extra Premium Rate" :value="data.extra_premium_rate" />
          <InfoField label="Monthly Payment" :value="data.monthly_payment" />
          <InfoField label="Broker ID" :value="data.broker_id" />
          <InfoField label="Keputusan Asuransi" :value="data.insurance_decision" />
          <InfoField label="Certificate Path" :value="data.certificate_path" />
        </dl>
      </Card>
    </div>
  </DetailTabsLayout>
</template>
