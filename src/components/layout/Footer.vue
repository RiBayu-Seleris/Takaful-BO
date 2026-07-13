<script setup>
/** Footer sederhana di bawah konten. */
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-auto px-6 py-4 text-center text-xs text-slate-400">
    © {{ year }} Takaful Backoffice. Seluruh hak cipta dilindungi.
  </footer>
</template>
