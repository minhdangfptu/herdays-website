export const PRODUCT_CATEGORIES = Object.freeze([
  'Sức khỏe',
  'Dinh dưỡng',
  'Vệ sinh cá nhân',
  'Theo dõi & kiểm tra',
  'Tiện ích',
  'Chăm sóc da',
  'Quà tặng'
]);

export const isProductCategory = (category) => PRODUCT_CATEGORIES.includes(category);
