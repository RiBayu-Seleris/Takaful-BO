<script setup>
/**
 * KERANGKA HALAMAN DETAIL (dengan tab).
 *
 * Halaman detail sebuah record (mis. detail restitusi/klaim) terdiri dari beberapa
 * tab: Data Debitur, Data Asuransi, Dokumen, SLA, dst. Tiap tab adalah route
 * terpisah yang berbagi `id` yang sama. Komponen ini menyediakan:
 *   - tombol kembali
 *   - baris tab (router-link ke tiap tab, membawa param id yang sama)
 *   - area konten (lewat <slot />)
 *
 * Pemakaian:
 *   <DetailTabsLayout :tabs="tabs" :id="id" title="Detail Restitusi" :back="{ name: 'list-restitusi' }">
 *     ...isi tab aktif...
 *   </DetailTabsLayout>
 */
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

defineProps({
  // [{ label: 'Data Debitur', route: 'detail-restitusi-data-debitur' }, ...]
  tabs: { type: Array, required: true },
  // id record yang sedang dibuka (diteruskan ke tiap tab).
  id: { type: [String, Number], required: true },
  title: { type: String, default: 'Detail' },
  // tujuan tombol kembali, mis. { name: 'list-restitusi' }
  back: { type: Object, default: null },
})

const router = useRouter()
</script>

<template>
  <div>
    <!-- Header: kembali + judul -->
    <div class="mb-4 flex items-center gap-3">
      <button
        v-if="back"
        class="btn-icon btn-secondary"
        title="Kembali"
        @click="router.push(back)"
      >
        <ArrowLeft class="h-5 w-5" />
      </button>
      <h1 class="page-title">{{ title }}</h1>
    </div>

    <!-- Tab -->
    <div class="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-px dark:border-slate-700/60">
      <router-link
        v-for="tab in tabs"
        :key="tab.route"
        :to="{ name: tab.route, params: { id } }"
        class="rounded-t-md px-3 py-2 text-[13px] font-medium transition-colors"
        :class="
          $route.name === tab.route
            ? 'border-b-2 border-primary-600 text-primary-700 dark:text-primary-300'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
        "
      >
        {{ tab.label }}
      </router-link>
    </div>

    <!-- Konten tab aktif -->
    <slot />
  </div>
</template>
