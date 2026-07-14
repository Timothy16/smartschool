import { Subject } from '~/models/Subject.model'
import { Assignment } from '~/models/Assignment.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const deleted = await Subject.findByIdAndDelete(id)
    if (!deleted) {
      throw createError({ statusCode: 404, message: 'That subject could not be found.' })
    }

    await Assignment.deleteMany({ subjectId: id })

    return { success: true }
  } catch (error: any) {
    console.error('[subjects/[id].delete]', error)
    throw toUserError(error)
  }
})
