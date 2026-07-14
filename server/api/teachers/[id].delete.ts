import { Teacher } from '~/models/Teacher.model'
import { Assignment } from '~/models/Assignment.model'
import { Class } from '~/models/Class.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const deleted = await Teacher.findByIdAndDelete(id)
    if (!deleted) {
      throw createError({ statusCode: 404, message: 'That teacher could not be found.' })
    }

    await Promise.all([
      Assignment.deleteMany({ teacherId: id }),
      Class.updateMany({ formTeacherId: id }, { formTeacherId: null })
    ])

    return { success: true }
  } catch (error: any) {
    console.error('[teachers/[id].delete]', error)
    throw toUserError(error)
  }
})
