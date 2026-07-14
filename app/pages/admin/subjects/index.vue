<script setup lang="ts">
definePageMeta({ layout: 'default', role: 'Admin' })

const toast = useToast()

const { data, refresh, status } = await useFetch('/api/subjects')
const subjects = computed(() => data.value?.subjects ?? [])

const modalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const form = reactive({ name: '', code: '' })

function openCreate() {
  editingId.value = null
  form.name = ''
  form.code = ''
  modalOpen.value = true
}

function openEdit(row: any) {
  editingId.value = row._id
  form.name = row.name
  form.code = row.code
  modalOpen.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/subjects/${editingId.value}`, { method: 'PATCH', body: form })
      toast.add({ title: 'Subject updated', color: 'success', icon: 'lucide:check-circle' })
    } else {
      await $fetch('/api/subjects', { method: 'POST', body: form })
      toast.add({ title: 'Subject created', color: 'success', icon: 'lucide:check-circle' })
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
    await $fetch(`/api/subjects/${deletingId.value}`, { method: 'DELETE' })
    toast.add({ title: 'Subject deleted', color: 'success' })
    deleteOpen.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Could not delete subject', description: error?.data?.message, color: 'danger' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="font-display text-h2 text-ink-heading">Subjects</h2>
        <p class="text-sm text-ink-muted">Manage the subjects taught across the school.</p>
      </div>
      <AppButton icon="lucide:plus" @click="openCreate">Add Subject</AppButton>
    </div>

    <AppCard body-class="">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-line bg-muted text-left text-label text-ink-muted">
              <th class="px-5 py-3">Subject</th>
              <th class="px-5 py-3">Code</th>
              <th class="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="status === 'pending'">
              <td colspan="3" class="px-5 py-8 text-center text-ink-subtle">Loading…</td>
            </tr>
            <tr v-else-if="!subjects.length">
              <td colspan="3" class="px-5 py-8 text-center text-ink-subtle">No subjects yet.</td>
            </tr>
            <tr
              v-for="row in subjects"
              :key="row._id"
              class="border-b border-line-soft last:border-0 hover:bg-muted"
            >
              <td class="px-5 py-3 font-medium text-ink-heading">{{ row.name }}</td>
              <td class="px-5 py-3"><AppBadge class="font-mono">{{ row.code }}</AppBadge></td>
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

    <AppModal v-model:open="modalOpen" :title="editingId ? 'Edit Subject' : 'Add Subject'">
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <AppFormField label="Subject name" help="e.g. Mathematics">
            <AppInput v-model="form.name" placeholder="Mathematics" />
          </AppFormField>

          <AppFormField label="Subject code" help="e.g. MTH">
            <AppInput v-model="form.code" placeholder="MTH" />
          </AppFormField>

          <div class="flex justify-end gap-2 pt-2">
            <AppButton type="button" color="neutral" variant="ghost" @click="modalOpen = false">Cancel</AppButton>
            <AppButton type="submit" :loading="saving">{{ editingId ? 'Save changes' : 'Create subject' }}</AppButton>
          </div>
        </form>
      </template>
    </AppModal>

    <ConfirmDeleteModal
      v-model:open="deleteOpen"
      title="Delete subject?"
      description="Any teacher assignments for this subject will also be removed."
      :loading="deleting"
      @confirm="handleDelete"
    />
  </div>
</template>
