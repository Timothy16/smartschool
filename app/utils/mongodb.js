// utils/mongodb.ts
import mongoose from 'mongoose'

export async function ensureConnection() {
  try {
    if (mongoose.connection.readyState !== 1) {
      const config = useRuntimeConfig()
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000
      })
    }
    return true
  } catch (error) {
    console.error('MongoDB Connection Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Database connection failed'
    })
  }
}