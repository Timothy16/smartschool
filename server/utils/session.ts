import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export type UserModel = 'Admin' | 'Teacher' | 'Student'

export interface SessionData {
  userId: string
  email: string
  userModel: UserModel
}

const COOKIE_NAME = 'school_session'

function getSecret(): string {
  const { sessionSecret } = useRuntimeConfig()
  if (!sessionSecret || sessionSecret.length < 32) {
    // Never expose the misconfiguration detail to the client.
    throw createError({ statusCode: 500, message: 'Something went wrong. Please try again.' })
  }
  return sessionSecret
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

/**
 * The session cookie carries its own HMAC signature so it can't be forged or
 * tampered with by a client crafting a raw Cookie header (httpOnly only stops
 * JS access - it does nothing to stop a hand-built HTTP request).
 */
export function setUserSession(event: H3Event, session: SessionData) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const signature = sign(payload)

  setCookie(event, COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
}

export function clearUserSession(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getUserSession(event: H3Event): SessionData | null {
  const raw = getCookie(event, COOKIE_NAME)
  if (!raw) return null

  const separatorIndex = raw.lastIndexOf('.')
  if (separatorIndex === -1) return null

  const payload = raw.slice(0, separatorIndex)
  const signature = raw.slice(separatorIndex + 1)

  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!session?.userId || !session?.userModel) return null
    return session
  } catch {
    return null
  }
}

export function requireRole(event: H3Event, role: UserModel): SessionData {
  const session = getUserSession(event)
  if (!session) {
    throw createError({ statusCode: 401, message: 'Please log in to continue.' })
  }
  if (session.userModel !== role) {
    throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
  }
  return session
}
