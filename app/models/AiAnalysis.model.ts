import mongoose, { Schema } from 'mongoose'

export type AiAnalysisVisibility = 'draft' | 'teacher' | 'student' | 'both'

export interface AiAnalysisSubject {
  subjectId: mongoose.Types.ObjectId
  name: string
  code: string
  performanceSummary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  topicsToReview: string[]
  suggestedBooks: string[]
}

export interface AiAnalysisDocument extends mongoose.Document {
  studentId: mongoose.Types.ObjectId
  term: 'First' | 'Second' | 'Third'
  session: string
  overallSummary: string
  subjects: AiAnalysisSubject[]
  visibility: AiAnalysisVisibility
  generatedBy: mongoose.Types.ObjectId
  generatedAt: Date
}

const AiAnalysisSubjectSchema = new Schema<AiAnalysisSubject>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    performanceSummary: { type: String, required: true, trim: true },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    topicsToReview: { type: [String], default: [] },
    suggestedBooks: { type: [String], default: [] }
  },
  { _id: false }
)

const AiAnalysisSchema = new Schema<AiAnalysisDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    term: { type: String, required: true, enum: ['First', 'Second', 'Third'] },
    session: { type: String, required: true, trim: true },
    overallSummary: { type: String, required: true, trim: true },
    subjects: { type: [AiAnalysisSubjectSchema], default: [] },
    visibility: { type: String, required: true, enum: ['draft', 'teacher', 'student', 'both'], default: 'draft' },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    generatedAt: { type: Date, required: true, default: Date.now }
  },
  { timestamps: true }
)

// One analysis per student+term+session - regenerating replaces it in place rather than duplicating.
AiAnalysisSchema.index({ studentId: 1, term: 1, session: 1 }, { unique: true })

export const AiAnalysis =
  (mongoose.models.AiAnalysis as mongoose.Model<AiAnalysisDocument>) ||
  mongoose.model<AiAnalysisDocument>('AiAnalysis', AiAnalysisSchema)
