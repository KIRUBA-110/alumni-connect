import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface IAssessment extends Document {
  _id: string;
  title: string;
  description: string;
  category: 'aptitude' | 'coding' | 'general' | 'cs' | 'ece' | 'mba';
  questions: IQuestion[];
  timeLimit: number; // in minutes
  totalQuestions: number;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  explanation: {
    type: String
  }
}, { _id: false });

const AssessmentSchema = new Schema<IAssessment>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['aptitude', 'coding', 'general', 'cs', 'ece', 'mba'],
    required: true
  },
  questions: [QuestionSchema],
  timeLimit: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AssessmentSchema.index({ category: 1 });
AssessmentSchema.index({ title: 1 });
AssessmentSchema.index({ createdAt: -1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
