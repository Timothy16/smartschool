<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Teacher' })

const auth = useAuthStore()

const { data, status } = useFetch('/api/teacher/assignments')
const assignments = computed(() => data.value?.assignments ?? [])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-h2 text-ink-heading">Welcome, {{ auth.user?.firstName }}</h2>
      <p class="text-sm text-ink-muted">Your assigned classes and subjects.</p>
    </div>

    <div v-if="status === 'pending'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AppCard v-for="i in 3" :key="i">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 space-y-2">
            <AppSkeleton width="60%" height="1rem" />
            <AppSkeleton width="80%" height="0.75rem" />
          </div>
          <AppSkeleton width="2.25rem" height="2.25rem" rounded="rounded-lg" />
        </div>
        <AppSkeleton width="4rem" height="1.25rem" class="mt-3" />
        <div class="flex gap-2 mt-4">
          <AppSkeleton height="2rem" />
          <AppSkeleton height="2rem" />
        </div>
      </AppCard>
    </div>

    <AppCard v-else-if="!assignments.length">
      <p class="text-ink-muted">You don't have any class/subject assignments yet - ask your admin to assign you one.</p>
    </AppCard>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AppCard v-for="row in assignments" :key="row._id">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-ink-heading">{{ row.subjectId?.name }}</p>
            <p class="text-sm text-ink-muted mt-0.5">{{ row.classId?.name }} &middot; {{ row.classId?.session }}</p>
          </div>
          <div class="flex items-center justify-center size-9 rounded-lg bg-brand-50 ring-1 ring-brand-600/20 dark:bg-brand-900/40 shrink-0">
            <Icon name="lucide:pencil-line" class="size-4 text-brand-600 dark:text-brand-400" />
          </div>
        </div>
        <AppBadge class="mt-3 font-mono">{{ row.subjectId?.code }}</AppBadge>
        <div class="flex gap-2 mt-4">
          <AppButton :to="`/teacher/scores/${row._id}`" size="sm" variant="soft" icon="lucide:pencil-line" block>Scores</AppButton>
          <AppButton :to="`/teacher/analytics/${row._id}`" size="sm" variant="outline" icon="lucide:activity" block>Analytics</AppButton>
        </div>
      </AppCard>
    </div>
  </div>
</template>
