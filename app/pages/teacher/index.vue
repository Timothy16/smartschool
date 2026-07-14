<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Teacher' })

const auth = useAuthStore()

const { data, status } = await useFetch('/api/teacher/assignments')
const assignments = computed(() => data.value?.assignments ?? [])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-h2 text-ink-heading">Welcome, {{ auth.user?.firstName }}</h2>
      <p class="text-sm text-ink-muted">Your assigned classes and subjects.</p>
    </div>

    <div v-if="status === 'pending'" class="text-sm text-ink-subtle">Loading…</div>

    <AppCard v-else-if="!assignments.length">
      <p class="text-ink-muted">You don't have any class/subject assignments yet - ask your admin to assign you one.</p>
    </AppCard>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="row in assignments"
        :key="row._id"
        :to="`/teacher/scores/${row._id}`"
        class="transition-transform hover:-translate-y-0.5"
      >
        <AppCard class="h-full">
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
        </AppCard>
      </NuxtLink>
    </div>
  </div>
</template>
