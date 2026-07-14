<script setup lang="ts">
const model = defineModel<string | number>()

withDefaults(
  defineProps<{
    type?: string
    placeholder?: string
    icon?: string
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    autofocus?: boolean
    min?: number
    max?: number
  }>(),
  { type: 'text', size: 'md' }
)
</script>

<template>
  <div class="relative">
    <Icon v-if="icon" :name="icon" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-subtle" />
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autofocus="autofocus"
      :min="min"
      :max="max"
      class="block w-full rounded-input border border-line bg-surface text-ink placeholder:text-ink-subtle shadow-xs transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:opacity-50 disabled:bg-muted"
      :class="[
        icon ? 'pl-9' : 'pl-3',
        size === 'sm' ? 'py-1.5 text-sm' : size === 'lg' ? 'py-2.5 text-base' : 'py-2 text-sm',
        'pr-3'
      ]"
    >
  </div>
</template>
