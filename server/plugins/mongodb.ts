import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  const { mongodbUri } = useRuntimeConfig()
  if (!mongodbUri) {
    console.error('[mongodb] MONGODB_URI is not set')
    return
  }

  try {
    await mongoose.connect(mongodbUri)
    console.log('[mongodb] connected')
  } catch (error) {
    console.error('[mongodb] failed to connect', error)
  }
})
