import { Assignment } from '~/models/Assignment.model'
import { Teacher } from '~/models/Teacher.model'
import { Class } from '~/models/Class.model'
import { Subject } from '~/models/Subject.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const body = await readBody(event)
    const teacherId = typeof body?.teacherId === 'string' ? body.teacherId : ''
    const classId = typeof body?.classId === 'string' ? body.classId : ''
    const subjectId = typeof body?.subjectId === 'string' ? body.subjectId : ''

    if (!teacherId || !classId || !subjectId) {
      throw createError({ statusCode: 400, message: 'Teacher, class and subject are all required.' })
    }

    const [teacher, klass, subject] = await Promise.all([
      Teacher.findById(teacherId),
      Class.findById(classId),
      Subject.findById(subjectId)
    ])
    if (!teacher || !klass || !subject) {
      throw createError({ statusCode: 400, message: 'That teacher, class or subject could not be found.' })
    }

    const existing = await Assignment.findOne({ classId, subjectId })
    if (existing) {
      throw createError({ statusCode: 409, message: 'This class and subject already has a teacher assigned.' })
    }

    const created = await Assignment.create({ teacherId, classId, subjectId })
    const populated = await created.populate([
      { path: 'teacherId', select: 'firstName lastName email' },
      { path: 'classId', select: 'name session' },
      { path: 'subjectId', select: 'name code' }
    ])

    return { success: true, assignment: populated }
  } catch (error: any) {
    console.error('[assignments/index.post]', error)
    throw toUserError(error)
  }
})
