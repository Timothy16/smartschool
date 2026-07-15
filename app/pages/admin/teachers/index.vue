<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const toast = useToast()

const { data, refresh, status } = useFetch('/api/teachers')
const teachers = computed(() => data.value?.teachers ?? [])

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  isActive: true
})

function openCreate() {
  editingId.value = null
  form.firstName = ''
  form.lastName = ''
  form.email = ''
  form.password = ''
  form.isActive = true
  modalOpen.value = true
}

function openEdit(row: any) {
  editingId.value = row._id
  form.firstName = row.firstName
  form.lastName = row.lastName
  form.email = row.email
  form.password = ''
  form.isActive = row.isActive
  modalOpen.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    if (editingId.value) {
      const body: Record<string, any> = { ...form }
      if (!body.password) delete body.password
      await $fetch(`/api/teachers/${editingId.value}`, { method: 'PATCH', body })
      toast.add({ title: 'Teacher updated', color: 'success', icon: 'lucide:check-circle' })
    } else {
      await $fetch('/api/teachers', { method: 'POST', body: form })
      toast.add({ title: 'Teacher created', color: 'success', icon: 'lucide:check-circle' })
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
    await $fetch(`/api/teachers/${deletingId.value}`, { method: 'DELETE' })
    toast.add({ title: 'Teacher deleted', color: 'success' })
    deleteOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Could not delete teacher', description: error?.data?.message, color: 'danger' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-h2 text-ink-heading">Teachers</h2>
        <p class="text-sm text-ink-muted">Manage teacher accounts.</p>
      </div>
      <AppButton icon="lucide:plus" @click="openCreate">Add Teacher</AppButton>
    </div>

    <AppCard body-class="">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
              <th class="px-5 py-3">Name</th>
              <th class="px-5 py-3">Email</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <TableSkeletonRows v-if="status === 'pending'" :columns="4" />
            <tr v-else-if="!teachers.length">
              <td colspan="4" class="px-5 py-8 text-center text-ink-subtle">No teachers yet.</td>
            </tr>
            <tr
              v-for="row in teachers"
              :key="row._id"
              class="border-b border-line-soft last:border-0 hover:bg-muted"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-2">
                  <AppAvatar :text="`${row.firstName[0]}${row.lastName[0]}`" size="sm" />
                  <span class="font-medium text-ink-heading">{{ row.firstName }} {{ row.lastName }}</span>
                </div>
              </td>
              <td class="px-5 py-3 text-ink">{{ row.email }}</td>
              <td class="px-5 py-3">
                <AppBadge :color="row.isActive ? 'success' : 'neutral'">{{ row.isActive ? 'Active' : 'Inactive' }}</AppBadge>
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

    <AppModal v-model:open="modalOpen" :title="editingId ? 'Edit Teacher' : 'Add Teacher'">
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

          <AppFormField label="Email">
            <AppInput v-model="form.email" type="email" />
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
            <AppButton type="submit" :loading="saving">{{ editingId ? 'Save changes' : 'Create teacher' }}</AppButton>
          </div>
        </form>
      </template>
    </AppModal>

    <ConfirmDeleteModal
      v-model:open="deleteOpen"
      title="Delete teacher?"
      description="This teacher's subject assignments will be removed and any class they form-teach will be unassigned."
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
