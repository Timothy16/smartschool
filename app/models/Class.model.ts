import mongoose, { Schema } from 'mongoose'

export interface ClassDocument extends mongoose.Document {
  name: string
  session: string
  formTeacherId: mongoose.Types.ObjectId | null
}

const ClassSchema = new Schema<ClassDocument>(
  {
    name: { type: String, required: true, trim: true },
    session: { type: String, required: true, trim: true },
    formTeacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', default: null }
  },
  { timestamps: true }
)

ClassSchema.index({ name: 1, session: 1 }, { unique: true })
ClassSchema.set('toJSON', { virtuals: true })
ClassSchema.set('toObject', { virtuals: true })

export const Class = (mongoose.models.Class as mongoose.Model<ClassDocument>) || mongoose.model<ClassDocument>('Class', ClassSchema)
