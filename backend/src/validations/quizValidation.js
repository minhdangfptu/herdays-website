import { QUIZ_TAGS } from '../models/quizQuestionModel.js';
import HttpError from '../utils/httpError.js';

export const validateQuizTag = (tag) => {
  if (!QUIZ_TAGS.includes(tag)) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', [
      { field: 'tag', message: `tag must be one of: ${QUIZ_TAGS.join(', ')}` }
    ]);
  }

  return tag;
};

const isEmptyAnswer = (answer) => (
  answer === null
  || answer === undefined
  || (typeof answer === 'string' && answer.trim().length === 0)
  || (Array.isArray(answer) && answer.length === 0)
);

const isValidAnswer = (answer) => (
  (typeof answer === 'string' && answer.trim().length > 0)
  || (
    Array.isArray(answer)
    && answer.length > 0
    && answer.every((item) => typeof item === 'string' && item.trim().length > 0)
  )
);

export const validateSubmitQuiz = (body) => {
  const payload = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const errors = [];

  if (!Array.isArray(payload.questionAnswerContent) || payload.questionAnswerContent.length === 0) {
    errors.push({
      field: 'questionAnswerContent',
      message: 'questionAnswerContent must be a non-empty array'
    });
  }

  const questionAnswerContent = Array.isArray(payload.questionAnswerContent)
    ? payload.questionAnswerContent.map((item, index) => {
      const question = typeof item?.question === 'string' ? item.question.trim() : '';
      if (!question) {
        errors.push({
          field: `questionAnswerContent.${index}.question`,
          message: 'question is required'
        });
      }

      if (
        !item
        || !Object.prototype.hasOwnProperty.call(item, 'answer')
        || isEmptyAnswer(item.answer)
        || !isValidAnswer(item.answer)
      ) {
        errors.push({
          field: `questionAnswerContent.${index}.answer`,
          message: 'answer must be a non-empty string or array of non-empty strings'
        });
      }

      return { question, answer: item?.answer };
    })
    : [];

  if (errors.length > 0) {
    throw new HttpError(400, 'Dữ liệu đầu vào không hợp lệ', errors);
  }

  return {
    questionAnswerContent
  };
};
