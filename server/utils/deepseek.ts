const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

interface ReportSubjectInput {
  name: string
  code: string
  caScore: number | null
  examScore: number | null
  total: number | null
  grade: string | null
  passed: boolean | null
}

export interface GeneratedSubjectAnalysis {
  code: string
  performanceSummary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  topicsToReview: string[]
  suggestedBooks: string[]
}

export interface GeneratedAnalysis {
  overallSummary: string
  subjects: GeneratedSubjectAnalysis[]
}

function buildPrompt(
  studentName: string,
  term: string,
  session: string,
  subjects: ReportSubjectInput[],
  overallAverage: number | null,
  passMark: number
) {
  const subjectLines = subjects
    .map(
      (s) =>
        `- ${s.name} (${s.code}): CA ${s.caScore ?? 'N/A'}%, Exam ${s.examScore ?? 'N/A'}%, Total ${s.total ?? 'N/A'}%, Grade ${s.grade ?? 'N/A'}, ${s.passed ? 'Passed' : 'Below pass mark'}`
    )
    .join('\n')

  return `You are an experienced secondary school academic advisor reviewing a student's report card.

Student: ${studentName}
Term: ${term} Term, ${session}
Pass mark: ${passMark}%
Overall average: ${overallAverage ?? 'N/A'}%

Subject results:
${subjectLines}

For EACH subject listed above, analyze the student's performance and give constructive, age-appropriate academic feedback. Base your analysis only on the scores given above - do not invent scores or facts not present here.

Respond with ONLY a valid JSON object in this exact shape, no other text, no markdown:
{
  "overallSummary": "2-3 sentence overview of the student's performance across all subjects this term",
  "subjects": [
    {
      "code": "the subject code exactly as given above",
      "performanceSummary": "1-2 sentences on how the student did in this subject",
      "strengths": ["specific strength 1", "specific strength 2"],
      "weaknesses": ["specific area of weakness 1"],
      "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
      "topicsToReview": ["specific topic within this subject the student should revisit"],
      "suggestedBooks": ["a real, well-known textbook or study guide title relevant to this subject and level"]
    }
  ]
}

Include exactly one entry in "subjects" for every subject listed above, using the exact same "code" value. Keep each list to 2-4 concise, specific items.`
}

export async function generateResultAnalysis(
  studentName: string,
  term: string,
  session: string,
  subjects: ReportSubjectInput[],
  overallAverage: number | null,
  passMark: number,
  apiKey: string
): Promise<GeneratedAnalysis> {
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured')
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: buildPrompt(studentName, term, session, subjects, overallAverage, passMark) }],
      temperature: 0.3,
      max_tokens: 4096
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek API error (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  const text = result?.choices?.[0]?.message?.content
  if (typeof text !== 'string') {
    throw new Error('DeepSeek returned no content')
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('DeepSeek response did not contain JSON')
  }

  const parsed = JSON.parse(jsonMatch[0])
  if (typeof parsed?.overallSummary !== 'string' || !Array.isArray(parsed?.subjects)) {
    throw new Error('DeepSeek response had an unexpected shape')
  }

  const subjectsOut: GeneratedSubjectAnalysis[] = parsed.subjects
    .filter((s: any) => s && typeof s.code === 'string')
    .map((s: any) => ({
      code: s.code,
      performanceSummary: typeof s.performanceSummary === 'string' ? s.performanceSummary : '',
      strengths: Array.isArray(s.strengths) ? s.strengths.filter((x: any) => typeof x === 'string') : [],
      weaknesses: Array.isArray(s.weaknesses) ? s.weaknesses.filter((x: any) => typeof x === 'string') : [],
      recommendations: Array.isArray(s.recommendations) ? s.recommendations.filter((x: any) => typeof x === 'string') : [],
      topicsToReview: Array.isArray(s.topicsToReview) ? s.topicsToReview.filter((x: any) => typeof x === 'string') : [],
      suggestedBooks: Array.isArray(s.suggestedBooks) ? s.suggestedBooks.filter((x: any) => typeof x === 'string') : []
    }))

  return { overallSummary: parsed.overallSummary, subjects: subjectsOut }
}
