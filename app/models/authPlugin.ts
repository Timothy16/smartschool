import bcrypt from 'bcryptjs'
import type { Schema } from 'mongoose'

/**
 * Shared password hashing + verification behaviour for Admin/Teacher/Student.
 * Kept as a schema plugin since the logic is identical across all three collections.
 */
export function authPlugin(schema: Schema) {
  schema.pre('save', async function (next) {
    if (this.isModified('password') && this.get('password')) {
      this.set('password', await bcrypt.hash(this.get('password'), 10))
    }
    next()
  })

  schema.methods.verifyPassword = async function (password: string): Promise<boolean> {
    if (!this.password) return false
    return bcrypt.compare(password, this.password)
  }
}
