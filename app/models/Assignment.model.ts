import mongoose, { Schema } from 'mongoose'

export interface AssignmentDocument extends mongoose.Document {
  teacherId: mongoose.Types.ObjectId
  classId: mongoose.Types.ObjectId
  subjectId: mongoose.Types.ObjectId
}

const AssignmentSchema = new Schema<AssignmentDocument>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true }
  },
  { timestamps: true }
)

// A class+subject pair maps to exactly one teacher - prevents duplicate/conflicting assignments.
AssignmentSchema.index({ classId: 1, subjectId: 1 }, { unique: true })

export const Assignment = (mongoose.models.Assignment as mongoose.Model<AssignmentDocument>) || mongoose.model<AssignmentDocument>('Assignment', AssignmentSchema)
