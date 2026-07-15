import { Class } from '~/models/Class.model'
import { Subject } from '~/models/Subject.model'
import { ensureConnection } from '~/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()
    requireRole(event, 'Admin')

    const query = getQuery(event)
    const classId = typeof query.classId === 'string' ? query.classId : ''
    const subjectId = typeof query.subjectId === 'string' ? query.subjectId : ''
    if (!classId || !subjectId) {
      throw createError({ statusCode: 400, message: 'A class and subject are required.' })
    }

    const [klass, subject] = await Promise.all([Class.findById(classId), Subject.findById(subjectId)])
    if (!klass || !subject) {
      throw createError({ statusCode: 404, message: 'Class or subject not found.' })
    }

    const settings = await getOrCreateSettings()
    const students = await buildSubjectAnalytics(classId, subjectId, settings)

    return { success: true, class: klass, subject, passMark: settings.passMark, students }
  } catch (error: any) {
    console.error('[analytics/subject.get]', error)
    throw toUserError(error)
  }
})
