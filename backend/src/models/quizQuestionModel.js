import mongoose from 'mongoose';

export const QUIZ_TAGS = [
  'general',
  'period',
  'pregnancy-care',
  'fertility',
  'ivf'
];

const quizQuestionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    tag: {
      type: String,
      required: true,
      enum: QUIZ_TAGS
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) => options.length > 0,
        message: 'options must contain at least one item'
      }
    },
    index: {
      type: Number,
      required: true,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'quiz_questions',
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

quizQuestionSchema.index({ tag: 1, index: 1 }, { unique: true });
quizQuestionSchema.index({ tag: 1, isActive: 1, index: 1 });

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

export default QuizQuestion;
