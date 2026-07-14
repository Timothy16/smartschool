import { Student } from '~/models/Student.model'

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, 'Admin')

    const students = await Student.find()
      .select('-password')
      .populate('classId', 'name session')
      .sort({ firstName: 1 })

    return { success: true, students }
  } catch (error: any) {
    console.error('[students/index.get]', error)
    throw toUserError(error)
  }
})
