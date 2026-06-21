import mongoose from 'mongoose';

import env from '../config/environment.js';
import BlogTopic from '../models/blogTopicModel.js';

const topics = [
  {
    name: 'Chu Kỳ Kinh Nguyệt',
    slug: 'chu-ky-kinh-nguyet',
    description: 'Kiến thức về chu kỳ, sức khỏe kinh nguyệt và cách theo dõi cơ thể.'
  },
  {
    name: 'Chuẩn bị mang thai & Thụ Thai',
    slug: 'chuan-bi-mang-thai-thu-thai',
    description: 'Thông tin chuẩn bị sức khỏe và nâng cao khả năng thụ thai.'
  },
  {
    name: 'Thai Kỳ',
    slug: 'thai-ky',
    description: 'Đồng hành cùng mẹ trong từng giai đoạn của thai kỳ.'
  },
  {
    name: 'IVF & Hỗ Trợ Sinh Sản',
    slug: 'ivf-ho-tro-sinh-san',
    description: 'Kiến thức về IVF và các phương pháp hỗ trợ sinh sản.'
  },
  {
    name: 'Khác',
    slug: 'khac',
    description: 'Các chủ đề chăm sóc sức khỏe nữ giới khác.'
  }
];

const seedBlogTopics = async () => {
  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });
  await BlogTopic.bulkWrite(topics.map((topic) => ({
    updateOne: {
      filter: { slug: topic.slug },
      update: { $set: topic },
      upsert: true
    }
  })));
  await mongoose.disconnect();
  process.stdout.write(`Seeded ${topics.length} blog topics.\n`);
};

seedBlogTopics().catch(async (error) => {
  process.stderr.write(`Unable to seed blog topics: ${error.message}\n`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
