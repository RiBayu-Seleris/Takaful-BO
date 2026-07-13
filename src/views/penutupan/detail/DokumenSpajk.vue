<script setup>
/**
 * DETAIL PENUTUPAN — DOKUMEN SPAJK.
 * Endpoint sumber:
 * - submission/document/spajk/{id}
 * - submission/document/spajk/upload
 * - submission/required-document/{id}
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getSubmissionRequiredDocuments,
  submissionSpajkDocumentsFetcher,
  uploadSubmissionSpajkDocument,
} from '@/lib/services/submission'
import { uploadFile } from '@/lib/services/upload'
import { penutupanDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import DocumentTab from '@/components/shared/DocumentTab.vue'

useMeta({ title: 'Detail Penutupan — Dokumen SPAJK' })

const route = useRoute()
const id = route.params.id
const requiredDocuments = ref([])
const listFetcher = submissionSpajkDocumentsFetcher(id)

onMounted(async () => {
  requiredDocuments.value = await getSubmissionRequiredDocuments(id)
})

async function submitUpload({ file, documentType, documentName, description }) {
  const path = await uploadFile(file)
  return uploadSubmissionSpajkDocument({ id, documentType, documentName, description, path })
}
</script>

<template>
  <DetailTabsLayout :tabs="penutupanDetailTabs" :id="id" title="Detail Penutupan" :back="{ name: 'list-data-pengajuan-non-medis' }">
    <DocumentTab
      :list-fetcher="listFetcher"
      :document-types="['SPAJK', 'KTP']"
      :required-documents="requiredDocuments"
      :submit-upload="submitUpload"
      :delete-fn="async () => null"
      :allow-delete="false"
    />
  </DetailTabsLayout>
</template>
