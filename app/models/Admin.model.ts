import mongoose, { Schema } from 'mongoose'
import { authPlugin } from './authPlugin'

export interface AdminDocument extends mongoose.Document {
  firstName: string
  lastName: string
  email: string
  password: string
  isActive: boolean
  fullName: string
  getFullName(): string
  verifyPassword(password: string): Promise<boolean>
}

const AdminSchema = new Schema<AdminDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

AdminSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

AdminSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`
}

AdminSchema.plugin(authPlugin)

AdminSchema.set('toJSON', { virtuals: true })
AdminSchema.set('toObject', { virtuals: true })

export const Admin = (mongoose.models.Admin as mongoose.Model<AdminDocument>) || mongoose.model<AdminDocument>('Admin', AdminSchema)
