import api from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { getSession } from '@/lib/auth'
import { roleScopeParams } from './scope'

/**
 * SERVICE PENGAJUAN (submission) — endpoint submission/list.
 *
 * Banyak halaman memakai endpoint yang sama dengan hanya beda "filter tetap"
 * (mis. Input Restitusi -> acceptance=accepted&payment=paid&active_insurance=true;
 * List Pengajuan Pending -> acceptance=pending; dst). Karena itu dibuat satu
 * pembuat fetcher yang menerima parameter tetap tersebut.
 */

/**
 * Buat fetcher DataTable (mode server) untuk endpoint submission/list.
 * @param {object} fixedParams filter tetap, mis. { acceptance:'accepted', payment:'paid' }
 * @returns {(p:object) => Promise<{rows:any[], total:number}>}
 */
export function submissionListFetcher(fixedParams = {}) {
  return async ({ start, length, search }) => {
    const auth = useAuthStore()
    const session = getSession()
    const user = auth.user || (await auth.fetchUser())

    const params = {
      ...fixedParams,
      ...roleScopeParams(user, session.partnerId),
      start,
      length,
      search,
      draw: 1,
    }

    const { data } = await api.get('submission/list', { params })
    return {
      rows: data?.data || [],
      total: data?.recordsFiltered ?? data?.recordsTotal ?? (data?.data?.length || 0),
    }
  }
}

/** Konfirmasi pendebitan untuk beberapa pengajuan (List Debit Note). */
export function confirmSubmissionDebet(submissionIds = []) {
  return api.post('submission/debet/confirmed', {
    submission_id: submissionIds.map((id) => Number(id)),
  })
}

/**
 * Fetcher untuk Logs H2H Penutupan.
 * Endpoint sumber: submission/h2h/list.
 */
export function h2hLogsFetcher(fixedParams = {}) {
  return async ({ start, length, search }) => {
    const auth = useAuthStore()
    const user = auth.user || (await auth.fetchUser())
    const params = {
      ...fixedParams,
      start,
      length,
      search,
      draw: 1,
    }
    if (user?.insurance_company_id) params.insurance_company_id = user.insurance_company_id

    const { data } = await api.get('submission/h2h/list', { params })
    return {
      rows: data?.data || [],
      total: data?.recordsFiltered ?? data?.recordsTotal ?? (data?.data?.length || 0),
    }
  }
}

export async function getSubmissionDebitur(id) {
  const { data } = await api.get('submission/detail/' + id)
  return data?.data || {}
}

export async function getSubmissionInsurance(id) {
  const { data } = await api.get('submission/detail-insurance/' + id)
  return data?.data || {}
}

export async function getSubmissionSla(id) {
  const { data } = await api.get('submission/sla/' + id)
  return data?.data || []
}

export async function getSubmissionHistory(id) {
  const { data } = await api.get('submission/history/' + id)
  return data?.data || []
}

export async function getSubmissionRequiredDocuments(id) {
  const { data } = await api.get('submission/required-document/' + id)
  return data?.data || []
}

export async function getSubmissionPartners() {
  const { data } = await api.get('submission/all-partner')
  return data?.data || []
}

export async function checkLifinsNik(idCardNumber) {
  const { data } = await api.get('submission/check-lifins/' + idCardNumber)
  return data
}

export async function getSubmissionMembersByPartner(partnerId) {
  const { data } = await api.get('submission/member-by-partner/' + partnerId)
  return data?.data || []
}

export async function getSubmissionProducts(partnerId, productType, withoutUnderwriting = false) {
  const base = productType === 'Produk Non PAB' ? 'submission/select-product-non-pab/' : 'submission/select-product/'
  const suffix = withoutUnderwriting ? '?underwriting=false' : ''
  const { data } = await api.get(base + partnerId + suffix)
  return data?.data || []
}

export async function getSubmissionInsurances(productId) {
  const { data } = await api.get('submission/select-insurance/' + productId)
  return data?.data || []
}

export async function getSubmissionBrokers(insuranceId) {
  const { data } = await api.get('submission/select-broker/' + insuranceId)
  const brokers = data?.data || []
  return [
    ...brokers,
    { broker_id: 0, broker_code: '', broker_name: 'Tanpa Broker' },
  ]
}

export function previewSubmissionPremium(payload) {
  return api.post('submission/preview-premium', payload)
}

export function storeSubmission(payload) {
  return api.post('submission/store/new', payload)
}

