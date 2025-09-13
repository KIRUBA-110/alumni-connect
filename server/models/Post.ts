import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  _id: string;
  authorId: string;
  content: string;
  company?: string;
  field?: string;
  likes: number;
  comments: number;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>({
  authorId: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  field: {
    type: String,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PostSchema.index({ authorId: 1 });
PostSchema.index({ company: 1 });
PostSchema.index({ field: 1 });
PostSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
