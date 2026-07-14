import { Subject } from '~/models/Subject.model'

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, 'Admin')

    const subjects = await Subject.find().sort({ name: 1 })
    return { success: true, subjects }
  } catch (error: any) {
    console.error('[subjects/index.get]', error)
    throw toUserError(error)
  }
})
