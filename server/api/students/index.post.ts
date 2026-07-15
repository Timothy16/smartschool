import { Student } from '~/models/Student.model'
import { Class } from '~/models/Class.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const body = await readBody(event)
    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : ''
    const email = typeof body?.email === 'string' && body.email.trim() ? body.email.trim().toLowerCase() : null
    const password = typeof body?.password === 'string' ? body.password : ''
    const admissionNumber = typeof body?.admissionNumber === 'string' ? body.admissionNumber.trim() : ''
    const classId = typeof body?.classId === 'string' && body.classId ? body.classId : null

    if (!firstName || !lastName || !password || !admissionNumber) {
      throw createError({ statusCode: 400, message: 'First name, last name, admission number and password are required.' })
    }

    if (classId && !(await Class.exists({ _id: classId }))) {
      throw createError({ statusCode: 400, message: 'That class could not be found.' })
    }

    if (email) await assertEmailAvailableAcrossRoles(email, 'Student')

    const created = await Student.create({ firstName, lastName, email, password, admissionNumber, classId })
    const { password: _omit, ...student } = created.toObject()

    return { success: true, student }
  } catch (error: any) {
    console.error('[students/index.post]', error)
    throw toUserError(error)
  }
})
