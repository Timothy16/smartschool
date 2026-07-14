import mongoose from 'mongoose'
import { Admin } from '~/models/Admin.model'
import { Teacher } from '~/models/Teacher.model'
import { Student } from '~/models/Student.model'
import type { UserModel } from '../../utils/session'

const MODELS: Record<UserModel, mongoose.Model<any>> = {
  Admin,
  Teacher,
  Student
}

export default defineEventHandler(async (event) => {
  try {
    const session = getUserSession(event)
    if (!session) {
      return { success: true, user: null }
    }

    const doc = await MODELS[session.userModel].findById(session.userId)
    if (!doc || !doc.isActive) {
      clearUserSession(event)
      return { success: true, user: null }
    }

    const { firstName, lastName, email, _id } = doc
    return {
      success: true,
      user: { id: _id, firstName, lastName, email, userModel: session.userModel }
    }
  } catch (error: any) {
    console.error('[auth/session]', error)
    throw toUserError(error)
  }
})
