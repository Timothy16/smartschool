import { Class } from '~/models/Class.model'
import { Teacher } from '~/models/Teacher.model'

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, 'Admin')

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const update: Record<string, any> = {}
    if (typeof body?.name === 'string') update.name = body.name.trim()
    if (typeof body?.session === 'string') update.session = body.session.trim()

    if ('formTeacherId' in (body || {})) {
      const formTeacherId = typeof body.formTeacherId === 'string' && body.formTeacherId ? body.formTeacherId : null
      if (formTeacherId && !(await Teacher.exists({ _id: formTeacherId }))) {
        throw createError({ statusCode: 400, message: 'That form teacher could not be found.' })
      }
      update.formTeacherId = formTeacherId
    }

    const updated = await Class.findByIdAndUpdate(id, update, { new: true, runValidators: true })
    if (!updated) {
      throw createError({ statusCode: 404, message: 'That class could not be found.' })
    }

    return { success: true, class: updated }
  } catch (error: any) {
    console.error('[classes/[id].patch]', error)
    throw toUserError(error)
  }
})
