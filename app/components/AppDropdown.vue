<script setup lang="ts">
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

watch(open, (value) => {
  if (value) {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div ref="rootRef" class="relative inline-block text-left">
    <div @click="open = !open">
      <slot name="trigger" :open="open" />
    </div>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-card bg-surface py-1 shadow-pop ring-1 ring-line focus:outline-none"
        @click="open = false"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>
