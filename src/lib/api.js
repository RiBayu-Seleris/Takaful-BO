import axios from 'axios'
import { getToken, clearSession } from './auth'

/**
 * Instance axios TERPUSAT.
 *
 * Kenapa terpusat? Supaya token, base URL, dan penanganan error diatur di SATU
 * tempat. Junior cukup panggil `api.get('endpoint')` tanpa memikirkan token.
 *
 * PENTING: base URL & endpoint SAMA PERSIS dengan ehd-backoffice (VITE_API_URL).
 * Kode lama menulis `config = { headers: { Authorization: 'Bearer ' + token } }`
 * di setiap panggilan — sekarang itu ditambahkan otomatis oleh interceptor.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Interceptor REQUEST: tempelkan token ke setiap request sebelum dikirim.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor RESPONSE: kalau server balas 401 (token kedaluwarsa/tidak valid),
// bersihkan sesi lalu paksa kembali ke halaman login. Ini pertahanan keamanan
// supaya sesi mati tidak bisa terus dipakai.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession()
      if (!window.location.pathname.includes('/sign-in')) {
        window.location.assign('/sign-in')
      }
    }
    return Promise.reject(error)
  },
)

export default api
