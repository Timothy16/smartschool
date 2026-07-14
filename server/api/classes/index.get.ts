import { Class } from '~/models/Class.model'

export default defineEventHandler(async (event) => {
  try {
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
