<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const config = useRuntimeConfig()
console.log(config)
</script>

<template>
  <AppCard class="shadow-2xl shadow-brand-500/10 backdrop-blur-sm bg-surface/90">
    <div class="flex flex-col items-center gap-5 py-2 text-center">
      <div class="flex items-center justify-center size-16 rounded-2xl bg-brand-50 ring-1 ring-brand-600/20 dark:bg-brand-900/40">
        <Icon name="lucide:graduation-cap" class="size-9 text-brand-600 dark:text-brand-400" />
      </div>
      <div>
        <h1 class="font-display text-h1 text-ink-heading">Smart School Management System</h1>
        <p class="text-sm text-ink-muted mt-2 max-w-sm">
          Student records, score entry, automatic report cards and at-risk performance tracking, all in one place.
        </p>
      </div>
      <AppButton to="/login" trailing-icon="lucide:arrow-right" size="lg">Log in to continue</AppButton>
    </div>
  </AppCard>
</template>
