import mongoose, { Schema } from 'mongoose'

export interface SubjectDocument extends mongoose.Document {
  name: string
  code: string
}

const SubjectSchema = new Schema<SubjectDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true }
  },
  { timestamps: true }
)

SubjectSchema.set('toJSON', { virtuals: true })
SubjectSchema.set('toObject', { virtuals: true })

export const Subject = (mongoose.models.Subject as mongoose.Model<SubjectDocument>) || mongoose.model<SubjectDocument>('Subject', SubjectSchema)
