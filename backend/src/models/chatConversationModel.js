import mongoose from 'mongoose';

const chatConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    sessionId: {
      type: String,
      trim: true,
      default: null,
      index: true
    },
    sessionType: {
      type: String,
      enum: ['guest', 'member'],
      required: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'Cuộc trò chuyện mới'
    },
    context: {
      targetStatus: {
        type: String,
        trim: true,
        maxlength: 80,
        default: null
      },
      ageGroup: {
        type: String,
        trim: true,
        maxlength: 40,
        default: null
      },
      personalizationConsent: {
        type: Boolean,
        default: false
      },
      quizSummary: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      }
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

chatConversationSchema.index({ user: 1, deletedAt: 1, lastMessageAt: -1 });
chatConversationSchema.index({ sessionId: 1, deletedAt: 1, expiresAt: 1 });

const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);

export default ChatConversation;

