<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Student' })

const auth = useAuthStore()
</script>

<template>
  <div class="space-y-4">
    <h2 class="font-display text-h2 text-ink-heading">Welcome, {{ auth.user?.firstName }}</h2>
    <AppCard>
      <p class="text-ink-muted">Student dashboard - report cards and performance trend arrive in Phase 4.</p>
    </AppCard>
  </div>
</template>
