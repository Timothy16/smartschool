<script setup lang="ts">
type Item = string | { label: string; value: string }

const model = defineModel<string | undefined>()

const props = withDefaults(
  defineProps<{
    items: Item[]
    placeholder?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

function itemValue(item: Item) {
  return typeof item === 'string' ? item : item.value
}
function itemLabel(item: Item) {
  return typeof item === 'string' ? item : item.label
}
</script>

<template>
  <div class="relative w-full">
    <select
      v-model="model"
      class="w-full appearance-none rounded-input border border-line bg-surface text-ink shadow-xs transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none pr-9"
      :class="size === 'sm' ? 'py-1.5 pl-3 text-sm' : size === 'lg' ? 'py-2.5 pl-3 text-base' : 'py-2 pl-3 text-sm'"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="item in props.items" :key="itemValue(item)" :value="itemValue(item)">
        {{ itemLabel(item) }}
      </option>
    </select>
    <Icon name="lucide:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-subtle pointer-events-none" />
  </div>
</template>
