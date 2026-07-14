import { Teacher } from '~/models/Teacher.model'
import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const teachers = await Teacher.find().select('-password').sort({ firstName: 1 })
    return { success: true, teachers }
  } catch (error: any) {
    console.error('[teachers/index.get]', error)
    throw toUserError(error)
  }
})
