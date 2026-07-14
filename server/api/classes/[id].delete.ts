import { Class } from '~/models/Class.model'
import { Assignment } from '~/models/Assignment.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const deleted = await Class.findByIdAndDelete(id)
    if (!deleted) {
      throw createError({ statusCode: 404, message: 'That class could not be found.' })
    }

    await Assignment.deleteMany({ classId: id })

    return { success: true }
  } catch (error: any) {
    console.error('[classes/[id].delete]', error)
    throw toUserError(error)
  }
})
