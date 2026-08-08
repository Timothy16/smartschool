<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const route = useRoute()
const studentId = route.params.studentId as string
const toast = useToast()

const term = ref(typeof route.query.term === 'string' ? route.query.term : undefined)
const session = ref(typeof route.query.session === 'string' ? route.query.session : undefined)

const { data, status } = useFetch(`/api/report-card/${studentId}`, {
  query: computed(() => ({ term: term.value, session: session.value }))
})

const periodItems = computed(() =>
  (data.value?.availablePeriods ?? []).map((p) => ({ label: `${p.term} Term - ${p.session}`, value: `${p.term}__${p.session}` }))
)

const periodValue = computed({
  get: () => `${term.value ?? data.value?.term}__${session.value ?? data.value?.session}`,
  set: (value: string) => {
    const [t, s] = value.split('__')
    term.value = t
    session.value = s
  }
})

function printCard() {
  window.print()
}

const resolvedTerm = computed(() => term.value ?? data.value?.term)
const resolvedSession = computed(() => session.value ?? data.value?.session)

const { data: analysisData, status: analysisStatus, refresh: refreshAnalysis } = useFetch(`/api/ai-analysis/${studentId}`, {
  query: computed(() => ({ term: resolvedTerm.value, session: resolvedSession.value }))
})

const analysis = computed(() => analysisData.value?.analysis ?? null)

const VISIBILITY_LABEL: Record<string, string> = {
  draft: 'Draft (admin only)',
  teacher: 'Published to teacher',
  student: 'Published to student',
  both: 'Published to teacher & student'
}

const generating = ref(false)
async function generateAnalysis() {
  generating.value = true
  try {
    await $fetch(`/api/ai-analysis/${studentId}`, {
      method: 'POST',
      body: { term: resolvedTerm.value, session: resolvedSession.value }
    })
    await refreshAnalysis()
    toast.add({ title: 'Smart Analysis generated', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Could not generate analysis', description: error?.data?.message, color: 'danger' })
  } finally {
    generating.value = false
  }
}

const publishing = ref<string | null>(null)
async function publish(visibility: 'teacher' | 'student' | 'both') {
  publishing.value = visibility
  try {
    await $fetch(`/api/ai-analysis/${studentId}`, {
      method: 'PATCH',
      body: { term: resolvedTerm.value, session: resolvedSession.value, visibility }
    })
    await refreshAnalysis()
    toast.add({ title: 'Visibility updated', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Could not update visibility', description: error?.data?.message, color: 'danger' })
  } finally {
    publishing.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/results" class="p-1.5 rounded-md text-ink-muted hover:bg-muted">
          <Icon name="lucide:arrow-left" class="size-4" />
        </NuxtLink>
        <div>
          <h2 class="font-display text-h2 text-ink-heading">Report Card</h2>
          <p class="text-sm text-ink-muted">Computed from this student's assessment records.</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div v-if="periodItems.length > 1" class="w-full sm:w-52">
          <AppSelect v-model="periodValue" :items="periodItems" size="sm" />
        </div>
        <AppButton variant="soft" icon="lucide:printer" @click="printCard">Print</AppButton>
      </div>
    </div>

    <AppCard v-if="status === 'pending'">
      <div class="space-y-3">
        <AppSkeleton width="12rem" height="1.25rem" />
        <AppSkeleton width="8rem" height="0.875rem" />
        <div class="pt-3 space-y-2">
          <AppSkeleton v-for="i in 6" :key="i" height="1.5rem" />
        </div>
      </div>
    </AppCard>
    <ReportCard v-else-if="data" :data="data" />

    <AppCard v-if="status !== 'pending' && data" class="print:hidden">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-title text-ink-heading">Smart Analysis</h3>
            <p class="text-sm text-ink-muted">AI-generated performance analysis for this report card.</p>
          </div>
          <AppButton :loading="generating" icon="lucide:sparkles" size="sm" @click="generateAnalysis">
            {{ analysis ? 'Regenerate' : 'Generate' }} Smart Analysis
          </AppButton>
        </div>
      </template>

      <div v-if="analysisStatus === 'pending'" class="space-y-3">
        <AppSkeleton width="16rem" height="1rem" />
        <AppSkeleton v-for="i in 3" :key="i" height="1.25rem" />
      </div>

      <div v-else-if="!analysis" class="text-sm text-ink-muted">
        No Smart Analysis generated yet for this term. Click "Generate Smart Analysis" above.
      </div>

      <div v-else class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-panel bg-muted p-4">
          <div>
            <p class="text-sm font-medium text-ink-heading">{{ VISIBILITY_LABEL[analysis.visibility] }}</p>
            <p class="text-xs text-ink-muted">Choose who can see this analysis.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <AppButton
              variant="soft"
              size="sm"
              :color="analysis.visibility === 'teacher' ? 'brand' : 'neutral'"
              :loading="publishing === 'teacher'"
              @click="publish('teacher')"
            >
              Publish to Teacher
            </AppButton>
            <AppButton
              variant="soft"
              size="sm"
              :color="analysis.visibility === 'student' ? 'brand' : 'neutral'"
              :loading="publishing === 'student'"
              @click="publish('student')"
            >
              Publish to Student
            </AppButton>
            <AppButton
              variant="soft"
              size="sm"
              :color="analysis.visibility === 'both' ? 'brand' : 'neutral'"
              :loading="publishing === 'both'"
              @click="publish('both')"
            >
              Publish to Both
            </AppButton>
          </div>
        </div>

        <p class="text-sm text-ink">{{ analysis.overallSummary }}</p>

        <div class="space-y-5">
          <div v-for="subject in analysis.subjects" :key="subject.code" class="border-t border-line-soft pt-5 first:border-0 first:pt-0">
            <h4 class="font-display text-title text-ink-heading">{{ subject.name }} <span class="font-mono text-xs text-ink-subtle">({{ subject.code }})</span></h4>
            <p class="mt-1 text-sm text-ink">{{ subject.performanceSummary }}</p>

            <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-label text-ink-muted mb-1">Strengths</p>
                <ul class="list-disc list-inside space-y-0.5 text-ink">
                  <li v-for="(item, i) in subject.strengths" :key="i">{{ item }}</li>
                </ul>
              </div>
              <div>
                <p class="text-label text-ink-muted mb-1">Areas to improve</p>
                <ul class="list-disc list-inside space-y-0.5 text-ink">
                  <li v-for="(item, i) in subject.weaknesses" :key="i">{{ item }}</li>
                </ul>
              </div>
              <div>
                <p class="text-label text-ink-muted mb-1">Recommendations</p>
                <ul class="list-disc list-inside space-y-0.5 text-ink">
                  <li v-for="(item, i) in subject.recommendations" :key="i">{{ item }}</li>
                </ul>
              </div>
              <div>
                <p class="text-label text-ink-muted mb-1">Topics to review</p>
                <ul class="list-disc list-inside space-y-0.5 text-ink">
                  <li v-for="(item, i) in subject.topicsToReview" :key="i">{{ item }}</li>
                </ul>
              </div>
            </div>

            <div v-if="subject.suggestedBooks?.length" class="mt-3">
              <p class="text-label text-ink-muted mb-1">Suggested books</p>
              <div class="flex flex-wrap gap-1.5">
                <AppBadge v-for="(book, i) in subject.suggestedBooks" :key="i" color="info">{{ book }}</AppBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  </div>
</template>
