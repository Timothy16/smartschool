import mongoose, { Schema } from 'mongoose'

export type AssessmentType = 'assignment' | 'test' | 'exam'

export interface AssessmentDocument extends mongoose.Document {
  studentId: mongoose.Types.ObjectId
  subjectId: mongoose.Types.ObjectId
  classId: mongoose.Types.ObjectId
  term: 'First' | 'Second' | 'Third'
  session: string
  type: AssessmentType
  score: number
  maxScore: number
  enteredBy: mongoose.Types.ObjectId
}

const AssessmentSchema = new Schema<AssessmentDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    term: { type: String, required: true, enum: ['First', 'Second', 'Third'] },
    session: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['assignment', 'test', 'exam'] },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    enteredBy: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true }
  },
  { timestamps: true }
)

// One record per student+subject+term+session+type - re-entering the same type
// updates it (upsert in the write route), it never creates a duplicate.
AssessmentSchema.index({ studentId: 1, subjectId: 1, term: 1, session: 1, type: 1 }, { unique: true })

export const Assessment =
  (mongoose.models.Assessment as mongoose.Model<AssessmentDocument>) ||
  mongoose.model<AssessmentDocument>('Assessment', AssessmentSchema)
