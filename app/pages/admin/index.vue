<script setup lang="ts">
import { iconWrapClasses, type UiColor } from '~/utils/styleVariants'

definePageMeta({ layout: 'default', role: 'Admin' })

const auth = useAuthStore()

const { data: studentsData, status: studentsStatus } = useFetch('/api/students')
const { data: teachersData, status: teachersStatus } = useFetch('/api/teachers')
const { data: classesData, status: classesStatus } = useFetch('/api/classes')
const { data: subjectsData, status: subjectsStatus } = useFetch('/api/subjects')
const { data: settingsData, status: settingsStatus } = useFetch('/api/settings')
const { data: analyticsData, status: analyticsStatus } = useFetch('/api/analytics/school')

const pending = computed(() =>
  [studentsStatus, teachersStatus, classesStatus, subjectsStatus, settingsStatus, analyticsStatus].some(
    (s) => s.value === 'pending'
  )
)

const flaggedPreview = computed(() => (analyticsData.value?.flagged ?? []).slice(0, 5))
const STATUS_META: Record<string, { label: string; color: 'danger' | 'warning' }> = {
  'at-risk': { label: 'At Risk', color: 'danger' },
  declining: { label: 'Declining', color: 'warning' }
}

const stats = computed(() => [
  { label: 'Students', value: studentsData.value?.students?.length ?? 0, icon: 'lucide:users', to: '/admin/students', color: 'brand' as UiColor },
  { label: 'Teachers', value: teachersData.value?.teachers?.length ?? 0, icon: 'lucide:user-round', to: '/admin/teachers', color: 'info' as UiColor },
  { label: 'Classes', value: classesData.value?.classes?.length ?? 0, icon: 'lucide:school', to: '/admin/classes', color: 'success' as UiColor },
  { label: 'Subjects', value: subjectsData.value?.subjects?.length ?? 0, icon: 'lucide:book-open', to: '/admin/subjects', color: 'warning' as UiColor }
])

const settings = computed(() => settingsData.value?.settings)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-h2 text-ink-heading">Welcome, {{ auth.user?.firstName }}</h2>
      <p class="text-sm text-ink-muted">Here's what's happening at your school right now.</p>
    </div>

    <template v-if="pending">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppCard v-for="i in 4" :key="i" class="h-full">
          <div class="flex items-center gap-3">
            <AppSkeleton width="2.75rem" height="2.75rem" rounded="rounded-xl" />
            <div class="flex-1 space-y-2">
              <AppSkeleton width="2.5rem" height="1.5rem" />
              <AppSkeleton width="70%" height="0.75rem" />
            </div>
          </div>
        </AppCard>
      </div>
      <AppCard body-class="">
        <template #header>
          <AppSkeleton width="12rem" height="1rem" />
        </template>
        <table class="w-full text-sm">
          <tbody>
            <TableSkeletonRows :columns="5" />
          </tbody>
        </table>
      </AppCard>
    </template>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink v-for="stat in stats" :key="stat.label" :to="stat.to" class="transition-transform hover:-translate-y-0.5">
          <AppCard class="h-full">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center size-11 rounded-xl shrink-0" :class="iconWrapClasses(stat.color).wrap">
                <Icon :name="stat.icon" class="size-5" :class="iconWrapClasses(stat.color).icon" />
              </div>
              <div>
                <p class="font-display text-h1 text-ink-heading">{{ stat.value }}</p>
                <p class="text-sm text-ink-muted">{{ stat.label }}</p>
              </div>
            </div>
          </AppCard>
        </NuxtLink>
      </div>

      <AppCard v-if="settings">
        <template #header>
          <h3 class="text-title text-ink-heading">Current academic period</h3>
        </template>
        <div class="flex flex-wrap gap-6 text-sm">
          <div>
            <p class="text-ink-muted">Session</p>
            <p class="font-medium text-ink-heading">{{ settings.currentSession }}</p>
          </div>
          <div>
            <p class="text-ink-muted">Term</p>
            <p class="font-medium text-ink-heading">{{ settings.currentTerm }} Term</p>
          </div>
          <div>
            <p class="text-ink-muted">CA / Exam weighting</p>
            <p class="font-medium text-ink-heading">{{ settings.caWeight }}% / {{ settings.examWeight }}%</p>
          </div>
          <div>
            <p class="text-ink-muted">Pass mark</p>
            <p class="font-medium text-ink-heading">{{ settings.passMark }}%</p>
          </div>
        </div>
      </AppCard>

      <AppCard body-class="">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-title text-ink-heading">Students needing attention</h3>
            <NuxtLink to="/admin/analytics" class="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all &rarr;
            </NuxtLink>
          </div>
        </template>
        <div v-if="!flaggedPreview.length" class="p-5 text-sm text-ink-muted">No at-risk or declining students right now.</div>
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
              <tr v-for="row in flaggedPreview" :key="`${row.student._id}-${row.subjectId}`" class="border-b border-line-soft last:border-0">
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
  </div>
</template>
