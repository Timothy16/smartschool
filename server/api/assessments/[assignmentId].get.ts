import { Assignment } from '~/models/Assignment.model'
import { Student } from '~/models/Student.model'
import { Assessment } from '~/models/Assessment.model'

export default defineEventHandler(async (event) => {
  try {
    const session = requireRole(event, 'Teacher')
    const assignmentId = getRouterParam(event, 'assignmentId')

    const assignment = await Assignment.findById(assignmentId)
      .populate('classId', 'name session')
      .populate('subjectId', 'name code')
    if (!assignment || assignment.teacherId.toString() !== session.userId) {
      throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
    }

    const settings = await getOrCreateSettings()

    const students = await Student.find({ classId: assignment.classId, isActive: true })
      .select('firstName lastName admissionNumber')
      .sort({ firstName: 1 })

    const assessments = await Assessment.find({
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      term: settings.currentTerm,
      session: settings.currentSession
    })

    return {
      success: true,
      term: settings.currentTerm,
      session: settings.currentSession,
      class: assignment.classId,
      subject: assignment.subjectId,
      students,
      assessments
    }
  } catch (error: any) {
    console.error('[assessments/[assignmentId].get]', error)
    throw toUserError(error)
  }
})
