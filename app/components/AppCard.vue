<script setup lang="ts">
withDefaults(defineProps<{ bodyClass?: string }>(), { bodyClass: 'p-5' })
</script>

<template>
  <div class="rounded-card bg-surface ring-1 ring-line shadow-card">
    <div v-if="$slots.header" class="px-5 py-4 border-b border-line">
      <slot name="header" />
    </div>
    <div :class="bodyClass">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-5 py-4 border-t border-line">
      <slot name="footer" />
    </div>
  </div>
</template>
