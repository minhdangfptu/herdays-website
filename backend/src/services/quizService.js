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

const AUDIENCE_QUESTION_INDEX = 2;
const ROLE_QUESTION_INDEX = 3;
const APP_USER_AUDIENCE_ANSWER = 'người dùng ứng dụng';
const PARTNER_AUDIENCE_ANSWER = 'người thân';
const PARTNER_ROLE = 'partner';

export const TARGET_STATUS_BY_ROLE = {
  period: 'periodTracking',
  fertility: 'tryingToConceive',
  'pregnancy-care': 'pregnant',
  ivf: 'ivf',
  [PARTNER_ROLE]: 'partner'
};

const isFutureDateAnswer = (answer) => {
  if (typeof answer !== 'string') return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(answer);
  if (!match) return false;

  const [, rawYear, rawMonth, rawDay] = match;
  const year = Number(rawYear);
  const month = Number(rawMonth);
  const day = Number(rawDay);
  const answerDate = new Date(year, month - 1, day);

  if (
    answerDate.getFullYear() !== year
    || answerDate.getMonth() !== month - 1
    || answerDate.getDate() !== day
  ) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return answerDate.getTime() > today.getTime();
};

const buildChatQuizSummary = (quizAnswer) => {
  if (!quizAnswer) return null;

  return {
    finalRole: quizAnswer.finalRole,
    targetStatus: TARGET_STATUS_BY_ROLE[quizAnswer.finalRole] || null,
    answers: (quizAnswer.questionAnswerContent || [])
      .slice(1)
      .map(({ question, answer }) => ({ question, answer }))
  };
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

  const audienceQuestion = await QuizQuestion.findOne({
    tag: 'general',
    index: AUDIENCE_QUESTION_INDEX,
    isActive: true
  }).select('content').lean();

  const audienceAnswerItem = payload.questionAnswerContent.find(
    ({ question }) => question === audienceQuestion?.content
  );
  const audienceAnswerValues = Array.isArray(audienceAnswerItem?.answer)
    ? audienceAnswerItem.answer
    : [audienceAnswerItem?.answer];
  const rawAudienceAnswer = audienceAnswerValues.length === 1 ? audienceAnswerValues[0] : null;

  const roleQuestion = await QuizQuestion.findOne({
    tag: 'general',
    index: ROLE_QUESTION_INDEX,
    isActive: true
  }).select('content').lean();

  let finalRole = null;

  if (rawAudienceAnswer === PARTNER_AUDIENCE_ANSWER) {
    finalRole = PARTNER_ROLE;
  } else if (rawAudienceAnswer === APP_USER_AUDIENCE_ANSWER) {
    const roleAnswerItem = payload.questionAnswerContent.find(
      ({ question }) => question === roleQuestion?.content
    );
    const roleAnswerValues = Array.isArray(roleAnswerItem?.answer)
      ? roleAnswerItem.answer
      : [roleAnswerItem?.answer];
    const rawRoleAnswer = roleAnswerValues.length === 1 ? roleAnswerValues[0] : null;
    finalRole = ROLE_BY_GENERAL_ANSWER[rawRoleAnswer];
  }

  if (!finalRole) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', [
      {
        field: 'questionAnswerContent',
        message: 'The audience answer or role answer is missing or invalid'
      }
    ]);
  }

  const expectedQuestions = finalRole === PARTNER_ROLE
    ? await QuizQuestion.find({
      tag: 'general',
      index: { $lte: AUDIENCE_QUESTION_INDEX },
      isActive: true
    }).select('content question_type').lean()
    : await QuizQuestion.find({
      tag: { $in: ['general', finalRole] },
      isActive: true
    }).select('content question_type').lean();

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

  const expectedQuestionByContent = new Map(
    expectedQuestions.map((question) => [question.content, question])
  );
  const futureDateAnswerIndex = payload.questionAnswerContent.findIndex(({ question, answer }) => (
    expectedQuestionByContent.get(question)?.question_type === 'date'
    && isFutureDateAnswer(answer)
  ));

  if (futureDateAnswerIndex !== -1) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', [
      {
        field: `questionAnswerContent.${futureDateAnswerIndex}.answer`,
        message: 'Date answer must not be in the future'
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

export const getLatestChatQuizContext = async (userId) => {
  if (!userId) return null;

  const quizAnswer = await QuizAnswer.findOne({ userId })
    .sort({ createdAt: -1 })
    .select('questionAnswerContent finalRole')
    .lean();

  if (!quizAnswer) return null;

  return {
    targetStatus: TARGET_STATUS_BY_ROLE[quizAnswer.finalRole] || null,
    quizSummary: buildChatQuizSummary(quizAnswer)
  };
};
