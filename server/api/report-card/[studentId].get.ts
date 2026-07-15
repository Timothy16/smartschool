import { Assessment } from '~/models/Assessment.model'
import { ensureConnection } from '~/utils/mongodb'

const VALID_TERMS = ['First', 'Second', 'Third']

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()

    const session = getUserSession(event)
    if (!session || (session.userModel !== 'Admin' && session.userModel !== 'Student')) {
      throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
    }

    const studentId = getRouterParam(event, 'studentId')
    if (session.userModel === 'Student' && studentId !== session.userId) {
      throw createError({ statusCode: 403, message: 'You are not allowed to perform this action.' })
    }

    const settings = await getOrCreateSettings()
    const query = getQuery(event)
    const term = typeof query.term === 'string' && VALID_TERMS.includes(query.term) ? query.term : settings.currentTerm
    const academicSession = typeof query.session === 'string' && query.session.trim() ? query.session.trim() : settings.currentSession

    const reportCard = await buildStudentReportCard(studentId!, term, academicSession, settings)

    const periodDocs = await Assessment.find({ studentId }).select('term session').lean()
    const periodMap = new Map<string, { term: string; session: string }>()
    for (const p of periodDocs) periodMap.set(`${p.term}__${p.session}`, { term: p.term, session: p.session })
    periodMap.set(`${settings.currentTerm}__${settings.currentSession}`, { term: settings.currentTerm, session: settings.currentSession })
    const availablePeriods = Array.from(periodMap.values()).sort((a, b) =>
      a.session === b.session ? a.term.localeCompare(b.term) : a.session.localeCompare(b.session)
    )

    return { success: true, ...reportCard, availablePeriods }
  } catch (error: any) {
    console.error('[report-card/[studentId].get]', error)
    throw toUserError(error)
  }
})
