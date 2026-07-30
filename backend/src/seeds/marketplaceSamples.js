import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

import env from '../config/environment.js';
import Box from '../models/boxModel.js';
import Product from '../models/productModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(__dirname, '../../..');
const marketplaceImageDirectory = path.join(repositoryRoot, 'Ảnh Sản Phẩm trên Web+Figma');

const boxDefinitions = [
  {
    boxName: 'Box Dâu',
    price: 349000,
    quantity: 30,
    category: 'Chăm sóc kỳ kinh',
    description: 'Bộ sản phẩm đồng hành trong kỳ kinh, kết hợp chăm sóc cá nhân, dinh dưỡng và những món quà nhỏ giúp bạn thoải mái hơn.',
    fixedProducts: [
      'Băng vệ sinh ngày Diana',
      'Băng vệ sinh ngày Laurier',
      'Băng vệ sinh ngày UUCare Young Girl',
      'Băng vệ sinh đêm Diana',
      'Băng vệ sinh đêm Laurier',
      'Băng vệ sinh đêm UUCare Young Girl',
      'Canxi ống_ Kingphar',
      'Miếng dán nóng giảm đau bụng kinh_ SANCHF',
      'Sắt, acid folic_ Fevital Blood',
      'Trà bổ máu',
      'Vitamin E_ MEGA We care',
      'Vitamin E_ Nature_s Bounty',
      'Điều kinh_ Viên ích mẫu OP.CIM OPC'
    ],
    optionalProducts: [
      'Băng vệ sinh test sức khỏe phụ khoa_ Cotton Day',
      'Dung dịch vệ sinh phụ nữ mini_ Dạ Hương_',
      'Dung dịch vệ sinh phụ nữ mini_ Lactacyd',
      'Giảm đau_ Dolfenal Hồng',
      'Giấy lau_ MEDiCARE',
      'Nước rửa tay khô_ Green Cross',
      'Quà tặng (kẹp tóc, bờm tóc, dây buộc tóc, tất, mặt nạ)',
      'Voucher tiêm phòng_ VHN Care',
      'Đồ Ngọt'
    ]
  },
  {
    boxName: 'Box Mầm',
    price: 429000,
    quantity: 30,
    category: 'Đang mong con',
    description: 'Bộ sản phẩm dành cho hành trình chuẩn bị mang thai, hỗ trợ theo dõi thời điểm, chăm sóc cơ thể và bổ sung dinh dưỡng hằng ngày.',
    fixedProducts: [
      'Canxi ống (cbi bầu)_ Calcium Corbière Extra Sanofi',
      'Dung dịch vệ sinh phụ nữ mini_ Dạ Hương_',
      'Dung dịch vệ sinh phụ nữ mini_ Lactacyd',
      'Que thử rụng trứng_ Pharmacity',
      'Que thử rụng trứng_ Safefit',
      'Que thử thai_ Safefit',
      'Sắt, acid folic_ Fevital Blood',
      'Trà bổ máu',
      'Vitamin_ Doppelherz Aktiv Vital Pregna_',
      'Vitamin_ proMUM New Start',
      'Vitamin_ Rosy',
      'Voucher tiêm phòng_ VHN Care'
    ],
    optionalProducts: [
      'Board game dành cho cặp đôi',
      'Băng vệ sinh test sức khỏe phụ khoa_ Cotton Day',
      'Quà tặng (kẹp tóc, bờm tóc, dây buộc tóc, tất, mặt nạ)',
      'Sữa không đường_ TH True Milk',
      'Sữa không đường_ Vinamilk'
    ]
  },
  {
    boxName: 'Box Bầu',
    price: 499000,
    quantity: 30,
    category: 'Đang trong thai kỳ',
    description: 'Bộ sản phẩm chăm sóc mẹ bầu toàn diện với dinh dưỡng, vệ sinh cá nhân, chăm sóc làn da và các vật dụng tiện ích trong thai kỳ.',
    fixedProducts: [
      'Dung dịch vệ sinh phụ nữ mini_ Dạ Hương_',
      'Dung dịch vệ sinh phụ nữ mini_ Lactacyd',
      'Sắt, acid folic_ Fevital Blood',
      'Sữa không đường_ TH True Milk',
      'Sữa không đường_ Vinamilk',
      'Trà bổ máu',
      'Vitamin bầu_ Doppelherz Aktiv Vital Pregna_',
      'Vitamin bầu_ Elevit',
      'Vitamin bầu_ Kokoro_'
    ],
    optionalProducts: [
      'Bánh ăn kiêng gạo lứt_ Mailey',
      'Bột ngũ cốc ít đường_ B’Fast',
      'Dầu chống rạn_ Bio-Oil',
      'Dầu dừa_ VietCoCo',
      'Kem chống rạn_ Kutieskin Mama',
      'Quà tặng (kẹp tóc, bờm tóc, dây buộc tóc, tất, mặt nạ)',
      'Sổ lưu hình ảnh siêu âm',
      'Yến ăn kiêng_ FITNESS',
      'Đai đỡ bầu'
    ]
  }
];

