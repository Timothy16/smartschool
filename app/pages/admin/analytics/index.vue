<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const { data: schoolData, status: schoolStatus } = await useFetch('/api/analytics/school')
const { data: assignmentsData } = await useFetch('/api/assignments')

const assignmentOptions = computed(() =>
  (assignmentsData.value?.assignments ?? []).map((a: any) => ({
    label: `${a.classId?.name} - ${a.subjectId?.name}`,
    value: `${a.classId?._id}__${a.subjectId?._id}`
  }))
)

const selectedAssignment = ref('')
const subjectData = ref<any>(null)
const subjectLoading = ref(false)

watch(selectedAssignment, async (value) => {
  const [classId, subjectId] = value.split('__')
  if (!classId || !subjectId) {
    subjectData.value = null
    return
  }
  subjectLoading.value = true
  try {
    subjectData.value = await $fetch('/api/analytics/subject', { query: { classId, subjectId } })
  } finally {
    subjectLoading.value = false
  }
})

const summary = computed(() => schoolData.value?.summary)
const flagged = computed(() => schoolData.value?.flagged ?? [])
const subjectStudents = computed(() => subjectData.value?.students ?? [])

const STATUS_META: Record<string, { label: string; color: 'danger' | 'warning' | 'success' | 'neutral'; text: string }> = {
  'at-risk': { label: 'At Risk', color: 'danger', text: 'text-danger-600 dark:text-danger-500' },
  declining: { label: 'Declining', color: 'warning', text: 'text-warning-600 dark:text-warning-500' },
  'on-track': { label: 'On Track', color: 'success', text: 'text-success-600 dark:text-success-500' },
  'no-data': { label: 'No Data', color: 'neutral', text: 'text-ink-subtle' }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-h2 text-ink-heading">Analytics</h2>
      <p class="text-sm text-ink-muted">School-wide at-risk and declining flags, computed from score trends.</p>
    </div>

    <div v-if="schoolStatus === 'pending'" class="text-sm text-ink-subtle">Loading…</div>

    <template v-else-if="summary">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AppCard>
          <p class="text-sm text-ink-muted">At Risk</p>
          <p class="font-display text-h1 text-danger-600 dark:text-danger-500">{{ summary.atRisk }}</p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-ink-muted">Declining</p>
          <p class="font-display text-h1 text-warning-600 dark:text-warning-500">{{ summary.declining }}</p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-ink-muted">On Track</p>
          <p class="font-display text-h1 text-success-600 dark:text-success-500">{{ summary.onTrack }}</p>
        </AppCard>
        <AppCard>
          <p class="text-sm text-ink-muted">No Data</p>
          <p class="font-display text-h1 text-ink-heading">{{ summary.noData }}</p>
        </AppCard>
      </div>

      <AppCard body-class="">
        <template #header>
          <h3 class="text-title text-ink-heading">Flagged students</h3>
        </template>
        <div v-if="!flagged.length" class="p-5 text-sm text-ink-muted">No at-risk or declining students right now.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
                <th class="px-5 py-3">Student</th>
                <th class="px-5 py-3">Class</th>
                <th class="px-5 py-3">Subject</th>
                <th class="px-5 py-3">Current</th>
                <th class="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in flagged"
                :key="`${row.student._id}-${row.subjectId}`"
                class="border-b border-line-soft last:border-0 hover:bg-muted"
              >
                <td class="px-5 py-3 font-medium text-ink-heading">{{ row.student.firstName }} {{ row.student.lastName }}</td>
                <td class="px-5 py-3 text-ink">{{ row.className }}</td>
                <td class="px-5 py-3 text-ink">{{ row.subjectName }}</td>
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

    <AppCard>
      <template #header>
        <h3 class="text-title text-ink-heading">Drill into a class + subject</h3>
      </template>
      <div class="w-full sm:w-72">
        <AppSelect v-model="selectedAssignment" :items="assignmentOptions" placeholder="Select a class + subject" />
      </div>

      <div v-if="subjectLoading" class="text-sm text-ink-subtle mt-4">Loading…</div>
      <div v-else-if="subjectData" class="overflow-x-auto mt-4 -mx-5">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-y border-line bg-muted text-left text-label text-ink-muted">
              <th class="px-5 py-3">Student</th>
              <th class="px-5 py-3">Trend</th>
              <th class="px-5 py-3">Current</th>
              <th class="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!subjectStudents.length">
              <td colspan="4" class="px-5 py-8 text-center text-ink-subtle">No active students in this class.</td>
            </tr>
            <tr v-for="row in subjectStudents" :key="row.student._id" class="border-b border-line-soft last:border-0">
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
  </div>
</template>
