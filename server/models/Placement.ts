import mongoose, { Schema, Document } from 'mongoose';

export interface IPlacement extends Document {
  _id: string;
  studentId: string;
  company: string;
  role: string;
  package: number; // in lakhs
  placementType: 'full_time' | 'internship';
  year: number;
  createdAt: Date;
}

const PlacementSchema = new Schema<IPlacement>({
  studentId: {
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
  package: {
    type: Number,
    required: true
  },
  placementType: {
    type: String,
    enum: ['full_time', 'internship'],
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PlacementSchema.index({ studentId: 1 });
PlacementSchema.index({ company: 1 });
PlacementSchema.index({ year: -1 });
PlacementSchema.index({ placementType: 1 });
PlacementSchema.index({ createdAt: -1 });

export const Placement = mongoose.model<IPlacement>('Placement', PlacementSchema);
