<script setup lang="ts">
const mobileMenuOpen = ref(false)
const auth = useAuthStore()
const route = useRoute()

const navItems = computed(() => {
  switch (auth.role) {
    case 'Admin':
      return [
        { label: 'Dashboard', to: '/admin', icon: 'lucide:layout-dashboard' },
        { label: 'Classes', to: '/admin/classes', icon: 'lucide:school' },
        { label: 'Subjects', to: '/admin/subjects', icon: 'lucide:book-open' },
        { label: 'Teachers', to: '/admin/teachers', icon: 'lucide:user-round' },
        { label: 'Students', to: '/admin/students', icon: 'lucide:users' },
        { label: 'Assignments', to: '/admin/assignments', icon: 'lucide:link-2' },
        { label: 'Results', to: '/admin/results', icon: 'lucide:file-text' },
        { label: 'Analytics', to: '/admin/analytics', icon: 'lucide:activity' },
        { label: 'Settings', to: '/admin/settings', icon: 'lucide:settings' }
      ]
    case 'Teacher':
      return [{ label: 'Dashboard', to: '/teacher', icon: 'lucide:layout-dashboard' }]
    case 'Student':
      return [{ label: 'Dashboard', to: '/student', icon: 'lucide:layout-dashboard' }]
    default:
      return []
  }
})

const initials = computed(() => {
  const first = auth.user?.firstName?.[0] ?? ''
  const last = auth.user?.lastName?.[0] ?? ''
  return `${first}${last}`.toUpperCase()
})

watch(
  () => route.path,
  () => {
    mobileMenuOpen.value = false
  }
)

async function handleLogout() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-page print:h-auto print:overflow-visible">
    <!-- Mobile backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 bg-ink-heading/50 md:hidden" @click="mobileMenuOpen = false" />
    </Transition>

    <!-- Mobile slide-over sidebar -->
    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      leave-active-class="transition-transform duration-150 ease-in"
      enter-from-class="-translate-x-full"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-show="mobileMenuOpen"
        class="fixed inset-y-0 left-0 z-50 w-64 bg-surface ring-1 ring-line md:hidden print:hidden"
      >
        <SidebarNav :nav-items="navItems" @navigate="mobileMenuOpen = false" />
      </aside>
    </Transition>

    <!-- Desktop static sidebar -->
    <aside class="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-line bg-surface print:hidden">
      <SidebarNav :nav-items="navItems" />
    </aside>

    <div class="flex flex-1 flex-col min-w-0">
      <header class="h-16 shrink-0 flex items-center justify-between border-b border-line bg-surface px-4 print:hidden">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="md:hidden text-ink-muted hover:text-ink"
            @click="mobileMenuOpen = true"
          >
            <Icon name="lucide:menu" class="size-5" />
          </button>
          <slot name="title">
            <h1 class="font-display font-medium text-ink-heading">Dashboard</h1>
          </slot>
        </div>

        <div class="flex items-center gap-2">
          <ColorModeToggle />

          <AppDropdown v-if="auth.user">
            <template #trigger>
              <button type="button" class="flex items-center gap-2 rounded-lg py-1.5 pl-2 pr-3 hover:bg-muted">
                <AppAvatar :text="initials" size="sm" />
                <span class="text-sm font-medium text-ink hidden sm:inline">{{ auth.user.firstName }}</span>
                <AppBadge v-if="auth.role" color="brand">{{ auth.role }}</AppBadge>
              </button>
            </template>

            <div class="px-3 py-2 text-xs text-ink-muted truncate border-b border-line">
              {{ auth.user.email }}
            </div>
            <button
              type="button"
              class="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-muted"
              @click="handleLogout"
            >
              <Icon name="lucide:log-out" class="size-4" />
              Log out
            </button>
          </AppDropdown>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">
        <slot />
      </main>
    </div>
  </div>
</template>
