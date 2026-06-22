import mongoose from 'mongoose';

import { QUIZ_TAGS } from './quizQuestionModel.js';

export const QUIZ_FINAL_ROLES = QUIZ_TAGS.filter((tag) => tag !== 'general');

const questionAnswerSchema = new mongoose.Schema({
  question: {
    type: String,
    trim: true,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { _id: false });

const quizAnswerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionAnswerContent: {
    type: [questionAnswerSchema],
    required: true,
    validate: {
      validator: (answers) => answers.length > 0,
      message: 'questionAnswerContent must contain at least one answer'
    }
  },
  finalRole: {
    type: String,
    required: true,
    enum: QUIZ_FINAL_ROLES
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  collection: 'quiz_answers',
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

quizAnswerSchema.index({ userId: 1, createdAt: -1 });

const QuizAnswer = mongoose.model('QuizAnswer', quizAnswerSchema);

export default QuizAnswer;
