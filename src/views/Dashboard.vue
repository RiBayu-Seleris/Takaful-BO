<script setup>
/**
 * DASHBOARD utama (Home) — konten DISAMAKAN PERSIS dengan ehd-backoffice
 * `views/dashboard.vue` (endpoint GET dashboard/main):
 *
 *  1. Tombol "Filter" (dropdown: Cabang + Filter Waktu, pola sama dgn Profil Risiko).
 *  2. Dua kartu besar: Total Polis (Polis) & Total Debitur (Debitur).
 *  3. Total Premi & Total Uang Pertanggungan (IDR).
 *  4. Premi/UP per status: Inforce, Pending, Outstanding, Incomplete (8 kartu).
 *  5. "Status Kepesertaan": Inforce, Pending, Outstanding, Incomplete, Maturity,
 *     Lapse, Top Up/Rollover, Dibatalkan, Ditolak (9 angka).
 *  6. 4 chart: Total Polis Per Gender (donut), Per Keputusan Akseptasi (bar),
 *     Per Produk Bank (donut), Per Tabel Medis (donut).
 *
 * Mapping field respons persis updateDashboardData() aslinya.
 */
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { onClickOutside } from "@vueuse/core";
import api from "@/lib/api";
import { getSession } from "@/lib/auth";
import {
  DASHBOARD_START_DATE,
  DASHBOARD_END_DATE,
  dashboardScopeParams,
  getDashboardFilterSelection,
} from "@/lib/services/dashboard";
import { formatNumber, moment } from "@/lib/format";
import { useUiStore } from "@/stores/ui";
import { useMeta } from "@/composables/useMeta";
import PageHeader from "@/components/ui/PageHeader.vue";
import Card from "@/components/ui/Card.vue";
import BaseSelect from "@/components/ui/BaseSelect.vue";
import Spinner from "@/components/ui/Spinner.vue";
import { Filter } from "lucide-vue-next";

useMeta({ title: "Dashboard" });

const ui = useUiStore();
const { isDark } = storeToRefs(ui);
const session = getSession();

const loading = ref(false);
const data = ref({}); // respons dashboard/main

// ---- Filter (dropdown Cabang + Filter Waktu — persis aslinya) ----
const showFilter = ref(false);
const filterRef = ref(null);
const memberId = ref(null);
const memberOptions = ref([]);
const period = ref(null);
const startDate = ref(DASHBOARD_START_DATE); // default asli: 2023-01-01
const endDate = ref(DASHBOARD_END_DATE); //               2030-01-01

onClickOutside(filterRef, () => (showFilter.value = false));

const periodeOptions = [
  { label: "Hari Ini", value: "today" },
  { label: "Bulan Ini", value: "this_month" },
  { label: "Bulan Lalu", value: "last_month" },
  { label: "Lainnya", value: "lainnya" },
];

async function loadDashboard() {
  loading.value = true;
  try {
    const scope = await dashboardScopeParams();
    const params = { ...scope };
    if (startDate.value) params.start_date = startDate.value;
    if (endDate.value) params.end_date = endDate.value;
    if (memberId.value) params.member_id = memberId.value;
    const res = await api.get("dashboard/main", { params });
    data.value = res.data?.data || {};
  } catch {
    data.value = {};
  } finally {
    loading.value = false;
  }
}

// Periode -> hitung tanggal & langsung fetch; "Lainnya" -> isi rentang manual.
watch(period, (value) => {
  if (!value) return;
  const now = moment();
  if (value === "today") {
    startDate.value = now.format("YYYY-MM-DD");
    endDate.value = now.format("YYYY-MM-DD");
    loadDashboard();
  } else if (value === "this_month") {
    startDate.value = now.clone().startOf("month").format("YYYY-MM-DD");
    endDate.value = now.format("YYYY-MM-DD");
    loadDashboard();
  } else if (value === "last_month") {
    startDate.value = now
      .clone()
      .subtract(1, "month")
      .startOf("month")
      .format("YYYY-MM-DD");
    endDate.value = now
      .clone()
      .subtract(1, "month")
      .endOf("month")
      .format("YYYY-MM-DD");
    loadDashboard();
  } else if (value === "lainnya") {
    startDate.value = "";
    endDate.value = "";
  }
});
watch([startDate, endDate], () => {
  if (period.value === "lainnya" && startDate.value && endDate.value)
    loadDashboard();
});

