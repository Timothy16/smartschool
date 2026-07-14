<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const toast = useToast()

const { data, refresh, status } = await useFetch('/api/assignments')
const { data: teachersData } = await useFetch('/api/teachers')
const { data: classesData } = await useFetch('/api/classes')
const { data: subjectsData } = await useFetch('/api/subjects')

const assignments = computed(() => data.value?.assignments ?? [])
const teacherOptions = computed(() =>
  (teachersData.value?.teachers ?? []).map((t: any) => ({ label: `${t.firstName} ${t.lastName}`, value: t._id }))
)
const classOptions = computed(() =>
  (classesData.value?.classes ?? []).map((c: any) => ({ label: `${c.name} (${c.session})`, value: c._id }))
)
const subjectOptions = computed(() =>
  (subjectsData.value?.subjects ?? []).map((s: any) => ({ label: `${s.name} (${s.code})`, value: s._id }))
)

const modalOpen = ref(false)
const saving = ref(false)
const form = reactive({
  teacherId: '',
  classId: '',
  subjectId: ''
})

function openCreate() {
  form.teacherId = ''
  form.classId = ''
  form.subjectId = ''
  modalOpen.value = true
}

async function handleSubmit() {
  if (!form.teacherId || !form.classId || !form.subjectId) {
    toast.add({ title: 'Please select a teacher, class and subject', color: 'warning' })
    return
  }
  saving.value = true
  try {
    await $fetch('/api/assignments', { method: 'POST', body: form })
    toast.add({ title: 'Assignment created', color: 'success', icon: 'lucide:check-circle' })
    modalOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Could not create assignment', description: error?.data?.message, color: 'danger' })
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
    await $fetch(`/api/assignments/${deletingId.value}`, { method: 'DELETE' })
    toast.add({ title: 'Assignment removed', color: 'success' })
    deleteOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Could not remove assignment', description: error?.data?.message, color: 'danger' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-h2 text-ink-heading">Assignments</h2>
        <p class="text-sm text-ink-muted">Link teachers to the class + subject pairs they teach.</p>
      </div>
      <AppButton icon="lucide:plus" @click="openCreate">Add Assignment</AppButton>
    </div>

    <AppCard body-class="">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
              <th class="px-5 py-3">Teacher</th>
              <th class="px-5 py-3">Class</th>
              <th class="px-5 py-3">Subject</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="status === 'pending'">
              <td colspan="4" class="px-5 py-8 text-center text-ink-subtle">Loading…</td>
            </tr>
            <tr v-else-if="!assignments.length">
              <td colspan="4" class="px-5 py-8 text-center text-ink-subtle">No assignments yet.</td>
            </tr>
            <tr
              v-for="row in assignments"
              :key="row._id"
              class="border-b border-line-soft last:border-0 hover:bg-muted"
            >
              <td class="px-5 py-3 font-medium text-ink-heading">
                {{ row.teacherId?.firstName }} {{ row.teacherId?.lastName }}
              </td>
              <td class="px-5 py-3 text-ink">{{ row.classId?.name }}</td>
              <td class="px-5 py-3"><AppBadge>{{ row.subjectId?.name }}</AppBadge></td>
              <td class="px-5 py-3">
                <div class="flex justify-end">
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

    <AppModal v-model:open="modalOpen" title="Add Assignment">
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <AppFormField label="Teacher">
            <AppSelect v-model="form.teacherId" :items="teacherOptions" placeholder="Select teacher" />
          </AppFormField>

          <AppFormField label="Class">
            <AppSelect v-model="form.classId" :items="classOptions" placeholder="Select class" />
          </AppFormField>

          <AppFormField label="Subject">
            <AppSelect v-model="form.subjectId" :items="subjectOptions" placeholder="Select subject" />
          </AppFormField>

          <div class="flex justify-end gap-2 pt-2">
            <AppButton type="button" color="neutral" variant="ghost" @click="modalOpen = false">Cancel</AppButton>
            <AppButton type="submit" :loading="saving">Create assignment</AppButton>
          </div>
        </form>
      </template>
    </AppModal>

    <ConfirmDeleteModal
      v-model:open="deleteOpen"
      title="Remove assignment?"
      description="The teacher will lose access to enter scores for this class and subject."
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
