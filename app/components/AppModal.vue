<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

defineProps<{ title?: string }>()

const dialogRef = ref<HTMLDialogElement | null>(null)

watch(open, (value) => {
  const dialog = dialogRef.value
  if (!dialog) return
  if (value && !dialog.open) dialog.showModal()
  if (!value && dialog.open) dialog.close()
})

onMounted(() => {
  if (open.value) dialogRef.value?.showModal()
})

// Fires on Escape or dialog.close() - keep v-model in sync either way.
function handleNativeClose() {
  open.value = false
}

// Native <dialog> dispatches the click on the dialog element itself when the
// backdrop is clicked (not a descendant), so this is the standard click-outside check.
function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) open.value = false
}
</script>

<template>
  <dialog
    ref="dialogRef"
    class="m-auto max-h-[85vh] w-[calc(100vw-2rem)] max-w-md rounded-panel border-0 bg-surface p-0 shadow-modal ring-1 ring-line backdrop:bg-ink-heading/50 backdrop:backdrop-blur-sm"
    @close="handleNativeClose"
    @click="handleBackdropClick"
  >
    <div
      v-if="title || $slots.header"
      class="flex items-center justify-between gap-4 px-5 py-4 border-b border-line"
    >
      <slot name="header">
        <h3 class="text-title text-ink-heading">{{ title }}</h3>
      </slot>
      <button
        type="button"
        class="text-ink-subtle hover:text-ink-muted rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        @click="open = false"
      >
        <Icon name="lucide:x" class="size-5" />
      </button>
    </div>

    <div class="p-5 overflow-y-auto">
      <slot name="body" />
    </div>

    <div v-if="$slots.footer" class="px-5 py-4 border-t border-line">
      <slot name="footer" />
    </div>
  </dialog>
</template>
