<script setup lang="ts">
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    :class="model ? 'bg-brand-600' : 'bg-line-strong'"
    @click="model = !model"
  >
    <span
      class="inline-block size-4 transform rounded-pill bg-white shadow transition-transform"
      :class="model ? 'translate-x-6' : 'translate-x-1'"
    />
  </button>
</template>
