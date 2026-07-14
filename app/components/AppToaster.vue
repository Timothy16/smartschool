<script setup lang="ts">
const { toasts, remove } = useToast()

const iconByColor: Record<string, string> = {
  brand: 'lucide:info',
  info: 'lucide:info',
  success: 'lucide:check-circle',
  warning: 'lucide:alert-triangle',
  danger: 'lucide:alert-circle',
  neutral: 'lucide:info'
}

const iconColorClass: Record<string, string> = {
  brand: 'text-brand-600 dark:text-brand-400',
  info: 'text-info-600 dark:text-info-500',
  success: 'text-success-600 dark:text-success-500',
  warning: 'text-warning-600 dark:text-warning-500',
  danger: 'text-danger-600 dark:text-danger-500',
  neutral: 'text-ink-muted'
}
</script>

<template>
  <div class="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-full sm:max-w-sm pointer-events-none">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-4"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-150 ease-in absolute"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-card bg-surface p-4 shadow-pop ring-1 ring-line"
      >
        <Icon
          :name="toast.icon || iconByColor[toast.color || 'neutral']"
          class="size-5 shrink-0 mt-0.5"
          :class="iconColorClass[toast.color || 'neutral']"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-ink-heading">{{ toast.title }}</p>
          <p v-if="toast.description" class="text-sm text-ink-muted mt-0.5">{{ toast.description }}</p>
        </div>
        <button type="button" class="text-ink-subtle hover:text-ink-muted" @click="remove(toast.id)">
          <Icon name="lucide:x" class="size-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
