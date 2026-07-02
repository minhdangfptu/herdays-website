import mongoose from 'mongoose';

import env from '../config/environment.js';
import quizQuestions from '../data/quizQuestions.js';
import QuizQuestion from '../models/quizQuestionModel.js';

const DEFAULT_QUESTION_TYPE = 'single_choice';

const buildQuestionTypeUpdates = () => quizQuestions.map((question) => ({
  updateOne: {
    filter: { tag: question.tag, index: question.index },
    update: { $set: { question_type: question.question_type || DEFAULT_QUESTION_TYPE } }
  }
}));

const backfillQuizQuestionTypes = async () => {
  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });

  const questionTypeUpdates = buildQuestionTypeUpdates();
  const result = questionTypeUpdates.length > 0
    ? await QuizQuestion.bulkWrite(questionTypeUpdates, { ordered: false })
    : { matchedCount: 0, modifiedCount: 0 };

  const defaultResult = await QuizQuestion.updateMany(
    {
      $or: [
        { question_type: { $exists: false } },
        { question_type: null },
        { question_type: '' }
      ]
    },
    { $set: { question_type: DEFAULT_QUESTION_TYPE } }
  );

  await mongoose.disconnect();

  process.stdout.write(
    [
      `Matched mapped questions: ${result.matchedCount || 0}`,
      `Modified mapped questions: ${result.modifiedCount || 0}`,
      `Defaulted missing question_type: ${defaultResult.modifiedCount || 0}`
    ].join('\n')
  );
  process.stdout.write('\n');
};

backfillQuizQuestionTypes().catch(async (error) => {
  process.stderr.write(`Unable to backfill quiz question types: ${error.message}\n`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
