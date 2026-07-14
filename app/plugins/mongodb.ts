// plugins/mongodb.ts
import mongoose from 'mongoose'

export default defineNuxtPlugin(async () => {
  if (process.server) {
    // Server-side code
    const config = useRuntimeConfig()
    if (!config.mongodbUri) {
      throw new Error('MongoDB URI is not configured')
    }
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongodbUri)
      console.log('MongoDB connected successfully')
    }
  } else {
    // Client-side code
    console.log('Client-side code, MongoDB connection skipped')
  }
})

