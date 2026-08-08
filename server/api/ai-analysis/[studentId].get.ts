import { AiAnalysis } from '~/models/AiAnalysis.model'
import { Assignment } from '~/models/Assignment.model'
import { Student } from '~/models/Student.model'
import { ensureConnection } from '~/utils/mongodb'

const VALID_TERMS = ['First', 'Second', 'Third']

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()

    const session = getUserSession(event)
    if (!session) {
      throw createError({ statusCode: 401, message: 'Please log in to continue.' })
    }

    const studentId = getRouterParam(event, 'studentId')

    if (session.userModel === 'Admin' || session.userModel === 'Student') {
      if (session.userModel === 'Student' && studentId !== session.userId) {
        throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
      }

      const query = getQuery(event)
      const settings = await getOrCreateSettings()
      const term = typeof query.term === 'string' && VALID_TERMS.includes(query.term) ? query.term : settings.currentTerm
      const academicSession = typeof query.session === 'string' && query.session.trim() ? query.session.trim() : settings.currentSession

      const filter: Record<string, any> = { studentId, term, session: academicSession }
      if (session.userModel === 'Student') {
        filter.visibility = { $in: ['student', 'both'] }
      }

      const analysis = await AiAnalysis.findOne(filter)
      return { success: true, analysis }
    }

    if (session.userModel === 'Teacher') {
      const student = await Student.findById(studentId).select('classId')
      if (!student?.classId) {
        return { success: true, analysis: null }
      }

      const assignments = await Assignment.find({ teacherId: session.userId, classId: student.classId }).select('subjectId')
      const subjectIds = new Set(assignments.map((a) => a.subjectId.toString()))
      if (!subjectIds.size) {
        return { success: true, analysis: null }
      }

      const latest = await AiAnalysis.findOne({ studentId, visibility: { $in: ['teacher', 'both'] } }).sort({ generatedAt: -1 })
      if (!latest) {
        return { success: true, analysis: null }
      }

      const subjects = latest.subjects.filter((s) => subjectIds.has(s.subjectId.toString()))
      if (!subjects.length) {
        return { success: true, analysis: null }
      }

      // Teachers only ever see the subject(s) they teach this student - never the
      // whole-child overall summary, which spans subjects outside their scope.
      return { success: true, analysis: { term: latest.term, session: latest.session, subjects } }
    }

    throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
  } catch (error: any) {
    console.error('[ai-analysis/[studentId].get]', error)
    throw toUserError(error)
  }
})
