import { Class } from '~/models/Class.model'
import { Teacher } from '~/models/Teacher.model'
import { ensureConnection } from '~/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()
    requireRole(event, 'Admin')

    const body = await readBody(event)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const session = typeof body?.session === 'string' ? body.session.trim() : ''
    const formTeacherId = typeof body?.formTeacherId === 'string' && body.formTeacherId ? body.formTeacherId : null

    if (!name || !session) {
      throw createError({ statusCode: 400, message: 'Class name and session are required.' })
    }

    if (formTeacherId && !(await Teacher.exists({ _id: formTeacherId }))) {
      throw createError({ statusCode: 400, message: 'That form teacher could not be found.' })
    }

    const created = await Class.create({ name, session, formTeacherId })
    return { success: true, class: created }
  } catch (error: any) {
    console.error('[classes/index.post]', error)
    throw toUserError(error)
  }
})
