<script setup lang="ts">
defineProps<{
  data: {
    student: any
    class: any
    term: string
    session: string
    subjects: any[]
    overallAverage: number | null
    overallGrade: string | null
    overallRemark: string | null
    passedOverall: boolean | null
  }
}>()

function fmt(n: number | null) {
  return n === null ? '-' : n.toFixed(1)
}
</script>

<template>
  <div class="rounded-panel border border-line bg-surface p-4 sm:p-8 print:border-0 print:p-0">
    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center size-12 rounded-xl bg-brand-50 ring-1 ring-brand-600/20 dark:bg-brand-900/40 print:hidden">
          <Icon name="lucide:graduation-cap" class="size-6 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <p class="font-display text-h3 text-ink-heading">Smart Secondary School</p>
          <p class="text-sm text-ink-muted">Student Report Card</p>
        </div>
      </div>
      <div class="flex gap-2">
        <AppBadge color="brand">{{ data.session }}</AppBadge>
        <AppBadge color="info">{{ data.term }} Term</AppBadge>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-line text-sm">
      <div>
        <p class="text-ink-muted">Student</p>
        <p class="font-medium text-ink-heading">{{ data.student.firstName }} {{ data.student.lastName }}</p>
      </div>
      <div>
        <p class="text-ink-muted">Admission No.</p>
        <p class="font-mono font-medium text-ink-heading">{{ data.student.admissionNumber }}</p>
      </div>
      <div>
        <p class="text-ink-muted">Class</p>
        <p class="font-medium text-ink-heading">{{ data.class?.name ?? '-' }}</p>
      </div>
    </div>

    <div class="overflow-x-auto py-6">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-line bg-muted text-left text-label text-ink-muted print:bg-transparent">
            <th class="px-3 py-2">Subject</th>
            <th class="px-3 py-2 text-right">Assignment</th>
            <th class="px-3 py-2 text-right">Test</th>
            <th class="px-3 py-2 text-right">Exam</th>
            <th class="px-3 py-2 text-right">CA %</th>
            <th class="px-3 py-2 text-right">Exam %</th>
            <th class="px-3 py-2 text-right">Total</th>
            <th class="px-3 py-2 text-center">Grade</th>
            <th class="px-3 py-2">Remark</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in data.subjects" :key="subject.subjectId" class="border-b border-line-soft last:border-0">
            <td class="px-3 py-2">
              <p class="font-medium text-ink-heading">{{ subject.name }}</p>
              <p class="text-xs font-mono text-ink-subtle">{{ subject.code }}</p>
            </td>
            <td class="px-3 py-2 text-right font-mono">{{ subject.assignment ? `${subject.assignment.score}/${subject.assignment.maxScore}` : '-' }}</td>
            <td class="px-3 py-2 text-right font-mono">{{ subject.test ? `${subject.test.score}/${subject.test.maxScore}` : '-' }}</td>
            <td class="px-3 py-2 text-right font-mono">{{ subject.exam ? `${subject.exam.score}/${subject.exam.maxScore}` : '-' }}</td>
            <td class="px-3 py-2 text-right font-mono">{{ fmt(subject.caScore) }}</td>
            <td class="px-3 py-2 text-right font-mono">{{ fmt(subject.examScore) }}</td>
            <td class="px-3 py-2 text-right font-mono font-semibold text-ink-heading">{{ fmt(subject.total) }}</td>
            <td class="px-3 py-2 text-center">
              <AppBadge v-if="subject.grade" :color="subject.passed ? 'success' : 'danger'">{{ subject.grade }}</AppBadge>
              <span v-else class="text-ink-subtle">-</span>
            </td>
            <td class="px-3 py-2 text-ink-muted">{{ subject.remark ?? 'Not yet scored' }}</td>
          </tr>
          <tr v-if="!data.subjects.length">
            <td colspan="9" class="px-3 py-6 text-center text-ink-muted">No subjects assigned to this class yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-line text-sm">
      <div>
        <p class="text-ink-muted">Overall Average</p>
        <p class="font-display text-h2 text-ink-heading">{{ fmt(data.overallAverage) }}<span class="text-sm text-ink-muted">%</span></p>
      </div>
      <div>
        <p class="text-ink-muted">Overall Grade</p>
        <p class="font-display text-h2 text-ink-heading">{{ data.overallGrade ?? '-' }}</p>
      </div>
      <div>
        <p class="text-ink-muted">Result</p>
        <AppBadge v-if="data.passedOverall !== null" :color="data.passedOverall ? 'success' : 'danger'" class="mt-1">
          {{ data.passedOverall ? 'Passed' : 'Failed' }}
        </AppBadge>
        <span v-else class="text-ink-subtle">No scores yet</span>
      </div>
    </div>
  </div>
</template>
