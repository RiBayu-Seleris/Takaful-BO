# Panduan Kode — Takaful Backoffice v1

Dokumen ini wajib dibaca sebelum menambah/mengubah kode. Ditulis agar **developer
junior (< 6 bulan) maupun senior** sama-sama nyaman merawat proyek ini.

---

## 1. Prinsip Utama

1. **Satu file, satu tanggung jawab.** Jangan campur logika API, tampilan, dan state
   dalam satu tempat kalau bisa dipisah.
2. **Konsisten > pintar.** Ikuti pola yang sudah ada. Jangan buat gaya baru sendiri.
3. **Beri komentar "kenapa", bukan "apa".** Kode yang jelas tidak perlu dijelaskan
   baris per baris, tapi keputusan yang tidak jelas WAJIB diberi alasan.
4. **Bahasa komentar: Indonesia.** Supaya seluruh tim paham.

## 2. Struktur Folder

```
src/
  assets/css/     Style global + design tokens Tailwind
  lib/            Utilitas murni JS (api, auth, format, sanitasi) — TANPA komponen
  stores/         Pinia store (state global): auth, ui
  i18n/           Teks/locale (Bahasa Indonesia)
  router/         Definisi route + penjaga (guard) akses
  config/         Konfigurasi data (mis. struktur menu)
  composables/    Fungsi reusable berbasis Composition API (useXxx)
  layouts/        Kerangka halaman (AppLayout, AuthLayout)
  components/
    layout/       Navbar, Sidebar, RightPanel, Footer
    ui/           Komponen UI reusable (Button, Card, DataTable, dst.)
  views/          Halaman per modul (dashboard, klaim, restitusi, ...)
```

**Aturan impor:** gunakan alias `@/` untuk root `src` (mis. `import api from '@/lib/api'`).

## 3. Konvensi Penamaan

| Item                | Gaya            | Contoh                       |
| ------------------- | --------------- | ---------------------------- |
| Komponen `.vue`     | PascalCase      | `DataTable.vue`              |
| File util/store     | camelCase       | `menuFlags.js`, `auth.js`    |
| Variabel & fungsi   | camelCase       | `formatNumber`, `isLoggedIn` |
| Konstanta global    | UPPER_SNAKE     | `EHD_PARTNERS`               |
| Nama route          | kebab-case      | `list-restitusi`             |

## 4. Memanggil API (WAJIB lewat `@/lib/api`)

Jangan pernah `import axios` langsung di komponen. Selalu pakai instance terpusat:

```js
import api from '@/lib/api'

// Token Bearer & base URL sudah otomatis. Cukup tulis endpoint-nya.
const { data } = await api.get('restitute/history/' + id)
```

Alasan: token, base URL, dan penanganan error 401 diatur di satu tempat.
**Endpoint & payload harus SAMA PERSIS dengan ehd-backoffice** (kontrak API tidak berubah).

## 5. Keamanan Frontend (WAJIB)

1. **Jangan `v-html` dengan data dari server/user.** Kalau terpaksa, sanitasi dulu
   lewat `@/lib/sanitize`. Ini mencegah serangan XSS.
2. **Jangan menaruh rahasia di kode.** URL API lewat `.env` (`VITE_API_URL`).
3. **Jangan `console.log` data sensitif** (token, data nasabah) di produksi.
4. **Semua halaman butuh login** kecuali yang ditandai `meta.public`. Diatur oleh
   guard di `router/index.js`.
5. **Akses per role** dicek lewat flag menu (`@/lib/menuFlags`). Ingat: pembatasan di
   frontend hanya untuk UX — **backend tetap wajib memvalidasi** setiap request.
6. **Link eksternal** wajib `target="_blank" rel="noopener noreferrer"`.
7. **Validasi input** sebelum dikirim (mis. tidak kosong, format benar).

## 6. Styling

- **Full Tailwind.** Utamakan kelas komponen reusable di `assets/css/main.css`
  (mis. `.btn-primary`, `.card`, `.form-input`, `.table`) supaya konsisten.
- Dark mode otomatis via kelas `dark` di `<html>` (diatur `stores/ui.js`).
- Hindari style inline & `!important`.

## 7. Sebelum Commit

- Jalankan `npm run lint` dan `npm run format`.
- Pastikan tidak ada `console.log` sisa debugging.
- Pastikan tidak ada endpoint API yang di-hardcode di komponen.
