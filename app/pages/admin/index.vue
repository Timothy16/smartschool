<script setup lang="ts">
import { iconWrapClasses, type UiColor } from '~/utils/styleVariants'

definePageMeta({ layout: 'default', role: 'Admin' })

const auth = useAuthStore()

const [{ data: studentsData }, { data: teachersData }, { data: classesData }, { data: subjectsData }, { data: settingsData }] =
  await Promise.all([
    useFetch('/api/students'),
    useFetch('/api/teachers'),
    useFetch('/api/classes'),
    useFetch('/api/subjects'),
    useFetch('/api/settings')
  ])

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
  </div>
</template>
