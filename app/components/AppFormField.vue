<script setup lang="ts">
withDefaults(defineProps<{ label?: string; help?: string; required?: boolean }>(), {})
</script>

<template>
  <label class="block">
    <span v-if="label" class="block text-sm font-medium text-ink mb-1.5">
      {{ label }}<span v-if="required" class="text-danger">&nbsp;*</span>
    </span>
    <slot />
    <span v-if="help" class="block text-xs text-ink-muted mt-1">{{ help }}</span>
  </label>
</template>
