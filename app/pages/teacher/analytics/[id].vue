<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Teacher' })

const route = useRoute()
const assignmentId = route.params.id as string

const { data, status } = await useFetch(`/api/teacher/analytics/${assignmentId}`)

const students = computed(() => data.value?.students ?? [])

const STATUS_META: Record<string, { label: string; color: 'danger' | 'warning' | 'success' | 'neutral'; text: string }> = {
  'at-risk': { label: 'At Risk', color: 'danger', text: 'text-danger-600 dark:text-danger-500' },
  declining: { label: 'Declining', color: 'warning', text: 'text-warning-600 dark:text-warning-500' },
  'on-track': { label: 'On Track', color: 'success', text: 'text-success-600 dark:text-success-500' },
  'no-data': { label: 'No Data', color: 'neutral', text: 'text-ink-subtle' }
}

function countOf(key: string) {
  return students.value.filter((s: any) => s.status === key).length
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="status === 'pending'" class="text-sm text-ink-subtle">Loading…</div>

    <template v-else-if="data">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-display text-h2 text-ink-heading">{{ data.subject?.name }} Analytics</h2>
          <p class="text-sm text-ink-muted">{{ data.class?.name }} &middot; trend across every recorded term.</p>
        </div>
        <NuxtLink :to="`/teacher/scores/${assignmentId}`" class="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          Enter scores &rarr;
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppCard>
          <p class="text-sm text-ink-muted">At Risk</p>
          <p class="font-display text-h1 text-danger-600 dark:text-danger-500">{{ countOf('at-risk') }}</p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-ink-muted">Declining</p>
          <p class="font-display text-h1 text-warning-600 dark:text-warning-500">{{ countOf('declining') }}</p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-ink-muted">On Track</p>
          <p class="font-display text-h1 text-success-600 dark:text-success-500">{{ countOf('on-track') }}</p>
        </AppCard>
      </div>

      <AppCard body-class="">
        <template #header>
          <h3 class="text-title text-ink-heading">Students</h3>
        </template>
        <div v-if="!students.length" class="p-5 text-sm text-ink-muted">No active students in this class yet.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
                <th class="px-5 py-3">Student</th>
                <th class="px-5 py-3">Trend</th>
                <th class="px-5 py-3">Current</th>
                <th class="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in students" :key="row.student._id" class="border-b border-line-soft last:border-0">
                <td class="px-5 py-3">
                  <p class="font-medium text-ink-heading">{{ row.student.firstName }} {{ row.student.lastName }}</p>
                  <p class="text-xs font-mono text-ink-subtle">{{ row.student.admissionNumber }}</p>
                </td>
                <td class="px-5 py-3 w-32">
                  <TrendSparkline :points="row.points.map((p: any) => p.total)" :class="STATUS_META[row.status].text" />
                </td>
                <td class="px-5 py-3 font-mono text-ink">{{ row.current !== null ? row.current.toFixed(1) : '-' }}</td>
                <td class="px-5 py-3">
                  <AppBadge :color="STATUS_META[row.status].color">{{ STATUS_META[row.status].label }}</AppBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>
    </template>
  </div>
</template>