export function submissionSpajkDocumentsFetcher(submissionId) {
  return async ({ start, length, search }) => {
    const params = { start, length, search, draw: 1 }
    const { data } = await api.get('submission/document/spajk/' + submissionId, { params })
    return {
      rows: data?.data || [],
      total: data?.recordsFiltered ?? data?.recordsTotal ?? (data?.data?.length || 0),
    }
  }
}

export async function uploadSubmissionSpajkDocument({ id, documentType, documentName, description, path }) {
  const { data } = await api.post('submission/document/spajk/upload', {
    submission_id: parseInt(id, 10),
    document_type: documentType,
    document_name: documentName,
    description,
    document_url: path,
  })
  return data.status === 200
}

export function submissionMedicalDocumentsFetcher(submissionId) {
  return async ({ start, length, search }) => {
    const params = { start, length, search, draw: 1 }
    const { data } = await api.get('submission/document/' + submissionId, { params })
    return {
      rows: data?.data || [],
      total: data?.recordsFiltered ?? data?.recordsTotal ?? (data?.data?.length || 0),
    }
  }
}

export async function uploadSubmissionMedicalDocument({ id, userId, documentType, documentName, description, path }) {
  const { data } = await api.post('submission/document/upload', {
    submission_id: parseInt(id, 10),
    document_type: documentType,
    document_name: documentName,
    description,
    document_url: path,
    user_id: parseInt(userId, 10),
  })
  return data.status === 200
}

export function deleteSubmissionMedicalDocument(documentId) {
  return api.delete('submission/document/medis/' + documentId)
}

export function submissionEmEpDocumentsFetcher(submissionId) {
  return async ({ start, length, search }) => {
    const params = { start, length, search, draw: 1 }
    const { data } = await api.get('submission/document/em-ep/' + submissionId, { params })
    return {
      rows: data?.data || [],
      total: data?.recordsFiltered ?? data?.recordsTotal ?? (data?.data?.length || 0),
    }
  }
}

export async function uploadSubmissionEmEpDocument({ id, documentType, documentName, description, path }) {
  const { data } = await api.post('submission/document/em-ep/upload', {
    submission_id: parseInt(id, 10),
    document_type: documentType,
    document_name: documentName,
    description,
    document_url: path,
  })
  return data.status === 200
}

export function storeSubmissionEmEp(payload) {
  return api.post('submission/em-ep/store', payload)
}

export async function getTopupInsurances() {
  const { data } = await api.get('submission/top-up/select-insurance')
  return data?.data || []
}

export function storeSubmissionTopup(payload) {
  return api.post('submission/top-up', payload)
}

export async function getDiversifiedClientRisk(id) {
  const { data } = await api.get('submission/diversified-client-risk/' + id)
  return data?.data || {}
}

export async function getSubmissionFacultative(id) {
  const { data } = await api.get('submission/facultative/' + id)
  return data?.data || { reassurance: [], retrosesi: [] }
}

export function updateFacultativeReassurance(treatyId, payload) {
  return api.put('submission/facultative/reassurance/' + treatyId, payload)
}

export function updateFacultativeRetrosesi(treatyId, payload) {
  return api.put('submission/facultative/retrosesi/' + treatyId, payload)
}

export function submissionIdCardHistoryFetcher(idCardNumber) {
  return async ({ start, length, search }) => {
    const params = { start, length, search, draw: 1 }
    const { data } = await api.get('submission/history/id-card/' + idCardNumber, { params })
    return {
      rows: data?.data || [],
      total: data?.recordsFiltered ?? data?.recordsTotal ?? (data?.data?.length || 0),
    }
  }
}

export function sendSubmissionMedicalNotification(id) {
  return api.get('notification/document/medis/' + id)
}

export async function getSubmissionRevisionField(id, fieldName) {
  const { data } = await api.get('submission/revision-data/' + id, {
    params: { field_name: fieldName },
  })
  return data?.data || {}
}

export function updateSubmissionRevision(id, payload) {
  return api.put('submission/revision-data/' + id, payload)
}

export function submissionRevisionHistoryFetcher(id) {
  return async ({ start, length, search }) => {
    const params = { start, length, search, draw: 1 }
    const { data } = await api.get('submission/revision-data/history/' + id, { params })
    return {
      rows: data?.data || [],
      total: data?.recordsFiltered ?? data?.recordsTotal ?? (data?.data?.length || 0),
    }
  }
}
