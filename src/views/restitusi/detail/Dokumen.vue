<script setup>
/**
 * DETAIL RESTITUSI — TAB DOKUMEN.
 * List + unggah + unduh + hapus dokumen restitusi (via DocumentTab).
 * Role Reassurance/Retrosesi hanya boleh mengunduh (tidak mengelola).
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  restituteDocumentsFetcher,
  getRestituteRequiredDocuments,
  uploadRestituteDocument,
  deleteRestituteDocument,
} from '@/lib/services/restitute'
import { uploadFile } from '@/lib/services/upload'
import { getSession } from '@/lib/auth'
import { restitusiDetailTabs } from '@/config/detailTabs'
import { useMeta } from '@/composables/useMeta'
import DetailTabsLayout from '@/components/layout/DetailTabsLayout.vue'
import DocumentTab from '@/components/shared/DocumentTab.vue'

useMeta({ title: 'Detail Restitusi — Dokumen' })

const route = useRoute()
const id = route.params.id
const session = getSession()

const requiredDocuments = ref([])
const listFetcher = restituteDocumentsFetcher(id)
const documentTypes = ['Restitusi', 'Pelengkap', 'Lainnya']
// Reassurance & Retrosesi hanya boleh melihat/mengunduh.
const canManage = !['Reassurance', 'Retrosesi'].includes(session.role)

onMounted(async () => {
  requiredDocuments.value = await getRestituteRequiredDocuments(id)
})

// Unggah dua langkah: kirim berkas -> daftarkan dokumennya.
async function submitUpload({ file, documentType, documentName, description }) {
  const path = await uploadFile(file)
  return uploadRestituteDocument({ id, documentType, documentName, description, path })
}
</script>

<template>
  <DetailTabsLayout :tabs="restitusiDetailTabs" :id="id" title="Detail Restitusi" :back="{ name: 'list-restitusi' }">
    <DocumentTab
      :list-fetcher="listFetcher"
      :document-types="documentTypes"
      :required-documents="requiredDocuments"
      :can-manage="canManage"
      :submit-upload="submitUpload"
      :delete-fn="deleteRestituteDocument"
    />
  </DetailTabsLayout>
</template>
