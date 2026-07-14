import { Teacher } from '~/models/Teacher.model'

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const teacher = await Teacher.findById(id)
    if (!teacher) {
      throw createError({ statusCode: 404, message: 'That teacher could not be found.' })
    }

    if (typeof body?.firstName === 'string') teacher.firstName = body.firstName.trim()
    if (typeof body?.lastName === 'string') teacher.lastName = body.lastName.trim()
    if (typeof body?.email === 'string') teacher.email = body.email.trim().toLowerCase()
    if (typeof body?.isActive === 'boolean') teacher.isActive = body.isActive
    if (typeof body?.password === 'string' && body.password) teacher.password = body.password

    await teacher.save()
    const { password: _omit, ...safeTeacher } = teacher.toObject()

    return { success: true, teacher: safeTeacher }
  } catch (error: any) {
    console.error('[teachers/[id].patch]', error)
    throw toUserError(error)
  }
})
