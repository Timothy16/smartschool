import { Subject } from '~/models/Subject.model'
import { ensureConnection } from '~/utils/mongodb';
export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const update: Record<string, any> = {}
    if (typeof body?.name === 'string') update.name = body.name.trim()
    if (typeof body?.code === 'string') update.code = body.code.trim()

    const updated = await Subject.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    if (!updated) {
      throw createError({ statusCode: 404, message: 'That subject could not be found.' })
    }

    return { success: true, subject: updated }
  } catch (error: any) {
    console.error('[subjects/[id].patch]', error)
    throw toUserError(error)
  }
})
