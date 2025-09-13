import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  mentorshipId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'file' | 'image';
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  mentorshipId: {
    type: String,
    required: true,
    ref: 'Mentorship'
  },
  senderId: {
    type: String,
    required: true,
    ref: 'User'
  },
  receiverId: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
MessageSchema.index({ mentorshipId: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ receiverId: 1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ isRead: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
