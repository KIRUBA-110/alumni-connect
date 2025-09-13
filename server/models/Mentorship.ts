import mongoose, { Schema, Document } from 'mongoose';

export interface IMentorship extends Document {
  _id: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  field?: string;
  createdAt: Date;
}

const MentorshipSchema = new Schema<IMentorship>({
  mentorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  menteeId: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'rejected'],
    default: 'pending'
  },
  field: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
MentorshipSchema.index({ mentorId: 1 });
MentorshipSchema.index({ menteeId: 1 });
MentorshipSchema.index({ status: 1 });
MentorshipSchema.index({ field: 1 });
MentorshipSchema.index({ createdAt: -1 });

export const Mentorship = mongoose.model<IMentorship>('Mentorship', MentorshipSchema);
