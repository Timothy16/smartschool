<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const toast = useToast()

const { data, refresh, status } = useFetch('/api/students')
const { data: classesData } = useFetch('/api/classes')

const students = computed(() => data.value?.students ?? [])
const classOptions = computed(() => [
  { label: 'Unassigned', value: '' },
  ...(classesData.value?.classes ?? []).map((c: any) => ({ label: `${c.name} (${c.session})`, value: c._id }))
])

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  admissionNumber: '',
  classId: '',
  password: '',
  isActive: true
})

function openCreate() {
  editingId.value = null
  form.firstName = ''
  form.lastName = ''
  form.email = ''
  form.admissionNumber = ''
  form.classId = ''
  form.password = ''
  form.isActive = true
  modalOpen.value = true
}

function openEdit(row: any) {
  editingId.value = row._id
  form.firstName = row.firstName
  form.lastName = row.lastName
  form.email = row.email ?? ''
  form.admissionNumber = row.admissionNumber
  form.classId = row.classId?._id ?? ''
  form.password = ''
  form.isActive = row.isActive
  modalOpen.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    const body: Record<string, any> = { ...form, classId: form.classId || null }
    if (!body.password) delete body.password
    if (editingId.value) {
      await $fetch(`/api/students/${editingId.value}`, { method: 'PATCH', body })
      toast.add({ title: 'Student updated', color: 'success', icon: 'lucide:check-circle' })
    } else {
      await $fetch('/api/students', { method: 'POST', body })
      toast.add({ title: 'Student created', color: 'success', icon: 'lucide:check-circle' })
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
    await $fetch(`/api/students/${deletingId.value}`, { method: 'DELETE' })
    toast.add({ title: 'Student deleted', color: 'success' })
    deleteOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Could not delete student', description: error?.data?.message, color: 'danger' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-h2 text-ink-heading">Students</h2>
        <p class="text-sm text-ink-muted">Manage student records and class placement.</p>
      </div>
      <AppButton icon="lucide:plus" @click="openCreate">Add Student</AppButton>
    </div>

    <AppCard body-class="">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
              <th class="px-5 py-3">Name</th>
              <th class="px-5 py-3">Admission No.</th>
              <th class="px-5 py-3">Class</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <TableSkeletonRows v-if="status === 'pending'" :columns="5" />
            <tr v-else-if="!students.length">
              <td colspan="5" class="px-5 py-8 text-center text-ink-subtle">No students yet.</td>
            </tr>
            <tr
              v-for="row in students"
              :key="row._id"
              class="border-b border-line-soft last:border-0 hover:bg-muted"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <AppAvatar :text="`${row.firstName[0]}${row.lastName[0]}`" size="sm" />
                  <span class="font-medium text-ink-heading">{{ row.firstName }} {{ row.lastName }}</span>
                </div>
              </td>
              <td class="px-5 py-3 font-mono text-ink">{{ row.admissionNumber }}</td>
              <td class="px-5 py-3">
                <span v-if="row.classId" class="text-ink">{{ row.classId.name }}</span>
                <span v-else class="text-ink-subtle">Unassigned</span>
              </td>
              <td class="px-5 py-3">
                <AppBadge :color="row.isActive ? 'success' : 'neutral'">{{ row.isActive ? 'Active' : 'Inactive' }}</AppBadge>
              </td>
              <td class="px-5 py-3">
                <div class="flex justify-end gap-1">
                  <NuxtLink :to="`/admin/results/${row._id}`" class="p-1.5 rounded-md text-ink-muted hover:bg-muted">
                    <Icon name="lucide:file-text" class="size-4" />
                  </NuxtLink>
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

    <AppModal v-model:open="modalOpen" :title="editingId ? 'Edit Student' : 'Add Student'">
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppFormField label="First name">
              <AppInput v-model="form.firstName" />
            </AppFormField>
            <AppFormField label="Last name">
              <AppInput v-model="form.lastName" />
            </AppFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppFormField label="Admission number">
              <AppInput v-model="form.admissionNumber" />
            </AppFormField>
            <AppFormField label="Email (optional)">
              <AppInput v-model="form.email" type="email" />
            </AppFormField>
          </div>

          <AppFormField label="Class">
            <AppSelect v-model="form.classId" :items="classOptions" />
          </AppFormField>

          <AppFormField
            :label="editingId ? 'New password' : 'Password'"
            :help="editingId ? 'Leave blank to keep the current password' : undefined"
          >
            <AppInput v-model="form.password" type="password" />
          </AppFormField>

          <AppFormField v-if="editingId" label="Active">
            <AppSwitch v-model="form.isActive" />
          </AppFormField>

          <div class="flex justify-end gap-2 pt-2">
            <AppButton type="button" color="neutral" variant="ghost" @click="modalOpen = false">Cancel</AppButton>
            <AppButton type="submit" :loading="saving">{{ editingId ? 'Save changes' : 'Create student' }}</AppButton>
          </div>
        </form>
      </template>
    </AppModal>

    <ConfirmDeleteModal
      v-model:open="deleteOpen"
      title="Delete student?"
      description="This will permanently remove the student's record."
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
