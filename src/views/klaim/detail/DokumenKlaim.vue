<script setup>
/**
 * DETAIL KLAIM — TAB DOKUMEN.
 * List + unggah + unduh + hapus dokumen klaim (via DocumentTab).
 * Role Reassurance/Retrosesi hanya boleh mengunduh.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  claimDocumentsFetcher,
  getClaimRequiredDocuments,
  uploadClaimDocument,
  deleteClaimDocument,
} from '@/lib/services/claim'
import { uploadFile } from '@/lib/services/upload'
import { getSession } from '@/lib/auth'
import { klaimDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import DocumentTab from '@/components/shared/DocumentTab.vue'

useMeta({ title: 'Detail Klaim — Dokumen' })

const route = useRoute()
const id = route.params.id
const session = getSession()

const requiredDocuments = ref([])
const listFetcher = claimDocumentsFetcher(id)
const documentTypes = ['Klaim', 'Pelengkap', 'Lainnya']
const canManage = !['Reassurance', 'Retrosesi'].includes(session.role)

onMounted(async () => {
  requiredDocuments.value = await getClaimRequiredDocuments(id)
})

async function submitUpload({ file, documentType, documentName, description }) {
  const path = await uploadFile(file)
  return uploadClaimDocument({ id, documentType, documentName, description, path })
}
</script>

<template>
  <DetailTabsLayout :tabs="klaimDetailTabs" :id="id" title="Detail Klaim" :back="{ name: 'list-klaim-register' }">
    <DocumentTab
      :list-fetcher="listFetcher"
      :document-types="documentTypes"
      :required-documents="requiredDocuments"
      :can-manage="canManage"
      :submit-upload="submitUpload"
      :delete-fn="deleteClaimDocument"
    />
  </DetailTabsLayout>
</template>
