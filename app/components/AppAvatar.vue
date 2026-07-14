<script setup lang="ts">
withDefaults(defineProps<{ text: string; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <span
    class="inline-flex items-center justify-center shrink-0 rounded-pill bg-brand-100 text-brand-700 font-medium dark:bg-brand-900/50 dark:text-brand-300"
    :class="size === 'sm' ? 'size-7 text-xs' : size === 'lg' ? 'size-12 text-base' : 'size-9 text-sm'"
  >
    {{ text }}
  </span>
</template>