function resetDropdownFilter() {
  memberId.value = null;
}
function applyFilter() {
  showFilter.value = false;
  loadDashboard();
}

onMounted(async () => {
  try {
    const filter = await getDashboardFilterSelection(session.partnerId);
    memberOptions.value = filter.member || [];
  } catch {
    /* opsi cabang gagal dimuat — filter tetap bisa dipakai tanpa cabang */
  }
  await loadDashboard();
});

// ---- Nilai kartu (mapping field persis updateDashboardData asli) ----
const n = (v) => formatNumber(v ?? 0);

// Warna aksen strip kiri kartu (persis inline style dashboard asli):
// semua kartu "Premi" teal, semua kartu "UP" biru.
const ACCENT_PREMI = "#01b7ba";
const ACCENT_UP = "#2374ab";

// Baris premi/UP per status (label, field & warna aksen persis aslinya).
const premiRows = computed(() => {
  const d = data.value;
  return [
    {
      label: "Total Premi Inforce",
      value: n(d.total_inforce_total_premium),
      accent: ACCENT_PREMI,
    },
    {
      label: "Total Premi Pending",
      value: n(d.total_pending_total_premium),
      accent: ACCENT_PREMI,
    },
    {
      label: "Total UP Inforce",
      value: n(d.total_inforce_sum_insured),
      accent: ACCENT_UP,
    },
    {
      label: "Total UP Pending",
      value: n(d.total_pending_sum_insured),
      accent: ACCENT_UP,
    },
    {
      label: "Total Premi Outstanding",
      value: n(d.total_outstanding_total_premium),
      accent: ACCENT_PREMI,
    },
    {
      label: "Total Premi Incomplete",
      value: n(d.total_onreview_total_premium),
      accent: ACCENT_PREMI,
    },
    {
      label: "Total UP Outstanding",
      value: n(d.total_outstanding_sum_insured),
      accent: ACCENT_UP,
    },
    {
      label: "Total UP Incomplete",
      value: n(d.total_onreview_sum_insured),
      accent: ACCENT_UP,
    },
  ];
});

// Status Kepesertaan (urutan, mapping & warna bar atas persis aslinya).
const statusRows = computed(() => {
  const d = data.value;
  return [
    { label: "Inforce", value: n(d.total_inforce), color: "#2374ab" },
    { label: "Pending", value: n(d.total_pending), color: "#2374ab" },
    { label: "Outstanding", value: n(d.total_outstanding), color: "#ff9900" },
    { label: "Incomplete", value: n(d.total_onreview), color: "#1dc457" },
    { label: "Maturity", value: n(d.total_maturity), color: "#1dc457" },
    { label: "Lapse", value: n(d.total_lapse), color: "#2ec4b6" },
    { label: "Top Up/Rollover", value: n(d.total_topup), color: "#7b91fc" },
    { label: "Dibatalkan", value: n(d.total_restitute), color: "#e22f4a" },
    { label: "Ditolak", value: n(d.total_rejected), color: "#1dc457" },
  ];
});

// ---- Chart (jenis & sumber data persis aslinya) ----
const chartTheme = computed(() => (isDark.value ? "dark" : "light"));
const palette = [
  "#2563eb",
  "#10b585",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0ea5e9",
];

function donut(source) {
  const labels = source?.label || [];
  const series = (source?.value || []).map(Number);
  return {
    hasData: labels.length > 0,
    series,
    options: {
      chart: { type: "donut", background: "transparent" },
      labels,
      colors: palette,
      legend: { position: "bottom" },
      dataLabels: { enabled: true },
      theme: { mode: chartTheme.value },
      stroke: { width: 0 },
    },
  };
}

