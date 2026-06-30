import mongoose from 'mongoose';

export const QUIZ_TAGS = [
  'general',
  'period',
  'pregnancy-care',
  'fertility',
  'ivf'
];

export const QUESTION_TYPES = [
  'single_choice',
  'multiple_choice',
  'date',
  'short_answer'
];

const quizQuestionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    question_type: {
      type: String,
      required: true,
      enum: QUESTION_TYPES,
      default: 'single_choice'
    },
    tag: {
      type: String,
      required: true,
      enum: QUIZ_TAGS
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator(options) {
          if (!['single_choice', 'multiple_choice'].includes(this.question_type)) return true;
          return Array.isArray(options) && options.length > 0;
        },
        message: 'options must contain at least one item for choice questions'
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