const categoryRules = [
  { pattern: /băng vệ sinh|dung dịch vệ sinh|giấy lau|rửa tay/i, category: 'Vệ sinh cá nhân', price: 59000 },
  { pattern: /vitamin|canxi|sắt|acid folic|điều kinh/i, category: 'Vitamin & khoáng chất', price: 189000 },
  { pattern: /que thử/i, category: 'Theo dõi sức khỏe', price: 79000 },
  { pattern: /miếng dán|giảm đau/i, category: 'Chăm sóc kỳ kinh', price: 69000 },
  { pattern: /trà|sữa|ngũ cốc|bánh|yến|đồ ngọt/i, category: 'Dinh dưỡng', price: 89000 },
  { pattern: /dầu|kem chống rạn/i, category: 'Chăm sóc mẹ bầu', price: 169000 },
  { pattern: /voucher/i, category: 'Dịch vụ sức khỏe', price: 200000 },
  { pattern: /đai đỡ bầu/i, category: 'Đồ dùng mẹ bầu', price: 229000 },
  { pattern: /sổ lưu hình/i, category: 'Kỷ niệm thai kỳ', price: 99000 },
  { pattern: /board game|quà tặng/i, category: 'Quà tặng & thư giãn', price: 119000 }
];

const getProductMeta = (productName) => (
  categoryRules.find(({ pattern }) => pattern.test(productName)) || {
    category: 'Chăm sóc sức khỏe',
    price: 99000
  }
);

const unitRules = [
  { pattern: /băng vệ sinh|giấy lau/i, unit: 'gói' },
  { pattern: /dung dịch vệ sinh|nước rửa tay|dầu dừa/i, unit: 'chai' },
  { pattern: /que thử/i, unit: 'que' },
  { pattern: /miếng dán/i, unit: 'miếng' },
  { pattern: /giảm đau/i, unit: 'vỉ' },
  { pattern: /trà|ngũ cốc/i, unit: 'túi' },
  { pattern: /sữa|vitamin|canxi|sắt|acid folic|điều kinh|bánh|yến/i, unit: 'hộp' },
  { pattern: /dầu chống rạn|kem chống rạn/i, unit: 'lọ' },
  { pattern: /voucher/i, unit: 'cái' },
  { pattern: /đai đỡ bầu/i, unit: 'cái' },
  { pattern: /sổ lưu hình/i, unit: 'quyển' },
  { pattern: /board game/i, unit: 'bộ' }
];

const getProductUnit = (productName) => (
  unitRules.find(({ pattern }) => pattern.test(productName))?.unit || 'món'
);

const productNames = [
  ...new Set(boxDefinitions.flatMap(({ fixedProducts, optionalProducts }) => (
    [...fixedProducts, ...optionalProducts]
  )))
];

const productsToSeed = productNames.map((productName) => {
  const { category, price } = getProductMeta(productName);

  return {
    productName,
    unit: getProductUnit(productName),
    price,
    quantity: 100,
    description: `${productName} thuộc nhóm ${category.toLowerCase()}, được tuyển chọn cho các HerDays Box phù hợp với từng giai đoạn chăm sóc sức khỏe.`,
    category
  };
});

const configureCloudinary = () => {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
};

const getImagePathsByName = (directory, imagePaths = new Map()) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      getImagePathsByName(entryPath, imagePaths);
      continue;
    }

    if (path.extname(entry.name).toLowerCase() !== '.png') continue;
    const imageName = path.parse(entry.name).name;
    if (!imagePaths.has(imageName)) imagePaths.set(imageName, entryPath);
  }

  return imagePaths;
};

const getPublicId = (name) => {
  const readableName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
  const suffix = createHash('sha1').update(name).digest('hex').slice(0, 10);

  return `${readableName || 'image'}-${suffix}`;
};

const uploadImages = async (names, type, imagePathsByName) => {
  const folder = env.cloudinary.folders[type];
  const imageUrls = new Map();

  for (const name of names) {
    const imagePath = imagePathsByName.get(name);
    if (!imagePath) throw new Error(`Image not found for "${name}".`);

    const result = await cloudinary.uploader.upload(imagePath, {
      folder,
      public_id: getPublicId(name),
      overwrite: true,
      invalidate: true,
      resource_type: 'image'
    });

    imageUrls.set(name, result.secure_url);
    process.stdout.write(`Uploaded ${type}: ${name}\n`);
  }

  return imageUrls;
};

const seedMarketplace = async () => {
  if (!fs.existsSync(marketplaceImageDirectory)) {
    throw new Error(`Marketplace image directory not found: ${marketplaceImageDirectory}`);
  }

  configureCloudinary();
  const imagePathsByName = getImagePathsByName(marketplaceImageDirectory);
  const boxNames = boxDefinitions.map(({ boxName }) => boxName);
  const productImageUrls = await uploadImages(productNames, 'product', imagePathsByName);
  const boxImageUrls = await uploadImages(boxNames, 'box', imagePathsByName);

  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });

  await Product.bulkWrite(productsToSeed.map((product) => ({
    updateOne: {
      filter: { productName: product.productName },
      update: {
        $set: {
          ...product,
          thumbnail: productImageUrls.get(product.productName)
        }
      },
      upsert: true
    }
  })));

  const products = await Product.find({ productName: { $in: productNames } });
  const productByName = new Map(products.map((product) => [product.productName, product]));

  await Box.bulkWrite(boxDefinitions.map((box) => {
    const productNamesInBox = [...box.fixedProducts, ...box.optionalProducts];
    const boxProducts = productNamesInBox.map((productName) => ({
      productId: productByName.get(productName)._id,
      quantity: 1
    }));
    const productCategories = [
      ...new Set(productNamesInBox.map((productName) => productByName.get(productName).category))
    ];

    return {
      updateOne: {
        filter: { boxName: box.boxName },
        update: {
          $set: {
            boxName: box.boxName,
            thumbnail: boxImageUrls.get(box.boxName),
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

  process.stdout.write(`Đã thêm/cập nhật ${productsToSeed.length} sản phẩm và ${boxDefinitions.length} box.\n`);
};

seedMarketplace()
  .catch((error) => {
    process.stderr.write(`Không thể seed marketplace: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
