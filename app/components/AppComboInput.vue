<script setup lang="ts">
const model = defineModel<string>()

const props = defineProps<{
  options: string[]
  placeholder?: string
}>()

const listId = useId()
</script>

<template>
  <div class="relative w-full">
    <input
      v-model="model"
      :list="listId"
      :placeholder="placeholder"
      class="w-full rounded-input border border-line bg-surface text-ink placeholder:text-ink-subtle shadow-xs transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none px-3 py-2 text-sm"
    >
    <datalist :id="listId">
      <option v-for="option in props.options" :key="option" :value="option" />
    </datalist>
  </div>
</template>
