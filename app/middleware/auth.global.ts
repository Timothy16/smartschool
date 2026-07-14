import type { UserModel } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.fetchSession()
  }

  const requiredRole = to.meta.role as UserModel | undefined

  if (to.path === '/login') {
    if (auth.isAuthenticated) {
      return navigateTo(dashboardPathFor(auth.role))
    }
    return
  }

  if (!requiredRole) return

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  if (auth.role !== requiredRole) {
    return navigateTo(dashboardPathFor(auth.role))
  }
})
