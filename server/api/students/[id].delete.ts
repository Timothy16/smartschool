import { Student } from '~/models/Student.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const deleted = await Student.findByIdAndDelete(id)
    if (!deleted) {
      throw createError({ statusCode: 404, message: 'That student could not be found.' })
    }

    return { success: true }
  } catch (error: any) {
    console.error('[students/[id].delete]', error)
    throw toUserError(error)
  }
})
