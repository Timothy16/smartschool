import { ensureConnection } from '~/utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()
    requireRole(event, 'Admin')

    const settings = await getOrCreateSettings()
    const { summary, flagged } = await buildSchoolAnalytics(settings)

    return { success: true, summary, flagged, passMark: settings.passMark }
  } catch (error: any) {
    console.error('[analytics/school.get]', error)
    throw toUserError(error)
  }
})
