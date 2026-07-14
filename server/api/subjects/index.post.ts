import { Subject } from '~/models/Subject.model'
import { ensureConnection } from '~/utils/mongodb';
export default defineEventHandler(async (event) => {
  try {
     await ensureConnection();
    requireRole(event, 'Admin')

    const body = await readBody(event)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const code = typeof body?.code === 'string' ? body.code.trim() : ''

    if (!name || !code) {
      throw createError({ statusCode: 400, message: 'Subject name and code are required.' })
    }

    const created = await Subject.create({ name, code })
    return { success: true, subject: created }
  } catch (error: any) {
    console.error('[subjects/index.post]', error)
    throw toUserError(error)
  }
})
