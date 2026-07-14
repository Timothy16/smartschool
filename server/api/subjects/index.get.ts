import { Subject } from '~/models/Subject.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
     await ensureConnection();
    requireRole(event, 'Admin')

    const subjects = await Subject.find().sort({ name: 1 })
    return { success: true, subjects }
  } catch (error: any) {
    console.error('[subjects/index.get]', error)
    throw toUserError(error)
  }
})
