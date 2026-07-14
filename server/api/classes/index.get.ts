import { Class } from '~/models/Class.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
     await ensureConnection();
      await import('~/models/Class.model');
    requireRole(event, 'Admin')

    const classes = await Class.find()
      .populate('formTeacherId', 'firstName lastName email')
      .sort({ session: -1, name: 1 })

    return { success: true, classes }
  } catch (error: any) {
    console.error('[classes/index.get]', error)
    throw toUserError(error)
  }
})
