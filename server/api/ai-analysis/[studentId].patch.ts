import { AiAnalysis } from '~/models/AiAnalysis.model'
import { ensureConnection } from '~/utils/mongodb'

const VALID_TERMS = ['First', 'Second', 'Third']
const VALID_VISIBILITY = ['draft', 'teacher', 'student', 'both']

export default defineEventHandler(async (event) => {
  try {
    await ensureConnection()
    requireRole(event, 'Admin')

    const studentId = getRouterParam(event, 'studentId')
    const body = await readBody(event)

    if (typeof body?.visibility !== 'string' || !VALID_VISIBILITY.includes(body.visibility)) {
      throw createError({ statusCode: 400, message: 'That request was invalid.' })
    }
    if (typeof body?.term !== 'string' || !VALID_TERMS.includes(body.term)) {
      throw createError({ statusCode: 400, message: 'That request was invalid.' })
    }
    if (typeof body?.session !== 'string' || !body.session.trim()) {
      throw createError({ statusCode: 400, message: 'That request was invalid.' })
    }

    const analysis = await AiAnalysis.findOneAndUpdate(
      { studentId, term: body.term, session: body.session.trim() },
      { visibility: body.visibility },
      { new: true }
    )

    if (!analysis) {
      throw createError({ statusCode: 404, message: 'No analysis found for that term. Generate one first.' })
    }

    return { success: true, analysis }
  } catch (error: any) {
    console.error('[ai-analysis/[studentId].patch]', error)
    throw toUserError(error)
  }
})
