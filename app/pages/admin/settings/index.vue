<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const toast = useToast()

const { data, refresh, status } = await useFetch('/api/settings')

const termOptions = ['First', 'Second', 'Third']

const form = reactive({
  currentSession: '',
  currentTerm: 'First',
  caWeight: 40 as number | null,
  examWeight: 60 as number | null,
  passMark: 40 as number | null,
  gradeBoundaries: [] as { grade: string; minScore: number | null; remark: string | null }[]
})

watchEffect(() => {
  const settings = data.value?.settings
  if (!settings) return
  form.currentSession = settings.currentSession
  form.currentTerm = settings.currentTerm
  form.caWeight = settings.caWeight
  form.examWeight = settings.examWeight
  form.passMark = settings.passMark
  form.gradeBoundaries = settings.gradeBoundaries.map((b: any) => ({ ...b }))
})

const weightSum = computed(() => Number(form.caWeight || 0) + Number(form.examWeight || 0))

function addBoundary() {
  form.gradeBoundaries.push({ grade: '', minScore: 0, remark: null })
}

function removeBoundary(index: number) {
  form.gradeBoundaries.splice(index, 1)
}

const saving = ref(false)

async function handleSave() {
  if (weightSum.value !== 100) {
    toast.add({ title: 'CA and exam weighting must add up to 100', color: 'warning' })
    return
  }

  saving.value = true
  try {
    await $fetch('/api/settings', {
      method: 'PATCH',
      body: {
        ...form,
        caWeight: form.caWeight ?? 0,
        examWeight: form.examWeight ?? 0,
        passMark: form.passMark ?? 0,
        gradeBoundaries: form.gradeBoundaries.map((b) => ({ ...b, minScore: b.minScore ?? 0 }))
      }
    })
    toast.add({ title: 'Settings saved', color: 'success', icon: 'lucide:check-circle' })
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Could not save settings', description: error?.data?.message, color: 'danger' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <div>
      <h2 class="font-display text-h2 text-ink-heading">Settings</h2>
      <p class="text-sm text-ink-muted">Academic session, grading and weighting configuration.</p>
    </div>

    <AppCard v-if="status !== 'pending'">
      <template #header>
        <h3 class="text-title text-ink-heading">Academic period</h3>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppFormField label="Current session" help="e.g. 2025/2026">
          <AppInput v-model="form.currentSession" />
        </AppFormField>

        <AppFormField label="Current term">
          <AppSelect v-model="form.currentTerm" :items="termOptions" />
        </AppFormField>
      </div>
    </AppCard>

    <AppCard v-if="status !== 'pending'">
      <template #header>
        <h3 class="text-title text-ink-heading">Weighting & pass mark</h3>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppFormField label="CA weight (%)">
          <AppInputNumber v-model="form.caWeight" :min="0" :max="100" />
        </AppFormField>

        <AppFormField label="Exam weight (%)">
          <AppInputNumber v-model="form.examWeight" :min="0" :max="100" />
        </AppFormField>

        <AppFormField label="Pass mark (%)">
          <AppInputNumber v-model="form.passMark" :min="0" :max="100" />
        </AppFormField>
      </div>

      <p class="text-xs mt-2" :class="weightSum === 100 ? 'text-ink-muted' : 'text-danger'">
        CA + Exam = {{ weightSum }}% {{ weightSum === 100 ? '' : '(must equal 100%)' }}
      </p>
    </AppCard>

    <AppCard v-if="status !== 'pending'">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-title text-ink-heading">Grade boundaries</h3>
          <AppButton icon="lucide:plus" size="xs" variant="soft" @click="addBoundary">Add grade</AppButton>
        </div>
      </template>

      <div class="space-y-2">
        <div v-for="(boundary, index) in form.gradeBoundaries" :key="index" class="flex flex-wrap items-center gap-2">
          <div class="w-20 shrink-0">
            <AppInput v-model="boundary.grade" placeholder="Grade" class="font-mono" />
          </div>
          <div class="w-24 shrink-0">
            <AppInputNumber v-model="boundary.minScore" :min="0" :max="100" placeholder="Min score" class="font-mono" />
          </div>
          <div class="flex-1 min-w-32">
            <AppInput v-model="boundary.remark" placeholder="Remark" />
          </div>
          <button type="button" class="p-2 rounded-md text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 shrink-0" @click="removeBoundary(index)">
            <Icon name="lucide:x" class="size-4" />
          </button>
        </div>

        <p v-if="!form.gradeBoundaries.length" class="text-sm text-ink-muted">No grade boundaries yet.</p>
      </div>
    </AppCard>

    <div class="flex justify-end">
      <AppButton size="lg" :loading="saving" @click="handleSave">Save settings</AppButton>
    </div>
  </div>
</template>
