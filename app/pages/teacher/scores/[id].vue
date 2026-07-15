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

const { data, status, refresh } = useFetch(`/api/assessments/${assignmentId}`)

const students = computed(() => data.value?.students ?? [])
const assessments = computed(() => data.value?.assessments ?? [])

// Distinct maxScore values already saved for a type - normally exactly one
// (the whole class is marked out of the same total), but surfaced explicitly
// rather than silently picking one when a class ends up with more than one
// on file (e.g. from a max change made before this lock existed).
function maxScoresOnFile(type: 'assignment' | 'test' | 'exam') {
  return [...new Set(assessments.value.filter((a: any) => a.type === type).map((a: any) => a.maxScore))]
}

const assignmentMaxOnFile = computed(() => maxScoresOnFile('assignment'))
const testMaxOnFile = computed(() => maxScoresOnFile('test'))
const examMaxOnFile = computed(() => maxScoresOnFile('exam'))

const assignmentMax = ref<number | null>(100)
const testMax = ref<number | null>(100)
const examMax = ref<number | null>(100)

watchEffect(() => {
  if (assignmentMaxOnFile.value.length) assignmentMax.value = assignmentMaxOnFile.value[0]
  if (testMaxOnFile.value.length) testMax.value = testMaxOnFile.value[0]
  if (examMaxOnFile.value.length) examMax.value = examMaxOnFile.value[0]
})

// Once a type has been scored for anyone in this class this term, its max is
// locked - changing it after the fact silently reinterprets already-saved
// raw scores against a new denominator unless every row is re-saved, so it
// needs an explicit, informed unlock rather than being freely editable.
const assignmentUnlocked = ref(false)
const testUnlocked = ref(false)
const examUnlocked = ref(false)

const assignmentLocked = computed(() => assignmentMaxOnFile.value.length > 0 && !assignmentUnlocked.value)
const testLocked = computed(() => testMaxOnFile.value.length > 0 && !testUnlocked.value)
const examLocked = computed(() => examMaxOnFile.value.length > 0 && !examUnlocked.value)

function unlock(type: 'assignment' | 'test' | 'exam') {
  const confirmed = confirm(
    `Changing this only affects students you save from now on - anyone already scored keeps their original max unless you re-save their row. Continue?`
  )
  if (!confirmed) return
  if (type === 'assignment') assignmentUnlocked.value = true
  if (type === 'test') testUnlocked.value = true
  if (type === 'exam') examUnlocked.value = true
}

const rows = reactive<Record<string, RowState>>({})

watchEffect(() => {
  for (const student of students.value) {
    if (!rows[student._id]) {
      rows[student._id] = { assignment: null, test: null, exam: null, saving: false }
    }
  }
  for (const a of assessments.value) {
    const row = rows[a.studentId]
    if (!row) continue
    if (a.type === 'assignment') row.assignment = a.score
    if (a.type === 'test') row.test = a.score
    if (a.type === 'exam') row.exam = a.score
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
    await refresh()
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
    <template v-if="status === 'pending'">
      <AppCard>
        <template #header>
          <AppSkeleton width="10rem" height="1rem" />
        </template>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppSkeleton height="2.5rem" />
          <AppSkeleton height="2.5rem" />
          <AppSkeleton height="2.5rem" />
        </div>
      </AppCard>
      <AppCard body-class="">
        <table class="w-full text-sm">
          <tbody>
            <TableSkeletonRows :columns="5" />
          </tbody>
        </table>
      </AppCard>
    </template>

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
          <AppFormField label="Assignment max" :help="assignmentLocked ? 'Locked - already used to score students this term.' : undefined">
            <div class="flex items-center gap-2">
              <AppInputNumber v-model="assignmentMax" :min="1" :max="100" :disabled="assignmentLocked" />
              <button
                v-if="assignmentLocked"
                type="button"
                class="shrink-0 p-2 rounded-md text-ink-muted hover:bg-muted"
                title="Unlock to change the max for new saves"
                @click="unlock('assignment')"
              >
                <Icon name="lucide:lock" class="size-4" />
              </button>
            </div>
            <p v-if="assignmentMaxOnFile.length > 1" class="mt-1 text-xs text-warning-600 dark:text-warning-500">
              Scored out of different totals: {{ assignmentMaxOnFile.join(', ') }}. Re-save affected rows to make them consistent.
            </p>
          </AppFormField>
          <AppFormField label="Test max" :help="testLocked ? 'Locked - already used to score students this term.' : undefined">
            <div class="flex items-center gap-2">
              <AppInputNumber v-model="testMax" :min="1" :max="100" :disabled="testLocked" />
              <button
                v-if="testLocked"
                type="button"
                class="shrink-0 p-2 rounded-md text-ink-muted hover:bg-muted"
                title="Unlock to change the max for new saves"
                @click="unlock('test')"
              >
                <Icon name="lucide:lock" class="size-4" />
              </button>
            </div>
            <p v-if="testMaxOnFile.length > 1" class="mt-1 text-xs text-warning-600 dark:text-warning-500">
              Scored out of different totals: {{ testMaxOnFile.join(', ') }}. Re-save affected rows to make them consistent.
            </p>
          </AppFormField>
          <AppFormField label="Exam max" :help="examLocked ? 'Locked - already used to score students this term.' : undefined">
            <div class="flex items-center gap-2">
              <AppInputNumber v-model="examMax" :min="1" :max="100" :disabled="examLocked" />
              <button
                v-if="examLocked"
                type="button"
                class="shrink-0 p-2 rounded-md text-ink-muted hover:bg-muted"
                title="Unlock to change the max for new saves"
                @click="unlock('exam')"
              >
                <Icon name="lucide:lock" class="size-4" />
              </button>
            </div>
            <p v-if="examMaxOnFile.length > 1" class="mt-1 text-xs text-warning-600 dark:text-warning-500">
              Scored out of different totals: {{ examMaxOnFile.join(', ') }}. Re-save affected rows to make them consistent.
            </p>
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
