const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const LOCKOUT_MS = 15 * 60 * 1000

interface Attempt {
  count: number
  firstAttemptAt: number
  lockedUntil: number | null
}

const attempts = new Map<string, Attempt>()

/** Throws 429 if this key (email+ip) is currently locked out from too many failed logins. */
export function assertNotRateLimited(key: string) {
  const entry = attempts.get(key)
  if (!entry) return

  if (entry.lockedUntil && entry.lockedUntil > Date.now()) {
    throw createError({
      statusCode: 429,
      message: 'Too many failed attempts. Please try again later.'
    })
  }
}

export function recordFailedLogin(key: string) {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now, lockedUntil: null })
    return
  }

  entry.count += 1
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS
  }
}

export function clearLoginAttempts(key: string) {
  attempts.delete(key)
}
