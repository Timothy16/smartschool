import { Class } from '~/models/Class.model'
import { ensureConnection } from '~/utils/mongodb'

const VALID_TERMS = ['First', 'Second', 'Third']

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()
    requireRole(event, 'Admin')

    const classId = getRouterParam(event, 'classId')
    const klass = await Class.findById(classId)
    if (!klass) {
      throw createError({ statusCode: 404, message: 'Class not found.' })
    }

    const settings = await getOrCreateSettings()
    const query = getQuery(event)
    const term = typeof query.term === 'string' && VALID_TERMS.includes(query.term) ? query.term : settings.currentTerm
    const academicSession = typeof query.session === 'string' && query.session.trim() ? query.session.trim() : settings.currentSession

    const students = await buildClassResults(classId!, term, academicSession, settings)

    return { success: true, class: klass, term, session: academicSession, students }
  } catch (error: any) {
    console.error('[report-card/class/[classId].get]', error)
    throw toUserError(error)
  }
})
