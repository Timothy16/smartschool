<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const toast = useToast()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    const user = await auth.login(email.value, password.value)
    await navigateTo(dashboardPathFor(user.userModel))
  } catch (error: any) {
    toast.add({
      title: 'Login failed',
      description: error?.data?.message || 'Invalid email or password.',
      color: 'danger',
      icon: 'lucide:shield-alert'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppCard class="shadow-2xl shadow-brand-500/10 backdrop-blur-sm bg-surface/90">
    <template #header>
      <div class="flex flex-col items-center gap-3 py-2">
        <div class="flex items-center justify-center size-14 rounded-2xl bg-brand-50 ring-1 ring-brand-600/20 dark:bg-brand-900/40">
          <Icon name="lucide:graduation-cap" class="size-8 text-brand-600 dark:text-brand-400" />
        </div>
        <div class="text-center">
          <h1 class="font-display text-h3 text-ink-heading">Welcome back</h1>
          <p class="text-sm text-ink-muted mt-1">Sign in to Smart School to continue</p>
        </div>
      </div>
    </template>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <AppFormField label="Email">
        <AppInput v-model="email" type="email" placeholder="you@school.com" icon="lucide:mail" size="lg" autofocus />
      </AppFormField>

      <AppFormField label="Password">
        <AppInput v-model="password" type="password" placeholder="••••••••" icon="lucide:lock" size="lg" />
      </AppFormField>

      <AppButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        trailing-icon="lucide:arrow-right"
        class="active:scale-[0.98] transition-transform"
      >
        Log in
      </AppButton>
    </form>

    <template #footer>
      <p class="text-center text-xs text-ink-muted">
        Access is provisioned by your school administrator.
      </p>
    </template>
  </AppCard>
</template>