function bar(source) {
  const categories = source?.label || [];
  const series = (source?.value || []).map(Number);
  return {
    hasData: categories.length > 0,
    series: [{ name: "Jumlah", data: series }],
    options: {
      chart: {
        type: "bar",
        background: "transparent",
        toolbar: { show: false },
      },
      xaxis: {
        categories,
        // Label teks di bawah bar disembunyikan (sering miring & terpotong bila
        // nama kategorinya panjang) — diganti legend berwarna di bawah grafik.
        labels: { show: false },
        axisTicks: { show: false },
      },
      // distributed: tiap bar memakai warna sendiri dari palet,
      // sehingga legend menjadi penanda "warna = kategori".
      colors: palette,
      plotOptions: { bar: { borderRadius: 5, columnWidth: "48%", distributed: true } },
      dataLabels: { enabled: false },
      // Legend penanda warna -> nama kategori; diberi jarak dari grafik
      // (offsetY + itemMargin) tapi tetap di dalam card yang sama.
      legend: {
        show: true,
        position: "bottom",
        horizontalAlign: "center",
        offsetY: 8,
        itemMargin: { horizontal: 12, vertical: 4 },
        markers: { radius: 3 },
      },
      theme: { mode: chartTheme.value },
      grid: { borderColor: isDark.value ? "#334155" : "#e2e8f0" },
    },
  };
}

const genderChart = computed(() => donut(data.value.gender));
const riskChart = computed(() => bar(data.value.risk_category));
const productChart = computed(() => donut(data.value.product));
const submissionChart = computed(() => donut(data.value.submission_type));
</script>

