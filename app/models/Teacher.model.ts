import mongoose, { Schema } from 'mongoose'
import { authPlugin } from './authPlugin'

export interface TeacherDocument extends mongoose.Document {
  firstName: string
  lastName: string
  email: string
  password: string
  isActive: boolean
  fullName: string
  getFullName(): string
  verifyPassword(password: string): Promise<boolean>
}

const TeacherSchema = new Schema<TeacherDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

TeacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

TeacherSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`
}

TeacherSchema.plugin(authPlugin)

TeacherSchema.set('toJSON', { virtuals: true })
TeacherSchema.set('toObject', { virtuals: true })

export const Teacher = (mongoose.models.Teacher as mongoose.Model<TeacherDocument>) || mongoose.model<TeacherDocument>('Teacher', TeacherSchema)
