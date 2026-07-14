import { Assignment } from '~/models/Assignment.model'
import { ensureConnection } from '~/utils/mongodb';


export default defineEventHandler(async (event) => {
  try {
     await ensureConnection();
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const deleted = await Assignment.findByIdAndDelete(id)
    if (!deleted) {
      throw createError({ statusCode: 404, message: 'That assignment could not be found.' })
    }

    return { success: true }
  } catch (error: any) {
    console.error('[assignments/[id].delete]', error)
    throw toUserError(error)
  }
})
