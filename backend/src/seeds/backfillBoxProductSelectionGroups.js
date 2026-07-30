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

const selectionGroupsByBox = {
  'box dau': {
    'băng vệ sinh ngày diana': 'box-dau-bvs-ngay',
    'băng vệ sinh ngày uucare young girl': 'box-dau-bvs-ngay',
    'băng vệ sinh ngày laurier': 'box-dau-bvs-ngay',
    'băng vệ sinh đêm diana': 'box-dau-bvs-dem',
    'băng vệ sinh đêm uucare young girl': 'box-dau-bvs-dem',
    'băng vệ sinh đêm laurier': 'box-dau-bvs-dem',
    "vitamin e: nature's bounty": 'box-dau-thuc-pham-chuc-nang',
    'vitamin e mega we care': 'box-dau-thuc-pham-chuc-nang',
    'sắt acid folic fevital blood': 'box-dau-thuc-pham-chuc-nang',
    'canxi ống kingphar': 'box-dau-thuc-pham-chuc-nang'
  },
  'box mam': {
    'que thử rụng trứng safefit': 'box-mam-que-thu-rung-trung',
    'que thử rụng trứng pharmacity': 'box-mam-que-thu-rung-trung',
    'dung dịch vệ sinh phụ nữ mini dạ hương': 'box-mam-ddvs-mini',
    'dung dịch vệ sinh phụ nữ mini lactacyd': 'box-mam-ddvs-mini',
    'sắt acid folic fevital blood': 'box-mam-thuc-pham-chuc-nang',
    'canxi ống chuẩn bị bầu calcium corbière extra sanofi': 'box-mam-thuc-pham-chuc-nang',
    'vitamin doppelherz aktiv vital pregna': 'box-mam-thuc-pham-chuc-nang',
    'vitamin promum new start': 'box-mam-thuc-pham-chuc-nang',
    'vitamin rosy': 'box-mam-thuc-pham-chuc-nang'
  },
  'box bau': {
    'dung dịch vệ sinh phụ nữ mini dạ hương': 'box-bau-ddvs-mini',
    'dung dịch vệ sinh phụ nữ mini lactacyd': 'box-bau-ddvs-mini',
    'sữa không đường vinamilk': 'box-bau-sua-khong-duong',
    'sữa không đường th true milk': 'box-bau-sua-khong-duong',
    'vitamin bầu kokoro': 'box-bau-thuc-pham-chuc-nang',
    'vitamin bầu elevit': 'box-bau-thuc-pham-chuc-nang',
    'vitamin bầu doppelherz aktiv vital pregna': 'box-bau-thuc-pham-chuc-nang',
    'sắt acid folic fevital blood': 'box-bau-thuc-pham-chuc-nang'
  }
};

const run = async () => {
  await mongoose.connect(env.mongodbUri, {
    dbName: env.mongodbDbName,
    serverSelectionTimeoutMS: 15000
  });

  try {
    const boxes = await Box.find().populate('products.productId');
    const changes = [];
    const summaries = [];

    for (const box of boxes) {
      const rawMapping = selectionGroupsByBox[normalize(box.boxName)];
      if (!rawMapping) continue;
      const mapping = Object.fromEntries(
        Object.entries(rawMapping).map(([productName, selectionGroup]) => [
          normalize(productName),
          selectionGroup
        ])
      );

      const seen = new Set();
      box.products.forEach((item) => {
        const productName = normalize(item.productId?.productName);
        const selectionGroup = mapping[productName] || null;

        if (selectionGroup && item.isCustomizable === true) {
          throw new Error(`${box.boxName} / ${item.productId.productName} must be fixed`);
        }

        if (selectionGroup) seen.add(productName);
        if (item.selectionGroup !== selectionGroup) {
          changes.push({
            boxName: box.boxName,
            productName: item.productId?.productName,
            selectionGroup
          });
          item.selectionGroup = selectionGroup;
        }
      });

      const missing = Object.keys(mapping).filter((productName) => !seen.has(productName));
      if (missing.length > 0) {
        throw new Error(`Products missing from ${box.boxName}: ${missing.join(', ')}`);
      }

      await box.save();
      summaries.push({
        boxName: box.boxName,
        selectionGroups: box.products
          .filter((item) => item.selectionGroup)
          .map((item) => ({
            productName: item.productId?.productName,
            selectionGroup: item.selectionGroup,
            isCustomizable: item.isCustomizable
          }))
      });
    }

    console.log(JSON.stringify({ changes, summaries }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
