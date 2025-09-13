import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentResult extends Document {
  _id: string;
  userId: string;
  assessmentId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  answers: number[];
  createdAt: Date;
}

const AssessmentResultSchema = new Schema<IAssessmentResult>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  assessmentId: {
    type: String,
    required: true,
    ref: 'Assessment'
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true
  },
  answers: [{
    type: Number,
    required: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
AssessmentResultSchema.index({ userId: 1 });
AssessmentResultSchema.index({ assessmentId: 1 });
AssessmentResultSchema.index({ userId: 1, assessmentId: 1 });
AssessmentResultSchema.index({ createdAt: -1 });

export const AssessmentResult = mongoose.model<IAssessmentResult>('AssessmentResult', AssessmentResultSchema);
