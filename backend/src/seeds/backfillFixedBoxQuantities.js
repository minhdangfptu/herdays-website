import mongoose from 'mongoose';
import env from '../config/environment.js';
import Box from '../models/boxModel.js';
import '../models/productModel.js';

const quantityByBoxProduct = [
  { boxName: 'Box Dâu', productName: 'Trà bổ máu', quantity: 3 },
  {
    boxName: 'Box Dâu',
    productName: 'Miếng dán nóng giảm đau bụng kinh SANCHF',
    quantity: 3
  },
  { boxName: 'Box Mầm', productName: 'Que thử thai Safefit', quantity: 2 },
  { boxName: 'Box Mầm', productName: 'Trà bổ máu', quantity: 3 },
  { boxName: 'Box Bầu', productName: 'Trà bổ máu', quantity: 3 }
];

const run = async () => {
  await mongoose.connect(env.mongodbUri, {
    dbName: env.mongodbDbName,
    serverSelectionTimeoutMS: 15000
  });

  try {
    const changes = [];

    for (const target of quantityByBoxProduct) {
      const box = await Box.findOne({ boxName: target.boxName }).populate('products.productId');
      if (!box) throw new Error(`Box not found: ${target.boxName}`);

      const boxProduct = box.products.find(
        (item) => item.productId?.productName === target.productName
      );
      if (!boxProduct) {
        throw new Error(`${target.productName} not found in ${target.boxName}`);
      }
      if (boxProduct.isCustomizable === true) {
        throw new Error(`${target.productName} is not fixed in ${target.boxName}`);
      }

      const previousQuantity = boxProduct.quantity;
      if (previousQuantity !== target.quantity) {
        boxProduct.quantity = target.quantity;
        await box.save();
      }

      changes.push({
        boxName: target.boxName,
        productName: target.productName,
        previousQuantity,
        quantity: boxProduct.quantity
      });
    }

    console.log(JSON.stringify({ changes }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
