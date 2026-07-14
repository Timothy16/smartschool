import { Assignment } from '~/models/Assignment.model'
import { Student } from '~/models/Student.model'
import { Assessment } from '~/models/Assessment.model'
import { ensureConnection } from '~/utils/mongodb';

const VALID_TYPES = ['assignment', 'test', 'exam']

export default defineEventHandler(async (event) => {
  try {
     await ensureConnection();
    const session = requireRole(event, 'Teacher')
    const assignmentId = getRouterParam(event, 'assignmentId')

    // Scoping check (rule 2): this teacher must own this exact class+subject assignment.
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment || assignment.teacherId.toString() !== session.userId) {
      throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
    }

    const body = await readBody(event)
    const studentId = typeof body?.studentId === 'string' ? body.studentId : ''
    const type = typeof body?.type === 'string' ? body.type : ''
    const score = Number(body?.score)
    const maxScore = Number(body?.maxScore)

    if (!studentId || !VALID_TYPES.includes(type)) {
      throw createError({ statusCode: 400, message: 'A student and a valid assessment type are required.' })
    }
    if (!Number.isFinite(maxScore) || maxScore <= 0) {
      throw createError({ statusCode: 400, message: 'Max score must be a positive number.' })
    }
    if (!Number.isFinite(score) || score < 0 || score > maxScore) {
      throw createError({ statusCode: 400, message: 'Score must be between 0 and the max score.' })
    }

    const belongsToClass = await Student.exists({ _id: studentId, classId: assignment.classId })
    if (!belongsToClass) {
      throw createError({ statusCode: 400, message: 'That student could not be found in this class.' })
    }

    // Term/session are never taken from the client - always the current ones from Settings (rule 8).
    const settings = await getOrCreateSettings()

    const saved = await Assessment.findOneAndUpdate(
      {
        studentId,
        subjectId: assignment.subjectId,
        term: settings.currentTerm,
        session: settings.currentSession,
        type
      },
      {
        studentId,
        subjectId: assignment.subjectId,
        classId: assignment.classId,
        term: settings.currentTerm,
        session: settings.currentSession,
        type,
        score,
        maxScore,
        enteredBy: session.userId
      },
      { upsert: true, new: true, runValidators: true }
    )

    return { success: true, assessment: saved }
  } catch (error: any) {
    console.error('[assessments/[assignmentId].post]', error)
    throw toUserError(error)
  }
})
