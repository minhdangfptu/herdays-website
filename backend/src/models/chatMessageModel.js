import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema(
  {
    sourceId: String,
    sourceType: String,
    title: String,
    url: String,
    excerpt: String,
    score: Number
  },
  { _id: false }
);

const productRecommendationSchema = new mongoose.Schema(
  {
    productId: String,
    title: String,
    reason: String,
    benefits: [String],
    customizeUrl: String,
    confidence: Number
  },
  { _id: false }
);

const ctaSchema = new mongoose.Schema(
  {
    type: String,
    label: String,
    url: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000
    },
    safety: {
      level: String,
      reasons: [String],
      recommendedAction: String
    },
    citations: {
      type: [citationSchema],
      default: []
    },
    recommendedProducts: {
      type: [productRecommendationSchema],
      default: []
    },
    ctas: {
      type: [ctaSchema],
      default: []
    },
    usage: {
      inputTokens: Number,
      outputTokens: Number,
      totalTokens: Number
    },
    model: {
      type: String,
      trim: true,
      default: null
    },
    needsHumanSupport: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

chatMessageSchema.index({ conversation: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;

