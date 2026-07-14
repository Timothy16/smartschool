<script setup lang="ts">
const colorMode = useColorMode()

function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-center size-9 rounded-lg text-ink-muted hover:bg-muted"
    :aria-label="colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <Icon v-if="colorMode.value === 'dark'" name="lucide:sun" class="size-4" />
    <Icon v-else name="lucide:moon" class="size-4" />
  </button>
</template>
