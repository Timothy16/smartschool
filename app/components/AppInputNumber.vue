<script setup lang="ts">
const model = defineModel<number | null>({ default: null })

const props = withDefaults(
  defineProps<{
    min?: number
    max?: number
    placeholder?: string
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  { size: 'md' }
)

function handleInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  if (raw === '') {
    model.value = null
    return
  }
  const value = Number(raw)
  model.value = Number.isFinite(value) ? value : null
}
</script>

<template>
  <input
    type="number"
    :value="model ?? ''"
    :min="props.min"
    :max="props.max"
    :disabled="disabled"
    :placeholder="placeholder"
    class="w-full rounded-input border border-line bg-surface text-ink placeholder:text-ink-subtle shadow-xs transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none px-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted"
    :class="size === 'sm' ? 'py-1.5 text-sm' : size === 'lg' ? 'py-2.5 text-base' : 'py-2 text-sm'"
    @input="handleInput"
  >
</template>
