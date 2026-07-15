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
  </div>
</template>
