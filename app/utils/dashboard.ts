import type { UserModel } from '~/stores/auth'

export function dashboardPathFor(role: UserModel | null) {
  switch (role) {
    case 'Admin':
      return '/admin'
    case 'Teacher':
      return '/teacher'
    case 'Student':
      return '/student'
    default:
      return '/login'
  }
}
