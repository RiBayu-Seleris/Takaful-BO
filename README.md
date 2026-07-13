# Takaful Backoffice v1

Re-arsitektur bersih dari `ehd-backoffice` (Laravel + Vue/VRISTO) menjadi SPA Vue 3 modern.

## Stack

- **Vue 3** (Composition API, `<script setup>`) — **JavaScript murni, tanpa TypeScript**
- **Vite** — build tool
- **Pinia** — state management (pengganti Vuex)
- **Vue Router 4** — routing + auth guard
- **Tailwind CSS** — full styling (pengganti Bootstrap/SASS/VRISTO), dark mode
- **vue-i18n** — Bahasa Indonesia (disiapkan untuk EN)
- **axios** — HTTP terpusat, base URL `VITE_API_URL`, interceptor Bearer token
- **ApexCharts**, **SweetAlert2** — chart & notifikasi

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5178
npm run build
```

## Konfigurasi

Salin `.env.example` → `.env`, sesuaikan `VITE_API_URL`. **Kontrak API identik** dengan
ehd-backoffice (endpoint & payload tidak diubah).

## Struktur

```
src/
  assets/css/       Tailwind base + design tokens
  lib/              api (axios), auth, format helpers
  stores/           Pinia (auth, ui)
  i18n/             lokalisasi (id)
  router/           routes (fitur nyata saja) + guards
  layouts/          AppLayout, AuthLayout
  components/
    layout/         Navbar, Sidebar, RightMenu, Footer
    ui/             UI kit reusable (Button, Card, DataTable, ...)
  views/            halaman per modul domain
```
