<script setup>
/**
 * DETAIL PENUTUPAN — DOKUMEN MEDIS TAMBAHAN.
 * Endpoint sumber:
 * - submission/document/{id}
 * - submission/document/upload
 * - submission/document/medis/{documentId}
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSession } from '@/lib/auth'
import {
  deleteSubmissionMedicalDocument,
  getSubmissionRequiredDocuments,
  submissionMedicalDocumentsFetcher,
  uploadSubmissionMedicalDocument,
} from '@/lib/services/submission'
import { uploadFile } from '@/lib/services/upload'
import { penutupanDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import DocumentTab from '@/components/shared/DocumentTab.vue'

useMeta({ title: 'Detail Penutupan — Dokumen Medis Tambahan' })

const route = useRoute()
const session = getSession()
const id = route.params.id
const requiredDocuments = ref([])
const listFetcher = submissionMedicalDocumentsFetcher(id)

onMounted(async () => {
  requiredDocuments.value = await getSubmissionRequiredDocuments(id)
})

async function submitUpload({ file, documentType, documentName, description }) {
  const path = await uploadFile(file)
  return uploadSubmissionMedicalDocument({
    id,
    userId: session.userId,
    documentType,
    documentName,
    description,
    path,
  })
}
</script>

<template>
  <DetailTabsLayout :tabs="penutupanDetailTabs" :id="id" title="Detail Penutupan" :back="{ name: 'list-data-pengajuan-non-medis' }">
    <DocumentTab
      :list-fetcher="listFetcher"
      :document-types="['Medis', 'Pelengkap', 'Lainnya']"
      :required-documents="requiredDocuments"
      :submit-upload="submitUpload"
      :delete-fn="deleteSubmissionMedicalDocument"
    />
  </DetailTabsLayout>
</template>
