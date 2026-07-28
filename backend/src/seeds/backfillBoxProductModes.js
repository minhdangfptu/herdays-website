import mongoose from 'mongoose';
import env from '../config/environment.js';
import Box from '../models/boxModel.js';
import '../models/productModel.js';

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const modeByBox = {
  'box dau': {
    fixed: [
      'băng vệ sinh đêm diana',
      'băng vệ sinh đêm laurier',
      'băng vệ sinh đêm uucare young girl',
      'băng vệ sinh ngày diana',
      'băng vệ sinh ngày laurier',
      'băng vệ sinh ngày uucare young girl',
      'canxi ống: kingphar',
      'điều kinh: viên ích mẫu op.cim opc',
      'miếng dán nóng giảm đau bụng kinh: sanchf',
      'sắt, acid folic: fevital blood',
      'trà bổ máu',
      'vitamin e: mega we care',
      "vitamin e: nature's bounty"
    ],
    customizable: [
      'băng vệ sinh test sức khỏe phụ khoa: cotton day',
      'dung dịch vệ sinh phụ nữ mini: dạ hương',
      'dung dịch vệ sinh phụ nữ mini: lactacyd',
      'đồ ngọt',
      'giảm đau: dolfenal hồng',
      'giấy lau: medicare',
      'nước rửa tay khô: green cross',
      'quà tặng (kẹp tóc, bờm tóc, dây buộc tóc, tất, mặt nạ)',
      'voucher tiêm phòng: vhn care'
    ]
  },
  'box mam': {
    fixed: [
      'canxi ống (chuẩn bị bầu) calcium corbière extra sanofi',
      'dung dịch vệ sinh phụ nữ mini: dạ hương',
      'dung dịch vệ sinh phụ nữ mini: lactacyd',
      'que thử rụng trứng: pharmacity',
      'que thử rụng trứng: safefit',
      'que thử thai: safefit',
      'sắt, acid folic: fevital blood',
      'trà bổ máu',
      'vitamin: doppelherz aktiv vital pregna',
      'vitamin: promum new start',
      'vitamin: rosy',
      'voucher tiêm phòng: vhn care'
    ],
    customizable: [
      'băng vệ sinh test sức khỏe phụ khoa: cotton day',
      'board game dành cho cặp đôi',
      'quà tặng (kẹp tóc, bờm tóc, dây buộc tóc, tất, mặt nạ)',
      'sữa không đường: th true milk',
      'sữa không đường: vinamilk'
    ]
  },
  'box bau': {
    fixed: [
      'dung dịch vệ sinh phụ nữ mini: dạ hương',
      'dung dịch vệ sinh phụ nữ mini: lactacyd',
      'sắt, acid folic: fevital blood',
      'sữa không đường: th true milk',
      'sữa không đường: vinamilk',
      'trà bổ máu',
      'vitamin bầu: doppelherz aktiv vital pregna',
      'vitamin bầu: elevit',
      'vitamin bầu: kokoro'
    ],
    customizable: [
      'bánh ăn kiêng gạo lứt: mailey',
      'bột ngũ cốc ít đường: b fast',
      'dầu chống rạn: bio oil',
      'dầu dừa: vietcoco',
      'đai đỡ bầu',
      'kem chống rạn: kutieskin mama',
      'quà tặng (kẹp tóc, bờm tóc, dây buộc tóc, tất, mặt nạ)',
      'sổ lưu hình ảnh siêu âm',
      'yến ăn kiêng: fitness'
    ]
  }
};

const run = async () => {
  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const boxes = await Box.find().populate('products.productId').session(session);

      for (const box of boxes) {
        const boxKey = normalize(box.boxName);
        const config = modeByBox[boxKey];
        if (!config) throw new Error(`Missing mode mapping for ${box.boxName}`);

        const fixed = new Set(config.fixed.map(normalize));
        const customizable = new Set(config.customizable.map(normalize));
        const seen = new Set();

        box.products.forEach((item) => {
          const productName = normalize(item.productId?.productName);
          item.quantity = 1;
          if (fixed.has(productName)) {
            item.isCustomizable = false;
          } else if (customizable.has(productName)) {
            item.isCustomizable = true;
          } else {
            throw new Error(`Missing product mode mapping: ${box.boxName} / ${item.productId?.productName}`);
          }
          seen.add(productName);
        });

        const expected = new Set([...fixed, ...customizable]);
        const missing = [...expected].filter((name) => !seen.has(name));
        if (missing.length > 0) {
          throw new Error(`Products missing from ${box.boxName}: ${missing.join(', ')}`);
        }

        await box.save({ session });
      }
    });

    const result = await Box.find().populate('products.productId', 'productName');
    console.log(JSON.stringify(result.map((box) => ({
      boxName: box.boxName,
      fixed: box.products.filter((item) => !item.isCustomizable).map((item) => item.productId.productName),
      customizable: box.products.filter((item) => item.isCustomizable).map((item) => item.productId.productName)
    })), null, 2));
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
