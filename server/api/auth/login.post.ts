import mongoose from 'mongoose'
import { Admin } from '~/models/Admin.model'
import { Teacher } from '~/models/Teacher.model'
import { Student } from '~/models/Student.model'
import type { UserModel } from '../../utils/session'

const MODELS: { name: UserModel; model: mongoose.Model<any> }[] = [
  { name: 'Admin', model: Admin },
  { name: 'Teacher', model: Teacher },
  { name: 'Student', model: Student }
]

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!email || !password) {
      throw createError({ statusCode: 400, message: 'Email and password are required.' })
    }

    const rateLimitKey = `${email}:${getRequestIP(event) || 'unknown'}`
    assertNotRateLimited(rateLimitKey)

    const invalidCredentials = () => {
      recordFailedLogin(rateLimitKey)
      throw createError({ statusCode: 401, message: 'Invalid email or password.' })
    }

    let matched: { name: UserModel; doc: any } | null = null
    for (const { name, model } of MODELS) {
      const doc = await model.findOne({ email })
      if (doc) {
        matched = { name, doc }
        break
      }
    }

    if (!matched || !matched.doc.isActive) {
      return invalidCredentials()
    }

    const validPassword = await matched.doc.verifyPassword(password)
    if (!validPassword) {
      return invalidCredentials()
    }

    clearLoginAttempts(rateLimitKey)

    setUserSession(event, {
      userId: matched.doc._id.toString(),
      email: matched.doc.email,
      userModel: matched.name
    })

    const { firstName, lastName, _id } = matched.doc
    return {
      success: true,
      user: { id: _id, firstName, lastName, email: matched.doc.email, userModel: matched.name }
    }
  } catch (error: any) {
    console.error('[auth/login]', error)
    throw toUserError(error)
  }
})
