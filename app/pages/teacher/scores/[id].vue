<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Teacher' })

interface RowState {
  assignment: number | null
  test: number | null
  exam: number | null
  saving: boolean
}

const route = useRoute()
const toast = useToast()
const assignmentId = route.params.id as string

const { data, status } = await useFetch(`/api/assessments/${assignmentId}`)

const students = computed(() => data.value?.students ?? [])

const assignmentMax = ref<number | null>(100)
const testMax = ref<number | null>(100)
const examMax = ref<number | null>(100)

const rows = reactive<Record<string, RowState>>({})

watchEffect(() => {
  for (const student of students.value) {
    if (!rows[student._id]) {
      rows[student._id] = { assignment: null, test: null, exam: null, saving: false }
    }
  }
  for (const a of data.value?.assessments ?? []) {
    const row = rows[a.studentId]
    if (!row) continue
    if (a.type === 'assignment') {
      row.assignment = a.score
      assignmentMax.value = a.maxScore
    }
    if (a.type === 'test') {
      row.test = a.score
      testMax.value = a.maxScore
    }
    if (a.type === 'exam') {
      row.exam = a.score
      examMax.value = a.maxScore
    }
  }
})

async function saveRow(studentId: string) {
  const row = rows[studentId]
  if (!row) return

  row.saving = true
  try {
    const entries: { type: string; score: number; maxScore: number }[] = []
    if (row.assignment !== null) entries.push({ type: 'assignment', score: row.assignment, maxScore: assignmentMax.value ?? 100 })
    if (row.test !== null) entries.push({ type: 'test', score: row.test, maxScore: testMax.value ?? 100 })
    if (row.exam !== null) entries.push({ type: 'exam', score: row.exam, maxScore: examMax.value ?? 100 })

    await Promise.all(
      entries.map((entry) => $fetch(`/api/assessments/${assignmentId}`, { method: 'POST', body: { studentId, ...entry } }))
    )
    toast.add({ title: 'Scores saved', color: 'success', icon: 'lucide:check-circle' })
  } catch (error: any) {
    toast.add({ title: 'Could not save scores', description: error?.data?.message, color: 'danger' })
  } finally {
    row.saving = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="status === 'pending'" class="text-sm text-ink-subtle">Loading…</div>

    <template v-else-if="data">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-display text-h2 text-ink-heading">
            {{ data.subject?.name }} &middot; {{ data.class?.name }}
          </h2>
          <p class="text-sm text-ink-muted">Enter assignment, test and exam scores for each student.</p>
        </div>
        <div class="flex gap-2">
          <AppBadge color="brand">{{ data.session }}</AppBadge>
          <AppBadge color="info">{{ data.term }} Term</AppBadge>
        </div>
      </div>

      <AppCard>
        <template #header>
          <h3 class="text-title text-ink-heading">Max scores for this entry</h3>
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppFormField label="Assignment max">
            <AppInputNumber v-model="assignmentMax" :min="1" :max="100" />
          </AppFormField>
          <AppFormField label="Test max">
            <AppInputNumber v-model="testMax" :min="1" :max="100" />
          </AppFormField>
          <AppFormField label="Exam max">
            <AppInputNumber v-model="examMax" :min="1" :max="100" />
          </AppFormField>
        </div>
      </AppCard>

      <AppCard body-class="">
        <div v-if="!students.length" class="p-5 text-sm text-ink-muted">No active students in this class yet.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
                <th class="px-5 py-3">Student</th>
                <th class="px-5 py-3">Assignment</th>
                <th class="px-5 py-3">Test</th>
                <th class="px-5 py-3">Exam</th>
                <th class="px-5 py-3 text-right">Save</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="student in students"
                :key="student._id"
                class="border-b border-line-soft last:border-0"
              >
                <td class="px-5 py-3">
                  <p class="font-medium text-ink-heading">{{ student.firstName }} {{ student.lastName }}</p>
                  <p class="text-xs font-mono text-ink-subtle">{{ student.admissionNumber }}</p>
                </td>
                <td class="px-5 py-3">
                  <div class="w-24">
                    <AppInputNumber v-model="rows[student._id].assignment" :min="0" :max="assignmentMax ?? 100" size="sm" class="font-mono" />
                  </div>
                </td>
                <td class="px-5 py-3">
                  <div class="w-24">
                    <AppInputNumber v-model="rows[student._id].test" :min="0" :max="testMax ?? 100" size="sm" class="font-mono" />
                  </div>
                </td>
                <td class="px-5 py-3">
                  <div class="w-24">
                    <AppInputNumber v-model="rows[student._id].exam" :min="0" :max="examMax ?? 100" size="sm" class="font-mono" />
                  </div>
                </td>
                <td class="px-5 py-3 text-right">
                  <AppButton size="sm" variant="soft" :loading="rows[student._id].saving" @click="saveRow(student._id)">
                    Save
                  </AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppCard>
    </template>
  </div>
</template>
