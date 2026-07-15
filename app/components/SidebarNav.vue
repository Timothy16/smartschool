<script setup lang="ts">
defineProps<{
  navItems: { label: string; to: string; icon: string }[]
}>()

const emit = defineEmits<{ navigate: [] }>()

const route = useRoute()
const auth = useAuthStore()

async function handleLogout() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="h-16 flex items-center gap-2 px-4 border-b border-line">
      <img src="/logo.png" alt="Smart School" class="size-8 rounded-lg">

      <span class="font-display font-semibold text-ink-heading">Smart School</span>
    </div>

    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        :class="
          route.path === item.to
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
            : 'text-ink-muted hover:bg-muted'
        "
        @click="emit('navigate')"
      >
        <Icon :name="item.icon" class="size-4 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <div class="p-3 border-t border-line">
      <button
        type="button"
        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-muted"
        @click="handleLogout"
      >
        <Icon name="lucide:log-out" class="size-4" />
        Log out
      </button>
    </div>
  </div>
</template>
