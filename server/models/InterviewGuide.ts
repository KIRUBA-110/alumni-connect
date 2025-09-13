import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewGuide extends Document {
  _id: string;
  authorId: string;
  company: string;
  role: string;
  experience: string;
  questions: string[];
  tips?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

const InterviewGuideSchema = new Schema<IInterviewGuide>({
  authorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    type: String,
    required: true
  }],
  tips: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
InterviewGuideSchema.index({ authorId: 1 });
InterviewGuideSchema.index({ company: 1 });
InterviewGuideSchema.index({ role: 1 });
InterviewGuideSchema.index({ difficulty: 1 });
InterviewGuideSchema.index({ createdAt: -1 });

export const InterviewGuide = mongoose.model<IInterviewGuide>('InterviewGuide', InterviewGuideSchema);
