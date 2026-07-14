import { Assignment } from '~/models/Assignment.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
     await ensureConnection();
      await import('~/models/Teacher.model');
    requireRole(event, 'Admin')

    const assignments = await Assignment.find()
      .populate('teacherId', 'firstName lastName email')
      .populate('classId', 'name session')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })

    return { success: true, assignments }
  } catch (error: any) {
    console.error('[assignments/index.get]', error)
    throw toUserError(error)
  }
})
