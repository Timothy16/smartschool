import { Assignment } from '~/models/Assignment.model'
import { ensureConnection } from '~/utils/mongodb';
export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    const session = requireRole(event, 'Teacher')

    const assignments = await Assignment.find({ teacherId: session.userId })
      .populate('classId', 'name session')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })

    return { success: true, assignments }
  } catch (error: any) {
    console.error('[teacher/assignments.get]', error)
    throw toUserError(error)
  }
})
