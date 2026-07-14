import { timingSafeEqual } from 'node:crypto'
import { Admin } from '~/models/Admin.model'

function secretsMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

/**
 * One-off, self-disabling setup route: creates the first Admin account.
 * Requires the SEED_SECRET header and refuses once any Admin already exists,
 * since there is no public admin signup.
 */
export default defineEventHandler(async (event) => {
  try {
    const { seedSecret } = useRuntimeConfig()
    const providedSecret = getHeader(event, 'x-seed-secret') || ''

    if (!seedSecret || !secretsMatch(providedSecret, seedSecret)) {
      throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
    }

    const alreadySeeded = await Admin.exists({})
    if (alreadySeeded) {
      throw createError({ statusCode: 403, message: 'Setup has already been completed.' })
    }

    const body = await readBody(event)
    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!firstName || !lastName || !email || !password) {
      throw createError({ statusCode: 400, message: 'First name, last name, email and password are required.' })
    }

    const admin = await Admin.create({ firstName, lastName, email, password })

    return {
      success: true,
      user: { id: admin._id, firstName: admin.firstName, lastName: admin.lastName, email: admin.email }
    }
  } catch (error: any) {
    console.error('[auth/seed-admin]', error)
    throw toUserError(error)
  }
})
