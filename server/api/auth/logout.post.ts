export default defineEventHandler((event) => {
  clearUserSession(event)
  return { success: true }
})
