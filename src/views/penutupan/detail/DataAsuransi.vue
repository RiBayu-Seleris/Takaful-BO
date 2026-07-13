<script setup>
/**
 * DETAIL PENUTUPAN — DATA ASURANSI.
 * Endpoint sumber: submission/detail-insurance/{id}.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSubmissionInsurance } from '@/lib/services/submission'
import { penutupanDetailTabs } from '@/config/detailTabs'
import { rupiah } from '@/lib/format'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import Card from '@/components/ui/Card.vue'
import InfoField from '@/components/ui/InfoField.vue'
import Spinner from '@/components/ui/Spinner.vue'

useMeta({ title: 'Detail Penutupan — Data Asuransi' })

const route = useRoute()
const id = route.params.id
const data = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = await getSubmissionInsurance(id)
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
      <Card title="Data Pengajuan">
        <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="No. Pengajuan Kredit" :value="data.submission_number" />
          <InfoField label="Kode Unik e-HD" :value="data.ehd_number" />
          <InfoField label="Kode Unik Broker" :value="data.submission_unique_code" />
          <InfoField label="No. Akad" :value="data.contract_number" />
          <InfoField label="No. Sertifikat" :value="data.certificate_number" />
          <InfoField label="Status Acceptance" :value="data.acceptance_status" />
          <InfoField label="Status Pengajuan" :value="data.submission_status" />
        </dl>
      </Card>

      <Card title="Bank, Broker, dan Asuransi">
        <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Partner" :value="data.partner_name" />
          <InfoField label="Cabang" :value="data.member_name" />
          <InfoField label="Broker" :value="data.broker_name" />
          <InfoField label="Asuransi" :value="data.insurance_name" />
          <InfoField label="Produk" :value="data.product_name" />
        </dl>
      </Card>

      <Card title="Periode dan Premi">
        <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Tanggal Pengajuan" :value="data.submission_date" />
          <InfoField label="Mulai Asuransi" :value="data.start_date" />
          <InfoField label="Akhir Asuransi" :value="data.end_date" />
          <InfoField label="Masa Asuransi" :value="data.insurance_period ? `${data.insurance_period} Bulan` : ''" />
          <InfoField label="Rate Premi" :value="data.premium_rate" />
          <InfoField label="EM/EP" :value="data.extra_premium_rate" />
          <InfoField label="CBC Rate" :value="data.cbc_rate" />
          <InfoField label="Plafond" :value="rupiah(data.plafond)" />
        </dl>
      </Card>

      <Card title="PIC">
        <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField label="Nama PIC" :value="data.pic_name" />
          <InfoField label="Email PIC" :value="data.pic_email" />
          <InfoField label="No. HP PIC" :value="data.pic_phone" />
          <InfoField label="PPAJK Number" :value="data.ppajk_number" />
        </dl>
      </Card>
    </div>
  </DetailTabsLayout>
</template>
