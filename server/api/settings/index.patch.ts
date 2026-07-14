const VALID_TERMS = ['First', 'Second', 'Third']

export default defineEventHandler(async (event) => {
  try {
    requireRole(event, 'Admin')

    const body = await readBody(event)
    const settings = await getOrCreateSettings()

    if (typeof body?.currentSession === 'string' && body.currentSession.trim()) {
      settings.currentSession = body.currentSession.trim()
    }

    if (body?.currentTerm && VALID_TERMS.includes(body.currentTerm)) {
      settings.currentTerm = body.currentTerm
    }

    if (Array.isArray(body?.gradeBoundaries)) {
      const boundaries = body.gradeBoundaries.map((b: any) => ({
        grade: String(b?.grade ?? '').trim(),
        minScore: Number(b?.minScore),
        remark: b?.remark ? String(b.remark).trim() : null
      }))

      const valid = boundaries.every(
        (b: any) => b.grade && Number.isFinite(b.minScore) && b.minScore >= 0 && b.minScore <= 100
      )
      if (!valid) {
        throw createError({ statusCode: 400, message: 'Grade boundaries must have a label and a score between 0 and 100.' })
      }

      settings.gradeBoundaries = boundaries
    }

    if (body?.caWeight !== undefined || body?.examWeight !== undefined) {
      const caWeight = Number(body.caWeight ?? settings.caWeight)
      const examWeight = Number(body.examWeight ?? settings.examWeight)

      if (
        !Number.isFinite(caWeight) ||
        !Number.isFinite(examWeight) ||
        caWeight < 0 ||
        examWeight < 0 ||
        caWeight + examWeight !== 100
      ) {
        throw createError({ statusCode: 400, message: 'CA and exam weighting must be non-negative numbers that add up to 100.' })
      }

      settings.caWeight = caWeight
      settings.examWeight = examWeight
    }

    if (body?.passMark !== undefined) {
      const passMark = Number(body.passMark)
      if (!Number.isFinite(passMark) || passMark < 0 || passMark > 100) {
        throw createError({ statusCode: 400, message: 'Pass mark must be a number between 0 and 100.' })
      }
      settings.passMark = passMark
    }

    await settings.save()
    return { success: true, settings }
  } catch (error: any) {
    console.error('[settings/index.patch]', error)
    throw toUserError(error)
  }
})
