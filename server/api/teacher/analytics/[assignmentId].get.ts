import { Assignment } from '~/models/Assignment.model'
import { ensureConnection } from '~/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()
    await import('~/models/Class.model')
    await import('~/models/Subject.model')

    const session = requireRole(event, 'Teacher')
    const assignmentId = getRouterParam(event, 'assignmentId')

    const assignment = await Assignment.findById(assignmentId)
      .populate('classId', 'name session')
      .populate('subjectId', 'name code')
    if (!assignment || assignment.teacherId.toString() !== session.userId) {
      throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
    }

    const settings = await getOrCreateSettings()
    const students = await buildSubjectAnalytics(
      (assignment.classId as any)._id.toString(),
      (assignment.subjectId as any)._id.toString(),
      settings
    )

    return { success: true, class: assignment.classId, subject: assignment.subjectId, passMark: settings.passMark, students }
  } catch (error: any) {
    console.error('[teacher/analytics/[assignmentId].get]', error)
    throw toUserError(error)
  }
})
