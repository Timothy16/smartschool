import { Student } from '~/models/Student.model'
import { Class } from '~/models/Class.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const student = await Student.findById(id)
    if (!student) {
      throw createError({ statusCode: 404, message: 'That student could not be found.' })
    }

    if (typeof body?.firstName === 'string') student.firstName = body.firstName.trim()
    if (typeof body?.lastName === 'string') student.lastName = body.lastName.trim()
    if (typeof body?.email === 'string') student.email = body.email.trim().toLowerCase() || null
    if (typeof body?.admissionNumber === 'string') student.admissionNumber = body.admissionNumber.trim()
    if ('classId' in (body || {})) {
      const classId = typeof body.classId === 'string' && body.classId ? body.classId : null
      if (classId && !(await Class.exists({ _id: classId }))) {
        throw createError({ statusCode: 400, message: 'That class could not be found.' })
      }
      student.classId = classId as any
    }
    if (typeof body?.isActive === 'boolean') student.isActive = body.isActive
    if (typeof body?.password === 'string' && body.password) student.password = body.password

    await student.save()
    const { password: _omit, ...safeStudent } = student.toObject()

    return { success: true, student: safeStudent }
  } catch (error: any) {
    console.error('[students/[id].patch]', error)
    throw toUserError(error)
  }
})
