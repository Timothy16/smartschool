import { ensureConnection } from '~/utils/mongodb';

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection();
    requireRole(event, 'Admin')

    const settings = await getOrCreateSettings()
    return { success: true, settings }
  } catch (error: any) {
    console.error('[settings/index.get]', error)
    throw toUserError(error)
  }
})
