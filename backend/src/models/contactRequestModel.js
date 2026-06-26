import mongoose from 'mongoose';

export const CONTACT_TOPICS = [
  'general',
  'account',
  'technical',
  'partnership',
  'feedback',
  'other'
];

const contactRequestSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 16
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254
  },
  address: {
    type: String,
    trim: true,
    maxlength: 255,
    default: null
  },
  province: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  topic: {
    type: String,
    required: true,
    enum: CONTACT_TOPICS
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  collection: 'contact',
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

contactRequestSchema.index({ createdAt: -1 });

const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);

export default ContactRequest;
