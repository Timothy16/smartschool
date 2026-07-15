<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    rounded?: string
  }>(),
  { width: '100%', height: '0.875rem', rounded: 'rounded-md' }
)
</script>

<template>
  <div class="animate-pulse bg-muted" :class="rounded" :style="{ width, height }" />
</template>
