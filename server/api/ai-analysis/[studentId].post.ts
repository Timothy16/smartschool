import { AiAnalysis } from '~/models/AiAnalysis.model'
import { ensureConnection } from '~/utils/mongodb'

const VALID_TERMS = ['First', 'Second', 'Third']

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()
    const adminSession = requireRole(event, 'Admin')

    const studentId = getRouterParam(event, 'studentId')
    const body = await readBody(event)
    const settings = await getOrCreateSettings()

    const term = typeof body?.term === 'string' && VALID_TERMS.includes(body.term) ? body.term : settings.currentTerm
    const academicSession = typeof body?.session === 'string' && body.session.trim() ? body.session.trim() : settings.currentSession

    const reportCard = await buildStudentReportCard(studentId!, term, academicSession, settings)

    const scoredSubjects = reportCard.subjects.filter((s: any) => s.hasAnyScore)
    if (!scoredSubjects.length) {
      throw createError({ statusCode: 400, message: 'This student has no recorded scores for this term yet.' })
    }

    const config = useRuntimeConfig(event)
    const generated = await generateResultAnalysis(
      `${reportCard.student.firstName} ${reportCard.student.lastName}`,
      term,
      academicSession,
      scoredSubjects,
      reportCard.overallAverage,
      settings.passMark,
      config.deepseekApiKey
    )

    // Never trust subject identity coming back from the model - match its "code"
    // against our own report-card subjects and pull the real subjectId/name from there.
    const bySubjectCode = new Map(scoredSubjects.map((s: any) => [String(s.code).toLowerCase(), s]))
    const subjects = generated.subjects
      .map((g) => {
        const match: any = bySubjectCode.get(g.code.toLowerCase())
        if (!match) return null
        return {
          subjectId: match.subjectId,
          name: match.name,
          code: match.code,
          performanceSummary: g.performanceSummary,
          strengths: g.strengths,
          weaknesses: g.weaknesses,
          recommendations: g.recommendations,
          topicsToReview: g.topicsToReview,
          suggestedBooks: g.suggestedBooks
        }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)

    if (!subjects.length) {
      throw new Error('DeepSeek response did not match any known subjects')
    }

    const analysis = await AiAnalysis.findOneAndUpdate(
      { studentId, term, session: academicSession },
      {
        studentId,
        term,
        session: academicSession,
        overallSummary: generated.overallSummary,
        subjects,
        visibility: 'draft',
        generatedBy: adminSession.userId,
        generatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return { success: true, analysis }
  } catch (error: any) {
    console.error('[ai-analysis/[studentId].post]', error)
    throw toUserError(error)
  }
})
