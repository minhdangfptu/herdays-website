import mongoose from 'mongoose';

import env from '../config/environment.js';
import Box from '../models/boxModel.js';
import Product from '../models/productModel.js';

const sampleProducts = [
  {
    productName: 'Dầu ấm thư giãn HerDays',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 129000,
    quantity: 25,
    description: 'Dầu massage giúp làm ấm vùng bụng và tạo cảm giác dễ chịu trong những ngày nhạy cảm.',
    category: 'Chăm sóc kỳ kinh'
  },
  {
    productName: 'Túi chườm bụng mini',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/woman.jpg',
    price: 99000,
    quantity: 40,
    description: 'Túi chườm nhỏ gọn, phù hợp mang theo khi đi học, đi làm hoặc du lịch.',
    category: 'Giảm đau'
  },
  {
    productName: 'Trà gừng mật ong',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/coffee.jpg',
    price: 79000,
    quantity: 60,
    description: 'Gói trà gừng mật ong dùng hằng ngày để giữ ấm cơ thể.',
    category: 'Đồ uống'
  },
  {
    productName: 'Khăn ướt dịu nhẹ',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/face_center.jpg',
    price: 59000,
    quantity: 80,
    description: 'Khăn ướt không mùi, dịu nhẹ, tiện dùng khi cần làm sạch nhanh.',
    category: 'Vệ sinh cá nhân'
  }
];

const sampleBoxName = 'Box chăm sóc ngày dâu';

const seedMarketplaceSamples = async () => {
  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });

  await Product.bulkWrite(sampleProducts.map((product) => ({
    updateOne: {
      filter: { productName: product.productName },
      update: { $set: product },
      upsert: true
    }
  })));

  const products = await Product.find({
    productName: { $in: sampleProducts.map((product) => product.productName) }
  });

  const productByName = new Map(products.map((product) => [product.productName, product]));
  const boxItems = [
    { productName: 'Dầu ấm thư giãn HerDays', quantity: 1 },
    { productName: 'Túi chườm bụng mini', quantity: 1 },
    { productName: 'Trà gừng mật ong', quantity: 2 },
    { productName: 'Khăn ướt dịu nhẹ', quantity: 1 }
  ].map((item) => ({
    productId: productByName.get(item.productName)._id,
    quantity: item.quantity
  }));

  const productCategories = [
    ...new Set(products.map((product) => product.category).filter(Boolean))
  ];

  await Box.updateOne(
    { boxName: sampleBoxName },
    {
      $set: {
        boxName: sampleBoxName,
        thumbnail: 'https://res.cloudinary.com/demo/image/upload/gift.jpg',
        price: 329000,
        quantity: 15,
        description: 'Box mẫu gồm các sản phẩm chăm sóc cơ bản cho kỳ kinh, có thể dùng để demo customize box.',
        category: productCategories[0] || 'Chăm sóc kỳ kinh',
        products: boxItems,
        productCategories
      }
    },
    { upsert: true }
  );

  await mongoose.disconnect();
  process.stdout.write(`Seeded ${sampleProducts.length} products and 1 box.\n`);
};

seedMarketplaceSamples().catch(async (error) => {
  process.stderr.write(`Unable to seed marketplace samples: ${error.message}\n`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
