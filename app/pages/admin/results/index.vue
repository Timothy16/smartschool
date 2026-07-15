<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const { data: classesData } = await useFetch('/api/classes')
const { data: settingsData } = await useFetch('/api/settings')

const classId = ref('')
const term = ref('')
const session = ref('')

watchEffect(() => {
  if (!classId.value && classesData.value?.classes?.length) {
    classId.value = classesData.value.classes[0]._id
  }
  if (!term.value && settingsData.value?.settings) {
    term.value = settingsData.value.settings.currentTerm
  }
  if (!session.value && settingsData.value?.settings) {
    session.value = settingsData.value.settings.currentSession
  }
})

const classOptions = computed(() => (classesData.value?.classes ?? []).map((c: any) => ({ label: `${c.name} (${c.session})`, value: c._id })))
const termOptions = [
  { label: 'First Term', value: 'First' },
  { label: 'Second Term', value: 'Second' },
  { label: 'Third Term', value: 'Third' }
]

const { data, status, refresh } = await useFetch(
  () => (classId.value ? `/api/report-card/class/${classId.value}` : ''),
  { query: computed(() => ({ term: term.value, session: session.value })), immediate: !!classId.value }
)

watch([classId, term, session], () => {
  if (classId.value) refresh()
})

const students = computed(() => data.value?.students ?? [])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="font-display text-h2 text-ink-heading">Results</h2>
      <p class="text-sm text-ink-muted">Review computed results for a class and term.</p>
    </div>

    <AppCard>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppFormField label="Class">
          <AppSelect v-model="classId" :items="classOptions" placeholder="Select a class" />
        </AppFormField>
        <AppFormField label="Term">
          <AppSelect v-model="term" :items="termOptions" />
        </AppFormField>
        <AppFormField label="Session">
          <AppInput v-model="session" placeholder="2025/2026" />
        </AppFormField>
      </div>
    </AppCard>

    <AppCard body-class="">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
              <th class="px-5 py-3">Student</th>
              <th class="px-5 py-3">Admission No.</th>
              <th class="px-5 py-3">Subjects Scored</th>
              <th class="px-5 py-3">Average</th>
              <th class="px-5 py-3">Grade</th>
              <th class="px-5 py-3">Result</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="status === 'pending'">
              <td colspan="7" class="px-5 py-8 text-center text-ink-subtle">Loading…</td>
            </tr>
            <tr v-else-if="!students.length">
              <td colspan="7" class="px-5 py-8 text-center text-ink-subtle">No active students in this class.</td>
            </tr>
            <tr v-for="row in students" :key="row._id" class="border-b border-line-soft last:border-0 hover:bg-muted">
              <td class="px-5 py-3 font-medium text-ink-heading">{{ row.firstName }} {{ row.lastName }}</td>
              <td class="px-5 py-3 font-mono text-ink">{{ row.admissionNumber }}</td>
              <td class="px-5 py-3 text-ink">{{ row.subjectsScored }} / {{ row.subjectsOffered }}</td>
              <td class="px-5 py-3 font-mono text-ink">{{ row.overallAverage !== null ? row.overallAverage.toFixed(1) : '-' }}</td>
              <td class="px-5 py-3 text-ink">{{ row.overallGrade ?? '-' }}</td>
              <td class="px-5 py-3">
                <AppBadge v-if="row.passedOverall !== null" :color="row.passedOverall ? 'success' : 'danger'">
                  {{ row.passedOverall ? 'Passed' : 'Failed' }}
                </AppBadge>
                <span v-else class="text-ink-subtle">No scores</span>
              </td>
              <td class="px-5 py-3 text-right">
                <NuxtLink
                  :to="`/admin/results/${row._id}?term=${term}&session=${session}`"
                  class="p-1.5 inline-flex rounded-md text-ink-muted hover:bg-muted"
                >
                  <Icon name="lucide:file-text" class="size-4" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>
  </div>
</template>
