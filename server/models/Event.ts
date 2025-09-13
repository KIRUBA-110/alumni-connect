import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  location: string;
  images: string[];
  chiefGuest?: string;
  organizerId: string;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
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
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String
  }],
  chiefGuest: {
    type: String,
    trim: true
  },
  organizerId: {
    type: String,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
EventSchema.index({ organizerId: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ date: -1 });
EventSchema.index({ createdAt: -1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
