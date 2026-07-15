import { Assignment } from '~/models/Assignment.model'
import { Assessment, type AssessmentDocument } from '~/models/Assessment.model'
import { Student } from '~/models/Student.model'
import type { SettingsDocument, GradeBoundary } from '~/models/Settings.model'

function normalize(score: number, maxScore: number) {
  if (!maxScore) return 0
  return (score / maxScore) * 100
}

export function gradeFor(total: number, gradeBoundaries: GradeBoundary[]) {
  const sorted = [...gradeBoundaries].sort((a, b) => b.minScore - a.minScore)
  const match = sorted.find((b) => total >= b.minScore)
  return match ? { grade: match.grade, remark: match.remark } : { grade: '-', remark: null }
}

export function computeSubjectResult(assessments: AssessmentDocument[], settings: SettingsDocument) {
  const byType: Partial<Record<AssessmentDocument['type'], AssessmentDocument>> = {}
  for (const a of assessments) byType[a.type] = a

  const assignmentPct = byType.assignment ? normalize(byType.assignment.score, byType.assignment.maxScore) : null
  const testPct = byType.test ? normalize(byType.test.score, byType.test.maxScore) : null
  const examPct = byType.exam ? normalize(byType.exam.score, byType.exam.maxScore) : null

  const caParts = [assignmentPct, testPct].filter((p): p is number => p !== null)
  const caPct = caParts.length ? caParts.reduce((sum, p) => sum + p, 0) / caParts.length : null

  const hasAnyScore = caPct !== null || examPct !== null
  const caContribution = caPct !== null ? (caPct * settings.caWeight) / 100 : 0
  const examContribution = examPct !== null ? (examPct * settings.examWeight) / 100 : 0
  const total = hasAnyScore ? Math.round((caContribution + examContribution) * 100) / 100 : null

  const { grade, remark } = total !== null ? gradeFor(total, settings.gradeBoundaries) : { grade: null as string | null, remark: null as string | null }

  return {
    assignment: byType.assignment ? { score: byType.assignment.score, maxScore: byType.assignment.maxScore } : null,
    test: byType.test ? { score: byType.test.score, maxScore: byType.test.maxScore } : null,
    exam: byType.exam ? { score: byType.exam.score, maxScore: byType.exam.maxScore } : null,
    caScore: caPct !== null ? Math.round(caPct * 100) / 100 : null,
    examScore: examPct !== null ? Math.round(examPct * 100) / 100 : null,
    total,
    grade,
    remark,
    passed: total !== null ? total >= settings.passMark : null,
    hasAnyScore
  }
}

export async function buildStudentReportCard(studentId: string, term: string, session: string, settings: SettingsDocument) {
  await import('~/models/Subject.model')
  await import('~/models/Class.model')

  const student = await Student.findById(studentId).select('-password').populate('classId', 'name session')
  if (!student) {
    throw createError({ statusCode: 404, message: 'Student not found.' })
  }

  const assignments = student.classId
    ? await Assignment.find({ classId: student.classId }).populate('subjectId', 'name code').sort({ createdAt: 1 })
    : []

  const assessments = await Assessment.find({ studentId, term, session })

  const subjects = assignments.map((assignment: any) => {
    const subjectAssessments = assessments.filter((a) => a.subjectId.toString() === assignment.subjectId._id.toString())
    const result = computeSubjectResult(subjectAssessments, settings)
    return { subjectId: assignment.subjectId._id, name: assignment.subjectId.name, code: assignment.subjectId.code, ...result }
  })

  const scored = subjects.filter((s) => s.hasAnyScore)
  const overallAverage = scored.length
    ? Math.round((scored.reduce((sum, s) => sum + (s.total ?? 0), 0) / scored.length) * 100) / 100
    : null
  const { grade: overallGrade, remark: overallRemark } =
    overallAverage !== null ? gradeFor(overallAverage, settings.gradeBoundaries) : { grade: null as string | null, remark: null as string | null }

  return {
    student,
    class: student.classId,
    term,
    session,
    subjects,
    overallAverage,
    overallGrade,
    overallRemark,
    passedOverall: overallAverage !== null ? overallAverage >= settings.passMark : null
  }
}

export async function buildClassResults(classId: string, term: string, session: string, settings: SettingsDocument) {
  const students = await Student.find({ classId, isActive: true }).select('-password').sort({ firstName: 1 })

  return Promise.all(
    students.map(async (student: any) => {
      const report = await buildStudentReportCard(student._id.toString(), term, session, settings)
      return {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        overallAverage: report.overallAverage,
        overallGrade: report.overallGrade,
        passedOverall: report.passedOverall,
        subjectsOffered: report.subjects.length,
        subjectsScored: report.subjects.filter((s) => s.hasAnyScore).length
      }
    })
  )
}
