export type UserModel = 'Admin' | 'Teacher' | 'Student'

export interface SessionUser {
  id: string
  firstName: string
  lastName: string
  email: string
  userModel: UserModel
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as SessionUser | null,
    initialized: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.user?.userModel ?? null
  },
  actions: {
    async fetchSession() {
      const requestFetch = useRequestFetch()
      const res = await requestFetch('/api/auth/session')
      this.user = res.user as SessionUser | null
      this.initialized = true
    },
    async login(email: string, password: string) {
      const res = await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
      this.user = res.user as SessionUser
      this.initialized = true
      return this.user
    },
    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
    }
  }
})
