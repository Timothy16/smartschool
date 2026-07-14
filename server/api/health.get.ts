import mongoose from 'mongoose'

export default defineEventHandler(() => {
  const connected = mongoose.connection.readyState === 1
  return { success: connected, db: connected ? 'connected' : 'disconnected' }
})
