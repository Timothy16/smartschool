<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const route = useRoute()
const studentId = route.params.studentId as string

const term = ref(typeof route.query.term === 'string' ? route.query.term : undefined)
const session = ref(typeof route.query.session === 'string' ? route.query.session : undefined)

const { data, status } = await useFetch(`/api/report-card/${studentId}`, {
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

    <div v-if="status === 'pending'" class="text-sm text-ink-subtle">Loading…</div>
    <ReportCard v-else-if="data" :data="data" />
  </div>
</template>
