import mongoose from 'mongoose';

import env from '../config/environment.js';
import quizQuestions from '../data/quizQuestions.js';
import QuizQuestion from '../models/quizQuestionModel.js';

const seedQuizQuestions = async () => {
  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });

  await QuizQuestion.updateMany({}, { $set: { isActive: false } });

  await QuizQuestion.bulkWrite(quizQuestions.map((question) => ({
    updateOne: {
      filter: { tag: question.tag, index: question.index },
      update: { $set: { ...question, isActive: true } },
      upsert: true
    }
  })));

  await mongoose.disconnect();
  process.stdout.write(`Seeded ${quizQuestions.length} quiz questions.\n`);
};

seedQuizQuestions().catch(async (error) => {
  process.stderr.write(`Unable to seed quiz questions: ${error.message}\n`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
