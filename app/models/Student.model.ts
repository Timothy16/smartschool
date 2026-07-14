import mongoose, { Schema } from 'mongoose'
import { authPlugin } from './authPlugin'

export interface StudentDocument extends mongoose.Document {
  firstName: string
  lastName: string
  email: string | null
  password: string
  admissionNumber: string
  classId: mongoose.Types.ObjectId | null
  isActive: boolean
  fullName: string
  getFullName(): string
  verifyPassword(password: string): Promise<boolean>
}

const StudentSchema = new Schema<StudentDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, default: null, trim: true, lowercase: true },
    password: { type: String, required: true },
    admissionNumber: { type: String, required: true, unique: true, trim: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

StudentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

StudentSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`
}

StudentSchema.plugin(authPlugin)

StudentSchema.set('toJSON', { virtuals: true })
StudentSchema.set('toObject', { virtuals: true })

export const Student = (mongoose.models.Student as mongoose.Model<StudentDocument>) || mongoose.model<StudentDocument>('Student', StudentSchema)
