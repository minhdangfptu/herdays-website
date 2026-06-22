import * as quizService from '../services/quizService.js';
import { sendSuccess } from '../utils/response.js';
import { validateQuizTag, validateSubmitQuiz } from '../validations/quizValidation.js';

export const getQuestions = async (req, res, next) => {
  try {
    const tag = validateQuizTag(req.params.tag);
    const questions = await quizService.getQuestionsByTag(tag);

    sendSuccess(res, {
      message: `Lấy danh sách câu hỏi ${tag} thành công`,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

export const submitAnswers = async (req, res, next) => {
  try {
    const result = await quizService.submitQuizAnswers(
      req.user.id,
      validateSubmitQuiz(req.body)
    );

    sendSuccess(res, {
      statusCode: 201,
      message: 'Lưu câu trả lời quiz thành công',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
