import { Teacher } from '~/models/Teacher.model'

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, 'Admin')

    const body = await readBody(event)
    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!firstName || !lastName || !email || !password) {
      throw createError({ statusCode: 400, message: 'First name, last name, email and password are required.' })
    }

    const created = await Teacher.create({ firstName, lastName, email, password })
    const { password: _omit, ...teacher } = created.toObject()

    return { success: true, teacher }
  } catch (error: any) {
    console.error('[teachers/index.post]', error)
    throw toUserError(error)
  }
})