<template>
  <div>
    <PageHeader
      title="Dashboard"
      subtitle="Ringkasan polis, premi, dan status kepesertaan."
    >
      <!-- Tombol Filter + dropdown (Cabang + Filter Waktu) — persis aslinya -->
      <div ref="filterRef" class="relative">
        <button
          type="button"
          class="btn-secondary"
          @click="showFilter = !showFilter"
        >
          <Filter class="h-4 w-4" />
          <span>Filter</span>
        </button>

        <transition name="dropdown-pop">
          <div
            v-if="showFilter"
            class="absolute right-0 z-40 mt-2 w-[320px] rounded-xl border border-slate-200 bg-white p-4 shadow-floating dark:border-slate-700 dark:bg-slate-900"
          >
            <div class="mb-1 flex items-center justify-between">
              <label class="form-label mb-0">Cabang</label>
              <button
                type="button"
                class="text-xs font-medium text-primary-600 hover:underline"
                @click="resetDropdownFilter"
              >
                Reset
              </button>
            </div>
            <BaseSelect
              v-model="memberId"
              :options="memberOptions"
              option-label="member_name"
              option-value="member_id"
              placeholder="Pilih cabang"
            />

            <label class="form-label mb-1 mt-4">Filter Waktu</label>
            <BaseSelect
              v-model="period"
              :options="periodeOptions"
              option-label="label"
              option-value="value"
              placeholder="Pilih periode"
              :searchable="false"
            />

            <div
              v-if="period === 'lainnya'"
              class="mt-4 grid grid-cols-2 gap-2"
            >
              <div>
                <label class="form-label">Dari</label>
                <input v-model="startDate" type="date" class="form-input" />
              </div>
              <div>
                <label class="form-label">Sampai</label>
                <input v-model="endDate" type="date" class="form-input" />
              </div>
            </div>

            <div class="mt-5 flex justify-end gap-2">
              <button
                type="button"
                class="btn-secondary btn-sm"
                @click="resetDropdownFilter"
              >
                Reset
              </button>
              <button
                type="button"
                class="btn-primary btn-sm"
                @click="applyFilter"
              >
                Terapkan
              </button>
            </div>
          </div>
        </transition>
      </div>
    </PageHeader>

    <div v-if="loading" class="flex justify-center py-20 text-slate-400">
      <Spinner size="lg" />
    </div>

    <div v-else class="space-y-4">
      <!-- 1. Dua kartu besar: Total Polis & Total Debitur -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="top-card">
          <img
            src="/assets/images/pattren.png"
            alt=""
            class="top-card-pattern"
          />
          <div class="relative z-10 text-[13px] font-medium opacity-90">
            Total Polis
          </div>
          <div class="relative z-10 mt-1 text-2xl font-semibold">
            {{ n(data.total_policy) }}
            <span class="text-sm font-medium opacity-80">Polis</span>
          </div>
        </div>
        <div class="top-card">
          <img
            src="/assets/images/pattren.png"
            alt=""
            class="top-card-pattern"
          />
          <div class="relative z-10 text-[13px] font-medium opacity-90">
            Total Debitur
          </div>
          <div class="relative z-10 mt-1 text-2xl font-semibold">
            {{ n(data.total_debitur) }}
            <span class="text-sm font-medium opacity-80">Debitur</span>
          </div>
        </div>
      </div>

      <!-- 2. Total Premi & Total Uang Pertanggungan (strip menempel di tepi kiri kartu) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card class="relative overflow-hidden">
          <span
            class="absolute inset-y-0 left-0 w-1.5"
            :style="{ backgroundColor: ACCENT_PREMI }"
          />
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Premi
          </p>
          <p
            class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100"
          >
            {{ n(data.total_premium) }}
            <span class="text-xs font-medium text-slate-400">IDR</span>
          </p>
        </Card>
        <Card class="relative overflow-hidden">
          <span
            class="absolute inset-y-0 left-0 w-1.5"
            :style="{ backgroundColor: ACCENT_UP }"
          />
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Uang Pertanggungan
          </p>
          <p
            class="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100"
          >
            {{ n(data.total_sum_insured) }}
            <span class="text-xs font-medium text-slate-400">IDR</span>
          </p>
        </Card>
      </div>

      <!-- 3. Premi/UP per status — strip warna menempel di tepi kiri kartu (persis pola aslinya) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          v-for="row in premiRows"
          :key="row.label"
          class="relative overflow-hidden"
        >
          <span
            class="absolute inset-y-0 left-0 w-1.5"
            :style="{ backgroundColor: row.accent }"
          />
          <p
            class="truncate text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            {{ row.label }}
          </p>
          <p
            class="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100"
          >
            {{ row.value }}
            <span class="text-xs font-medium text-slate-400">IDR</span>
          </p>
        </Card>
      </div>

      <!-- 4. Status Kepesertaan — tiap tile punya bar warna di ATAS (persis pola aslinya) -->
      <Card title="Status Kepesertaan">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          <div
            v-for="s in statusRows"
            :key="s.label"
            class="overflow-hidden rounded-lg border border-slate-200 text-center dark:border-slate-800"
          >
            <div class="h-1.5 w-full" :style="{ backgroundColor: s.color }" />
            <div class="p-3">
              <p
                class="text-lg font-semibold text-slate-800 dark:text-slate-100"
              >
                {{ s.value }}
              </p>
              <p
                class="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"
              >
                {{ s.label }}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <!-- 5. Empat chart (judul & sumber persis aslinya) -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Total Polis Per Gender">
          <apexchart
            v-if="genderChart.hasData"
            type="donut"
            height="300"
            :options="genderChart.options"
            :series="genderChart.series"
          />
          <p v-else class="py-12 text-center text-sm text-slate-400">
            Belum ada data.
          </p>
        </Card>

        <Card title="Total Polis Per Keputusan Akseptasi">
          <apexchart
            v-if="riskChart.hasData"
            type="bar"
            height="300"
            :options="riskChart.options"
            :series="riskChart.series"
          />
          <p v-else class="py-12 text-center text-sm text-slate-400">
            Belum ada data.
          </p>
        </Card>

        <Card title="Total Polis Per Produk Bank">
          <apexchart
            v-if="productChart.hasData"
            type="donut"
            height="300"
            :options="productChart.options"
            :series="productChart.series"
          />
          <p v-else class="py-12 text-center text-sm text-slate-400">
            Belum ada data.
          </p>
        </Card>

        <Card title="Total Polis Per Tabel Medis">
          <apexchart
            v-if="submissionChart.hasData"
            type="donut"
            height="300"
            :options="submissionChart.options"
            :series="submissionChart.series"
          />
          <p v-else class="py-12 text-center text-sm text-slate-400">
            Belum ada data.
          </p>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Kartu besar biru dengan pattern (meniru .top-card ehd-backoffice) */
.top-card {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background-color: #2563eb;
  color: white;
  padding: 18px 20px;
}
.top-card-pattern {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  opacity: 0.9;
}

.dropdown-pop-enter-active,
.dropdown-pop-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.dropdown-pop-enter-from,
.dropdown-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
