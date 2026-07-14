import mongoose, { Schema } from 'mongoose'

export interface GradeBoundary {
  grade: string
  minScore: number
  remark: string | null
}

export interface SettingsDocument extends mongoose.Document {
  currentSession: string
  currentTerm: 'First' | 'Second' | 'Third'
  gradeBoundaries: GradeBoundary[]
  caWeight: number
  examWeight: number
  passMark: number
}

const GradeBoundarySchema = new Schema<GradeBoundary>(
  {
    grade: { type: String, required: true, trim: true },
    minScore: { type: Number, required: true },
    remark: { type: String, default: null, trim: true }
  },
  { _id: false }
)

function defaultGradeBoundaries(): GradeBoundary[] {
  return [
    { grade: 'A', minScore: 70, remark: 'Excellent' },
    { grade: 'B', minScore: 60, remark: 'Very Good' },
    { grade: 'C', minScore: 50, remark: 'Good' },
    { grade: 'D', minScore: 45, remark: 'Fair' },
    { grade: 'E', minScore: 40, remark: 'Pass' },
    { grade: 'F', minScore: 0, remark: 'Fail' }
  ]
}

const SettingsSchema = new Schema<SettingsDocument>(
  {
    currentSession: { type: String, required: true, trim: true },
    currentTerm: { type: String, required: true, enum: ['First', 'Second', 'Third'] },
    gradeBoundaries: { type: [GradeBoundarySchema], default: defaultGradeBoundaries },
    caWeight: { type: Number, required: true, default: 40 },
    examWeight: { type: Number, required: true, default: 60 },
    passMark: { type: Number, required: true, default: 40 }
  },
  { timestamps: true }
)

export const Settings = (mongoose.models.Settings as mongoose.Model<SettingsDocument>) || mongoose.model<SettingsDocument>('Settings', SettingsSchema)
