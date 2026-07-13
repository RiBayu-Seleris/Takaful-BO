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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { getSession } from '@/lib/auth'

const props = defineProps({
  // [{ label: 'Data Debitur', route: 'detail-restitusi-data-debitur' }, ...]
  tabs: { type: Array, required: true },
  // id record yang sedang dibuka (diteruskan ke tiap tab).
  id: { type: [String, Number], required: true },
  title: { type: String, default: 'Detail' },
  // tujuan tombol kembali, mis. { name: 'list-restitusi' }
  back: { type: Object, default: null },
  tabContext: { type: Object, default: () => ({}) },
})

const router = useRouter()
const tabScroller = ref(null)

const fallbackTabContext = computed(() => {
  const role = getSession().role
  return {
    showDokumenSpajkPage: true,
    showMenuForBank: !['Bank', 'Branch Bank'].includes(role),
    showMenuForAdmin: role === 'Admin',
  }
})
const resolvedTabContext = computed(() => ({ ...fallbackTabContext.value, ...props.tabContext }))

const visibleTabs = computed(() => props.tabs.filter((tab) => {
  if (tab.visible === false) return false
  if (typeof tab.visible === 'string') {
    return !!resolvedTabContext.value[tab.visible]
  }
  if (typeof tab.visible === 'function') return tab.visible(resolvedTabContext.value)
  return true
}))

function scrollTabs(direction) {
  tabScroller.value?.scrollBy({ left: direction * 240, behavior: 'smooth' })
}

function onTabWheel(event) {
  if (!tabScroller.value) return
  if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
  event.preventDefault()
  tabScroller.value.scrollLeft += event.deltaX
}
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
    <div class="mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-700/60">
      <button type="button" class="detail-tab-arrow" aria-label="Geser tab ke kiri" @click="scrollTabs(-1)">
        <ChevronLeft class="h-4 w-4" />
      </button>
      <div
        ref="tabScroller"
        class="detail-tab-scroll"
        @wheel="onTabWheel"
      >
        <router-link
          v-for="tab in visibleTabs"
          :key="tab.route"
          :to="{ name: tab.route, params: { id } }"
          class="detail-tab-link"
          :class="
            $route.name === tab.route
              ? 'bg-primary-600 text-white shadow-sm dark:bg-primary-500'
              : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100'
          "
        >
          {{ tab.label }}
        </router-link>
      </div>
      <button type="button" class="detail-tab-arrow" aria-label="Geser tab ke kanan" @click="scrollTabs(1)">
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <!-- Konten tab aktif -->
    <slot />
  </div>
</template>

<style scoped>
.detail-tab-scroll {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  gap: 0.5rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.detail-tab-scroll::-webkit-scrollbar {
  display: none;
}

.detail-tab-link {
  display: inline-flex;
  min-height: 2.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.25rem;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.detail-tab-arrow {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid rgb(226 232 240);
  background: #ffffff;
  color: rgb(100 116 139);
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.detail-tab-arrow:hover {
  border-color: rgb(203 213 225);
  background: rgb(248 250 252);
  color: rgb(15 23 42);
}

:global(.dark) .detail-tab-arrow {
  border-color: rgb(30 41 59);
  background: rgb(15 23 42);
  color: rgb(148 163 184);
}

:global(.dark) .detail-tab-arrow:hover {
  background: rgb(30 41 59);
  color: rgb(241 245 249);
}
</style>
