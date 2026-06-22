import mongoose from 'mongoose';

import QuizAnswer from '../models/quizAnswerModel.js';
import QuizQuestion from '../models/quizQuestionModel.js';
import User from '../models/userModel.js';
import HttpError from '../utils/httpError.js';

const ROLE_BY_GENERAL_ANSWER = {
  'Theo dõi chu kỳ kinh nguyệt': 'period',
  'Đang muốn có thai': 'fertility',
  'Đang mang thai': 'pregnancy-care',
  'Đang điều trị IVF': 'ivf'
};

const TARGET_STATUS_BY_ROLE = {
  period: 'periodTracking',
  fertility: 'tryingToConceive',
  'pregnancy-care': 'pregnant',
  ivf: 'ivf'
};

export const getQuestionsByTag = async (tag) => QuizQuestion.find({
  tag,
  isActive: true
})
  .sort({ index: 1 })
  .select('-__v')
  .lean();

export const submitQuizAnswers = async (userId, payload) => {
  const submittedQuestions = payload.questionAnswerContent.map(({ question }) => question);
  const uniqueSubmittedQuestions = new Set(submittedQuestions);

  if (uniqueSubmittedQuestions.size !== submittedQuestions.length) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', [
      { field: 'questionAnswerContent', message: 'Each question can only be answered once' }
    ]);
  }

  const roleQuestion = await QuizQuestion.findOne({
    tag: 'general',
    index: 2,
    isActive: true
  }).select('content').lean();

  const roleAnswerItem = payload.questionAnswerContent.find(
    ({ question }) => question === roleQuestion?.content
  );
  const roleAnswerValues = Array.isArray(roleAnswerItem?.answer)
    ? roleAnswerItem.answer
    : [roleAnswerItem?.answer];
  const rawRoleAnswer = roleAnswerValues.length === 1 ? roleAnswerValues[0] : null;
  const finalRole = ROLE_BY_GENERAL_ANSWER[rawRoleAnswer];

  if (!finalRole) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', [
      {
        field: 'questionAnswerContent',
        message: 'The answer to general question index 2 is missing or invalid'
      }
    ]);
  }

  const expectedQuestions = await QuizQuestion.find({
    tag: { $in: ['general', finalRole] },
    isActive: true
  }).select('content').lean();

  const expectedQuestionContents = new Set(expectedQuestions.map(({ content }) => content));
  const hasInvalidQuestion = submittedQuestions.some(
    (question) => !expectedQuestionContents.has(question)
  );

  if (hasInvalidQuestion || submittedQuestions.length !== expectedQuestionContents.size) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', [
      {
        field: 'questionAnswerContent',
        message: `Answers must include every active general and ${finalRole} question`
      }
    ]);
  }

  const session = await mongoose.startSession();
  let quizAnswer;

  try {
    await session.withTransaction(async () => {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { targetStatus: TARGET_STATUS_BY_ROLE[finalRole] } },
        { new: true, runValidators: true, session }
      );

      if (!user) {
        throw new HttpError(404, 'Không tìm thấy người dùng');
      }

      [quizAnswer] = await QuizAnswer.create([{
        userId,
        questionAnswerContent: payload.questionAnswerContent,
        finalRole
      }], { session });
    });
  } finally {
    await session.endSession();
  }

  return {
    ...quizAnswer.toJSON(),
    targetStatus: TARGET_STATUS_BY_ROLE[finalRole]
  };
};
