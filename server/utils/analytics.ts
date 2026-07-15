import { Assessment, type AssessmentDocument } from '~/models/Assessment.model'
import { Assignment } from '~/models/Assignment.model'
import { Student } from '~/models/Student.model'
import type { SettingsDocument } from '~/models/Settings.model'
import { computeSubjectResult } from './results'

export interface TrendPoint {
  term: string
  session: string
  total: number
}

export type FlagStatus = 'at-risk' | 'declining' | 'on-track' | 'no-data'

const TERM_ORDER: Record<string, number> = { First: 0, Second: 1, Third: 2 }

// Points per term the trend line has to drop before we call it "declining" -
// deliberately simple (linear regression slope vs. a fixed threshold) so the
// flag stays explainable, per Prompt.md §7.
const DECLINING_SLOPE_THRESHOLD = -5

function sortPeriods(points: TrendPoint[]) {
  return [...points].sort((a, b) =>
    a.session === b.session ? TERM_ORDER[a.term] - TERM_ORDER[b.term] : a.session.localeCompare(b.session)
  )
}

// Ordinary least squares slope of total-vs-period-index. A straight line
// through the last few results - the owner can point at exactly this number
// to defend a "declining" flag.
export function computeTrendSlope(points: TrendPoint[]): number | null {
  if (points.length < 2) return null

  const n = points.length
  const xMean = (n - 1) / 2
  const yMean = points.reduce((sum, p) => sum + p.total, 0) / n

  let num = 0
  let den = 0
  points.forEach((p, i) => {
    num += (i - xMean) * (p.total - yMean)
    den += (i - xMean) ** 2
  })

  return den === 0 ? 0 : Math.round((num / den) * 100) / 100
}

export function classifySubjectTrend(rawPoints: TrendPoint[], passMark: number) {
  const points = sortPeriods(rawPoints)

  if (!points.length) {
    return { status: 'no-data' as FlagStatus, current: null as number | null, slope: null as number | null, points }
  }

  const current = points[points.length - 1].total
  const slope = computeTrendSlope(points)
  const atRisk = current < passMark
  const declining = slope !== null && slope <= DECLINING_SLOPE_THRESHOLD
  const status: FlagStatus = atRisk ? 'at-risk' : declining ? 'declining' : 'on-track'

  return { status, current, slope, points }
}

export async function buildSubjectAnalytics(classId: string, subjectId: string, settings: SettingsDocument) {
  const students = await Student.find({ classId, isActive: true })
    .select('firstName lastName admissionNumber')
    .sort({ firstName: 1 })

  const assessments = await Assessment.find({ classId, subjectId })

  return students.map((student: any) => {
    const studentAssessments = assessments.filter((a: AssessmentDocument) => a.studentId.toString() === student._id.toString())

    const byPeriod = new Map<string, AssessmentDocument[]>()
    for (const a of studentAssessments) {
      const key = `${a.term}__${a.session}`
      if (!byPeriod.has(key)) byPeriod.set(key, [])
      byPeriod.get(key)!.push(a)
    }

    const points: TrendPoint[] = []
    for (const [key, group] of byPeriod) {
      const [term, session] = key.split('__')
      const result = computeSubjectResult(group, settings)
      if (result.hasAnyScore) points.push({ term, session, total: result.total as number })
    }

    return {
      student: { _id: student._id, firstName: student.firstName, lastName: student.lastName, admissionNumber: student.admissionNumber },
      ...classifySubjectTrend(points, settings.passMark)
    }
  })
}

export async function buildSchoolAnalytics(settings: SettingsDocument) {
  await import('~/models/Class.model')
  await import('~/models/Subject.model')

  const assignments = await Assignment.find().populate('classId', 'name').populate('subjectId', 'name code')

  const summary = { atRisk: 0, declining: 0, onTrack: 0, noData: 0 }
  const flagged: any[] = []

  for (const assignment of assignments as any[]) {
    if (!assignment.classId || !assignment.subjectId) continue

    const rows = await buildSubjectAnalytics(assignment.classId._id.toString(), assignment.subjectId._id.toString(), settings)

    for (const row of rows) {
      if (row.status === 'at-risk') summary.atRisk++
      else if (row.status === 'declining') summary.declining++
      else if (row.status === 'on-track') summary.onTrack++
      else summary.noData++

      if (row.status === 'at-risk' || row.status === 'declining') {
        flagged.push({
          student: row.student,
          classId: assignment.classId._id,
          className: assignment.classId.name,
          subjectId: assignment.subjectId._id,
          subjectName: assignment.subjectId.name,
          subjectCode: assignment.subjectId.code,
          status: row.status,
          current: row.current,
          slope: row.slope
        })
      }
    }
  }

  flagged.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'at-risk' ? -1 : 1
    return (a.current ?? 0) - (b.current ?? 0)
  })

  return { summary, flagged }
}
