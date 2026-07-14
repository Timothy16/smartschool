<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const toast = useToast()

const { data, refresh, status } = await useFetch('/api/classes')
const { data: teachersData } = await useFetch('/api/teachers')
const { data: settingsData } = await useFetch('/api/settings')

const classes = computed(() => data.value?.classes ?? [])
const teacherOptions = computed(() => [
  { label: 'Unassigned', value: '' },
  ...(teachersData.value?.teachers ?? []).map((t: any) => ({ label: `${t.firstName} ${t.lastName}`, value: t._id }))
])

const currentSession = computed(() => settingsData.value?.settings?.currentSession ?? '')

// Sessions to pick from: the current one from Settings plus any already used by existing classes.
const sessionOptions = computed(() => {
  const sessions = new Set<string>()
  if (currentSession.value) sessions.add(currentSession.value)
  for (const klass of classes.value) sessions.add(klass.session)
  return Array.from(sessions)
})

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const form = reactive({
  name: '',
  session: '',
  formTeacherId: ''
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.session = currentSession.value
  form.formTeacherId = ''
  modalOpen.value = true
}

function openEdit(row: any) {
  editingId.value = row._id
  form.name = row.name
  form.session = row.session
  form.formTeacherId = row.formTeacherId?._id ?? ''
  modalOpen.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    const body = { ...form, formTeacherId: form.formTeacherId || null }
    if (editingId.value) {
      await $fetch(`/api/classes/${editingId.value}`, { method: 'PATCH', body })
      toast.add({ title: 'Class updated', color: 'success', icon: 'lucide:check-circle' })
    } else {
      await $fetch('/api/classes', { method: 'POST', body })
      toast.add({ title: 'Class created', color: 'success', icon: 'lucide:check-circle' })
    }
    modalOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Something went wrong', description: error?.data?.message, color: 'danger' })
  } finally {
    saving.value = false
  }
}

const deleteOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleting = ref(false)

function confirmDelete(row: any) {
  deletingId.value = row._id
  deleteOpen.value = true
}

async function handleDelete() {
  if (!deletingId.value) return
  deleting.value = true
  try {
    await $fetch(`/api/classes/${deletingId.value}`, { method: 'DELETE' })
    toast.add({ title: 'Class deleted', color: 'success' })
    deleteOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Could not delete class', description: error?.data?.message, color: 'danger' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-h2 text-ink-heading">Classes</h2>
        <p class="text-sm text-ink-muted">Manage the school's class arms and sessions.</p>
      </div>
      <AppButton icon="lucide:plus" @click="openCreate">Add Class</AppButton>
    </div>

    <AppCard body-class="">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
              <th class="px-5 py-3">Class</th>
              <th class="px-5 py-3">Session</th>
              <th class="px-5 py-3">Form Teacher</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="status === 'pending'">
              <td colspan="4" class="px-5 py-8 text-center text-ink-subtle">Loading…</td>
            </tr>
            <tr v-else-if="!classes.length">
              <td colspan="4" class="px-5 py-8 text-center text-ink-subtle">No classes yet.</td>
            </tr>
            <tr
              v-for="row in classes"
              :key="row._id"
              class="border-b border-line-soft last:border-0 hover:bg-muted"
            >
              <td class="px-5 py-3 font-medium text-ink-heading">{{ row.name }}</td>
              <td class="px-5 py-3 font-mono text-ink">{{ row.session }}</td>
              <td class="px-5 py-3">
                <span v-if="row.formTeacherId" class="text-ink">
                  {{ row.formTeacherId.firstName }} {{ row.formTeacherId.lastName }}
                </span>
                <span v-else class="text-ink-subtle">Unassigned</span>
              </td>
              <td class="px-5 py-3">
                <div class="flex justify-end gap-1">
                  <button type="button" class="p-1.5 rounded-md text-ink-muted hover:bg-muted" @click="openEdit(row)">
                    <Icon name="lucide:pencil" class="size-4" />
                  </button>
                  <button type="button" class="p-1.5 rounded-md text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10" @click="confirmDelete(row)">
                    <Icon name="lucide:trash-2" class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AppCard>

    <AppModal v-model:open="modalOpen" :title="editingId ? 'Edit Class' : 'Add Class'">
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <AppFormField label="Class name" help="e.g. JSS1A">
            <AppInput v-model="form.name" placeholder="JSS1A" />
          </AppFormField>

          <AppFormField label="Session" help="Defaults to the current session from Settings">
            <AppComboInput v-model="form.session" :options="sessionOptions" placeholder="2025/2026" />
          </AppFormField>

          <AppFormField label="Form teacher">
            <AppSelect v-model="form.formTeacherId" :items="teacherOptions" />
          </AppFormField>

          <div class="flex justify-end gap-2 pt-2">
            <AppButton type="button" color="neutral" variant="ghost" @click="modalOpen = false">Cancel</AppButton>
            <AppButton type="submit" :loading="saving">{{ editingId ? 'Save changes' : 'Create class' }}</AppButton>
          </div>
        </form>
      </template>
    </AppModal>

    <ConfirmDeleteModal
      v-model:open="deleteOpen"
      title="Delete class?"
      description="Students in this class will keep their record, but the class link and any subject assignments for it will be removed."
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
