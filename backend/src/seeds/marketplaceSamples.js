import mongoose from 'mongoose';

import env from '../config/environment.js';
import Box from '../models/boxModel.js';
import Product from '../models/productModel.js';

const sampleProducts = [
  {
    productName: 'Dầu ấm thư giãn HerDays',
    unit: 'chai',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    price: 129000,
    quantity: 25,
    description: 'Dầu massage giúp làm ấm vùng bụng và tạo cảm giác dễ chịu trong những ngày nhạy cảm.',
    category: 'Sức khỏe'
  },
  {
    productName: 'Túi chườm bụng mini',
    unit: 'túi',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/woman.jpg',
    price: 99000,
    quantity: 40,
    description: 'Túi chườm nhỏ gọn, phù hợp mang theo khi đi học, đi làm hoặc du lịch.',
    category: 'Sức khỏe'
  },
  {
    productName: 'Trà gừng mật ong',
    unit: 'túi',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/coffee.jpg',
    price: 79000,
    quantity: 60,
    description: 'Gói trà gừng mật ong dùng hằng ngày để giữ ấm cơ thể.',
    category: 'Dinh dưỡng'
  },
  {
    productName: 'Khăn ướt dịu nhẹ',
    unit: 'gói',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/face_center.jpg',
    price: 59000,
    quantity: 80,
    description: 'Khăn ướt không mùi, dịu nhẹ, tiện dùng khi cần làm sạch nhanh.',
    category: 'Vệ sinh cá nhân'
  },
  {
    productName: 'Nến thơm oải hương HerDays',
    unit: 'hũ',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/cld-sample-5.jpg',
    price: 149000,
    quantity: 30,
    description: 'Nến thơm hương oải hương dịu nhẹ, giúp không gian thư giãn hơn trước giờ ngủ.',
    category: 'Tiện ích'
  },
  {
    productName: 'Mặt nạ ngủ lụa mềm',
    unit: 'cái',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg',
    price: 89000,
    quantity: 45,
    description: 'Mặt nạ ngủ bằng vải lụa mềm mại, hạn chế ánh sáng và tạo cảm giác dễ chịu khi nghỉ ngơi.',
    category: 'Tiện ích'
  },
  {
    productName: 'Trà hoa cúc túi lọc',
    unit: 'túi',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/samples/food/spices.jpg',
    price: 69000,
    quantity: 60,
    description: 'Trà hoa cúc thanh nhẹ, phù hợp dùng vào buổi tối để thư giãn sau một ngày dài.',
    category: 'Dinh dưỡng'
  },
  {
    productName: 'Xịt thơm gối hương dịu nhẹ',
    unit: 'chai',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/samples/ecommerce/accessories-bag.jpg',
    price: 119000,
    quantity: 35,
    description: 'Xịt thơm gối với hương dịu nhẹ, giúp tạo không gian nghỉ ngơi thoải mái và dễ chịu.',
    category: 'Tiện ích'
  }
];

const sampleBoxes = [
  {
    boxName: 'Box chăm sóc ngày dâu',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/gift.jpg',
    price: 329000,
    quantity: 15,
    description: 'Box mẫu gồm các sản phẩm chăm sóc cơ bản cho kỳ kinh, có thể dùng để demo customize box.',
    category: 'Sức khỏe',
    items: [
      { productName: 'Dầu ấm thư giãn HerDays', quantity: 1 },
      { productName: 'Túi chườm bụng mini', quantity: 1 },
      { productName: 'Trà gừng mật ong', quantity: 2 },
      { productName: 'Khăn ướt dịu nhẹ', quantity: 1 }
    ]
  },
  {
    boxName: 'Box thư giãn và ngủ ngon',
    thumbnail: 'https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg',
    price: 359000,
    quantity: 20,
    description: 'Bộ sản phẩm giúp tạo không gian thư giãn, chăm sóc giấc ngủ và phục hồi năng lượng mỗi tối.',
    category: 'Tiện ích',
    items: [
      { productName: 'Nến thơm oải hương HerDays', quantity: 1 },
      { productName: 'Mặt nạ ngủ lụa mềm', quantity: 1 },
      { productName: 'Trà hoa cúc túi lọc', quantity: 2 },
      { productName: 'Xịt thơm gối hương dịu nhẹ', quantity: 1 }
    ]
  }
];

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
  await Box.bulkWrite(sampleBoxes.map((box) => {
    const boxProducts = box.items.map((item) => ({
      productId: productByName.get(item.productName)._id,
      quantity: item.quantity
    }));
    const productCategories = [
      ...new Set(box.items
        .map((item) => productByName.get(item.productName).category)
        .filter(Boolean))
    ];

    return {
      updateOne: {
        filter: { boxName: box.boxName },
        update: {
          $set: {
            boxName: box.boxName,
            thumbnail: box.thumbnail,
            price: box.price,
            quantity: box.quantity,
            description: box.description,
            category: box.category,
            products: boxProducts,
            productCategories
          }
        },
        upsert: true
      }
    };
  }));

  await mongoose.disconnect();
  process.stdout.write(`Seeded ${sampleProducts.length} products and ${sampleBoxes.length} boxes.\n`);
};

seedMarketplaceSamples().catch(async (error) => {
  process.stderr.write(`Unable to seed marketplace samples: ${error.message}\n`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
