<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Student' })

const auth = useAuthStore()
const term = ref<string>()
const session = ref<string>()

const { data, status } = useFetch(`/api/report-card/${auth.user!.id}`, {
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

const { data: analysisData, status: analysisStatus } = useFetch(`/api/ai-analysis/${auth.user!.id}`, {
  query: computed(() => ({ term: resolvedTerm.value, session: resolvedSession.value }))
})

const analysis = computed(() => analysisData.value?.analysis ?? null)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <div>
        <h2 class="font-display text-h2 text-ink-heading">My Report Card</h2>
        <p class="text-sm text-ink-muted">View your results for any completed term.</p>
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

    <AppCard v-if="analysisStatus !== 'pending' && analysis" class="print:hidden">
      <template #header>
        <h3 class="text-title text-ink-heading">Smart Analysis</h3>
        <p class="text-sm text-ink-muted">Insights from your teachers and school admin for this term.</p>
      </template>

      <div class="space-y-6">
        <p v-if="analysis.overallSummary" class="text-sm text-ink">{{ analysis.overallSummary }}</p>

        <div class="space-y-5">
          <div v-for="subject in analysis.subjects" :key="subject.code" class="border-t border-line-soft pt-5 first:border-0 first:pt-0">
            <h4 class="font-display text-title text-ink-heading">{{ subject.name }}</h4>
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
