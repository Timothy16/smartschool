import { Admin } from '~/models/Admin.model'
import { Teacher } from '~/models/Teacher.model'
import { Student } from '~/models/Student.model'

export type AccountModel = 'Admin' | 'Teacher' | 'Student'

/**
 * Admin/Teacher/Student are separate collections, each only unique against
 * itself - without this, a new account could silently reuse another role's
 * email, and login (which resolves an email to the first matching collection
 * in Admin -> Teacher -> Student order) would make the shadowed account
 * permanently unreachable with no error pointing at why.
 */
export async function assertEmailAvailableAcrossRoles(email: string, ownModel: AccountModel) {
  const others: { model: typeof Admin | typeof Teacher | typeof Student }[] = []
  if (ownModel !== 'Admin') others.push({ model: Admin })
  if (ownModel !== 'Teacher') others.push({ model: Teacher })
  if (ownModel !== 'Student') others.push({ model: Student })

  for (const { model } of others) {
    if (await model.exists({ email })) {
      throw createError({ statusCode: 409, message: 'That email is already in use by another account.' })
    }
  }
}
