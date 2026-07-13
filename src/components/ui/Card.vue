<script setup>
/**
 * Kartu (card) reusable.
 * - Pakai prop `title` untuk header sederhana, atau slot #header untuk header custom.
 * - Slot #actions muncul di kanan header (mis. tombol).
 *
 * Contoh:
 *   <Card title="Data Nasabah">
 *     <template #actions><BaseButton>Tambah</BaseButton></template>
 *     ...isi...
 *   </Card>
 */
defineProps({
  title: { type: String, default: "" },
  // noBody: matikan padding bawaan (mis. saat isi berupa tabel penuh)
  noBody: { type: Boolean, default: false },
});
</script>

<template>
  <div class="card">
    <div v-if="title || $slots.header || $slots.actions" class="card-header">
      <slot name="header">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {{ title }}
        </h3>
      </slot>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <div
      class="w-full h-auto flex flex-col justify-center"
      :class="noBody ? '' : 'card-body'"
    >
      <slot />
    </div>
  </div>
</template>
