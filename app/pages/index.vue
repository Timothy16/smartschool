<script setup lang="ts">
definePageMeta({ layout: 'auth' })


</script>

<template>
  <AppCard class="shadow-2xl  shadow-brand-500/10 backdrop-blur-sm bg-surface/90">
    <div class="flex flex-col items-center gap-5 py-2 text-center">
      <img src="/logo.png" alt="Smart School" class="size-16 rounded-2xl">

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
