import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'student' | 'alumni' | 'staff';
  fullName: string;
  college: string;
  graduationYear?: number;
  department?: string;
  company?: string;
  position?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'alumni', 'staff'],
    default: 'student'
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  graduationYear: {
    type: Number
  },
  department: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ college: 1 });
UserSchema.index({ company: 1 });
UserSchema.index({ department: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
