<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

withDefaults(
  defineProps<{
    title?: string
    description?: string
    loading?: boolean
  }>(),
  { title: 'Delete this item?', description: 'This action cannot be undone.', loading: false }
)

const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <AppModal v-model:open="open" :title="title">
    <template #body>
      <p class="text-sm text-ink-muted">{{ description }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <AppButton color="neutral" variant="ghost" :disabled="loading" @click="open = false">Cancel</AppButton>
        <AppButton color="danger" :loading="loading" @click="emit('confirm')">Delete</AppButton>
      </div>
    </template>
  </AppModal>
</template>
