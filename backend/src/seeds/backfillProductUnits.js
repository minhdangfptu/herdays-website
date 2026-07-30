import mongoose from 'mongoose';
import env from '../config/environment.js';
import Product from '../models/productModel.js';

const unitsByProductName = new Map([
  ['Băng vệ sinh ngày Diana', 'gói'],
  ['Băng vệ sinh ngày UUCare Young Girl', 'gói (16m)'],
  ['Băng vệ sinh ngày Laurier', 'gói (10m)'],
  ['Băng vệ sinh đêm UUCare Young Girl', 'gói (3m)'],
  ['Băng vệ sinh đêm Laurier', 'gói (4m)'],
  ['Băng vệ sinh đêm Diana', 'gói'],
  ['Canxi ống Kingphar', '6 vỉ x 5 ống'],
  ['Miếng dán nóng giảm đau bụng kinh SANCHF', 'miếng'],
  ['Trà bổ máu', 'túi'],
  ['Sắt, acid folic Fevital Blood', 'hộp'],
  ['Băng vệ sinh test sức khỏe phụ khoa Cotton Day', 'hộp (6m)'],
  ['Dung dịch vệ sinh phụ nữ mini Dạ Hương', 'chai'],
  ['Điều kinh - Viên ích mẫu OP.CIM OPC', '2 vỉ x 10 viên'],
  ['Vitamin E MEGA We care', 'hộp'],
  ["Vitamin E Nature's Bounty", 'hộp'],
  ['Dung dịch vệ sinh phụ nữ mini Lactacyd', 'chai'],
  ['Giấy lau MEDiCARE', 'gói'],
  ['Giảm đau Dolfenal Hồng', 'vỉ (4v)'],
  ['Nước rửa tay khô Green Cross', 'chai (100ml)'],
  ['Quà tặng (kẹp tóc, bờm tóc, dây buộc tóc, tất, mặt nạ)', 'món'],
  ['Voucher tiêm phòng VHN Care', 'cái'],
  ['Đồ Ngọt', 'món'],
  ['Canxi ống (Chuẩn bị bầu) Calcium Corbière Extra Sanofi', 'hộp'],
  ['Que thử rụng trứng Pharmacity', '1 hộp 7 que'],
  ['Que thử rụng trứng Safefit', '1 hộp 7 que'],
  ['Que thử thai Safefit', '1 que'],
  ['Vitamin proMUM New Start', 'hộp (30v)'],
  ['Vitamin Doppelherz Aktiv Vital Pregna', 'hộp (30v)'],
  ['Board game dành cho cặp đôi', 'bộ'],
  ['Vitamin bầu Elevit', 'hộp'],
  ['Sữa không đường Vinamilk', 'hộp'],
  ['Sữa không đường TH True Milk', 'hộp'],
  ['Vitamin bầu Doppelherz Aktiv Vital Pregna', 'hộp'],
  ['Vitamin Rosy', 'hộp (30v)'],
  ['Vitamin bầu Kokoro', 'hộp'],
  ['Bánh ăn kiêng gạo lứt Mailey', 'chiếc'],
  ['Bột ngũ cốc ít đường B’Fast', 'gói'],
  ['Dầu chống rạn Bio-Oil', 'lọ (25ml)'],
  ['Dầu dừa VietCoCo', 'chai (50ml)'],
  ['Kem chống rạn Kutieskin Mama', 'lọ kem (50g)'],
  ['Sổ lưu hình ảnh siêu âm', 'quyển'],
  ['Yến ăn kiêng FITNESS', 'hộp'],
  ['Đai đỡ bầu', 'cái']
]);

const run = async () => {
  await mongoose.connect(env.mongodbUri, {
    dbName: env.mongodbDbName,
    serverSelectionTimeoutMS: 15000
  });

  try {
    const products = await Product.find();
    const missingMappings = products.filter(
      (product) => !unitsByProductName.has(product.productName)
    );

    if (missingMappings.length > 0) {
      throw new Error(
        `Missing unit mapping for: ${missingMappings.map((product) => product.productName).join(', ')}`
      );
    }

    let changed = 0;
    for (const product of products) {
      const nextUnit = unitsByProductName.get(product.productName);
      if (product.unit === nextUnit) continue;

      product.unit = nextUnit;
      await product.save();
      changed += 1;
    }

    const unresolved = (await Product.find().select('productName unit').lean())
      .filter((product) => !String(product.unit || '').trim());

    console.log(JSON.stringify({
      matched: products.length,
      changed,
      unresolved: unresolved.length
    }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
