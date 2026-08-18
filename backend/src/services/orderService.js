import Order from '../models/orderModel.js';
import Box from '../models/boxModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import ExcelJS from 'exceljs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  canTransitionOrderStatus,
  getNextOrderStatus,
  normalizeOrderStatus
} from '../constants/orderStatus.js';
import HttpError from '../utils/httpError.js';

const DELETED_ORDER_TTL_MS = 10 * 60 * 1000;
const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const ORDER_EXPORT_TEMPLATE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../templates/order-export-template.xlsx'
);

const getVietnamDateParts = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value: partValue }) => [type, Number(partValue)])
  );
};
const SUBSCRIPTION_DISCOUNTS = new Map([
  [1, 0],
  [3, 10],
  [6, 15],
  [12, 20]
]);

const LEGACY_BOX_DETAILS_BY_PRICE = new Map([
  [329000, {
    itemName: 'Box chăm sóc ngày dâu',
    thumbnail: null,
    category: 'Chăm sóc kỳ kinh',
    boxProducts: [
      { productName: 'Dầu ấm thư giãn HerDays', unit: 'chai', quantity: 1, boxQuantity: 1 },
      { productName: 'Túi chườm bụng mini', unit: 'túi', quantity: 1, boxQuantity: 1 },
      { productName: 'Trà gừng mật ong', unit: 'túi', quantity: 2, boxQuantity: 2 },
      { productName: 'Khăn ướt dịu nhẹ', unit: 'gói', quantity: 1, boxQuantity: 1 }
    ]
  }]
]);

const getCustomizedBoxPrice = (box, customizedProducts = []) => {
  const selectedById = new Map(
    customizedProducts.map((item) => [item.productId.toString(), Number(item.quantity) || 0])
  );

  const customizationExtra = box.products
    .filter((item) => item.isCustomizable === true)
    .reduce((total, item) => {
      const productId = item.productId._id?.toString() || item.productId.toString();
      const selectedQuantity = selectedById.get(productId) || 0;
      return total + selectedQuantity * (Number(item.productId.price) || 0);
    }, 0);

  return (Number(box.price) || 0) + customizationExtra;
};

const getSubscriptionDiscount = (subscriptionMonths = 1) => (
  SUBSCRIPTION_DISCOUNTS.get(Number(subscriptionMonths)) || 0
);

const getProductStockDemand = (items = []) => {
  const demandByProductId = new Map();

  items.forEach((item) => {
    const boxQuantity = Number(item.quantity) || 0;
    if (boxQuantity <= 0) return;

    const selectedById = new Map(
      (item.customizedProducts || []).map((customizedProduct) => [
        customizedProduct.productId?._id?.toString()
          || customizedProduct.productId?.toString(),
        Number(customizedProduct.quantity) || 0
      ])
    );

    (item.boxSnapshot?.products || []).forEach((boxProduct) => {
      const productId = boxProduct.productId?._id?.toString()
        || boxProduct.productId?.toString();
      if (!productId) return;

      const isSelectable = boxProduct.isCustomizable === true
        || Boolean(boxProduct.selectionGroup);
      const productQuantity = isSelectable
        ? selectedById.get(productId) || 0
        : Number(boxProduct.quantity) || 1;

      if (productQuantity <= 0) return;

      demandByProductId.set(
        productId,
        (demandByProductId.get(productId) || 0) + productQuantity * boxQuantity
      );
    });
  });

  return demandByProductId;
};

const adjustProductStock = async (items, session, direction) => {
  const demandByProductId = getProductStockDemand(items);
  const stockUpdates = await Promise.all(
    [...demandByProductId.entries()].map(([productId, quantity]) => (
      Product.updateOne(
        direction < 0
          ? { _id: productId, quantity: { $gte: quantity } }
          : { _id: productId },
        { $inc: { quantity: direction * quantity } },
        { session }
      )
    ))
  );

  if (direction < 0 && stockUpdates.some((result) => result.modifiedCount !== 1)) {
    throw new HttpError(400, 'Some products do not have enough stock');
  }
};

const createBoxSnapshot = (box) => ({
  boxName: box.boxName,
  thumbnail: box.thumbnail,
  category: box.category,
  products: (box.products || []).map((boxProduct) => ({
    productId: boxProduct.productId._id || boxProduct.productId,
    productName: boxProduct.productId.productName || 'Sản phẩm trong box',
    unit: boxProduct.productId.unit || null,
    thumbnail: boxProduct.productId.thumbnail || null,
    price: Number(boxProduct.productId.price) || 0,
    quantity: Number(boxProduct.quantity) || 1,
    isCustomizable: boxProduct.isCustomizable === true,
    selectionGroup: boxProduct.selectionGroup || null
  }))
});

const getStatusFilter = (status) => {
  if (status === ORDER_STATUS.CONFIRMED) {
    return { $in: [ORDER_STATUS.CONFIRMED, 'preparing'] };
  }

  if (status === ORDER_STATUS.CANCELLED) {
    return { $in: [ORDER_STATUS.CANCELLED, 'Cancel', 'cancel'] };
  }

  if (status === ORDER_STATUS.DELETED) {
    return ORDER_STATUS.DELETED;
  }

  return status;
};

const mapUser = (user) => {
  if (!user || !user._id) return null;
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address
  };
};

const mapOrderItem = (item, itemMap = new Map()) => {
  const snapshotDetail = item.isBox && item.boxSnapshot?.boxName
    ? {
        itemName: item.boxSnapshot.boxName,
        thumbnail: item.boxSnapshot.thumbnail,
        category: item.boxSnapshot.category,
        boxProducts: item.boxSnapshot.products || []
      }
    : null;
  const detail = snapshotDetail
    || itemMap.get(item.itemId.toString())
    || (item.isBox ? LEGACY_BOX_DETAILS_BY_PRICE.get(Number(item.price)) : null);
  const selectedById = new Map(
    (item.customizedProducts || []).map((customizedProduct) => [
      customizedProduct.productId?._id?.toString() || customizedProduct.productId?.toString(),
      customizedProduct
    ])
  );
  const customizedProducts = (item.customizedProducts || []).map((customizedProduct) => {
    const productId = customizedProduct.productId?._id?.toString()
      || customizedProduct.productId?.toString();
    const product = itemMap.get(productId);
    const boxProduct = detail?.boxProducts?.find((boxItem) => (
      boxItem.productId?._id?.toString() || boxItem.productId?.toString()
    ) === productId);
    const boxProductDetail = boxProduct?.productId?.productName
      ? boxProduct.productId
      : null;
    const quantity = Number(customizedProduct.quantity) || 0;
    const baseQuantity = Number(boxProduct?.quantity) || 1;

    return {
      productId: customizedProduct.productId,
      quantity,
      baseQuantity,
      productName: boxProductDetail?.productName || product?.itemName || 'Sản phẩm trong box',
      unit: boxProductDetail?.unit || product?.unit || null,
      thumbnail: boxProductDetail?.thumbnail || product?.thumbnail || null,
      price: boxProductDetail?.price || product?.price || 0,
      isCustomizable: boxProduct?.isCustomizable === true,
      isQuantityChanged: boxProduct?.isCustomizable === true && quantity !== baseQuantity,
      selectionGroup: boxProduct?.selectionGroup || null
    };
  });
  const boxProducts = (detail?.boxProducts || []).map((boxItem) => {
    const productId = boxItem.productId?._id?.toString() || boxItem.productId?.toString();
    const product = itemMap.get(productId);
    const populatedProduct = boxItem.productId?.productName ? boxItem.productId : null;
    const snapshotProduct = boxItem.productName ? boxItem : null;
    const selectedProduct = selectedById.get(productId);

    return {
      productId: boxItem.productId?._id || boxItem.productId,
      productName: populatedProduct?.productName || snapshotProduct?.productName || product?.itemName || 'Sản phẩm trong box',
      unit: populatedProduct?.unit || snapshotProduct?.unit || product?.unit || null,
      thumbnail: populatedProduct?.thumbnail || snapshotProduct?.thumbnail || product?.thumbnail || null,
      quantity: Number(selectedProduct?.quantity) || Number(boxItem.quantity) || 1,
      boxQuantity: Number(boxItem.quantity) || 1,
      price: populatedProduct?.price || snapshotProduct?.price || product?.price || 0,
      isCustomizable: boxItem.isCustomizable === true,
      selectionGroup: boxItem.selectionGroup || null,
      isSelected: Boolean(selectedProduct) || (
        boxItem.isCustomizable !== true && !boxItem.selectionGroup
      )
    };
  });

  return {
    itemId: item.itemId,
    isBox: item.isBox,
    quantity: item.quantity,
    boxProducts,
    customizedProducts,
    hasCustomization: customizedProducts.some((product) => product.isQuantityChanged),
    hasFixedSelection: customizedProducts.some((product) => Boolean(product.selectionGroup)),
    price: item.price,
    itemName: detail?.itemName || (item.isBox ? 'Box trong đơn hàng' : 'Sản phẩm'),
    thumbnail: detail?.thumbnail || null,
    category: detail?.category || null
  };
};

const getOrderItemMap = async (orders) => {
  const boxIds = new Set();
  const productIds = new Set();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.isBox) boxIds.add(item.itemId.toString());
      else productIds.add(item.itemId.toString());

      (item.customizedProducts || []).forEach((customizedProduct) => {
        productIds.add(customizedProduct.productId.toString());
      });
    });
  });

  const [boxes, products] = await Promise.all([
    boxIds.size
      ? Box.find({ _id: { $in: [...boxIds] } })
        .select('boxName thumbnail category products')
        .populate('products.productId', 'productName unit thumbnail price category')
      : [],
    productIds.size
      ? Product.find({ _id: { $in: [...productIds] } }).select('productName thumbnail unit price category')
      : []
  ]);

  return new Map([
    ...boxes.map((box) => [box._id.toString(), {
      itemName: box.boxName,
      thumbnail: box.thumbnail,
      category: box.category,
      boxProducts: box.products || []
    }]),
    ...products.map((product) => [product._id.toString(), {
      itemName: product.productName,
      thumbnail: product.thumbnail,
      unit: product.unit,
      price: product.price,
      category: product.category
    }])
  ]);
};

const mapOrder = (order, itemMap) => ({
  id: order._id,
  userId: order.userId?._id || order.userId,
  user: mapUser(order.userId),
  recipientName: order.recipientName,
  recipientPhone: order.recipientPhone,
  items: order.items.map((item) => mapOrderItem(item, itemMap)),
  totalAmount: order.totalAmount,
  subtotalAmount: order.subtotalAmount ?? order.totalAmount,
  subscriptionMonths: order.subscriptionMonths || 1,
  discountPercent: order.discountPercent || 0,
  discountAmount: order.discountAmount || 0,
  paymentMethod: order.paymentMethod,
  orderStatus: normalizeOrderStatus(order.orderStatus),
  lovelyMessage: order.lovelyMessage,
  startDate: order.startDate,
  endDate: order.endDate,
  deleteAt: order.deleteAt,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

const getOrderExportProductText = (item) => {
  const customizationText = (item.customizedProducts || [])
    .filter((customizedProduct) => Number(customizedProduct.quantity) > 0)
    .map((customizedProduct) => (
      `${customizedProduct.productName || 'Sản phẩm'} x${customizedProduct.quantity}`
    ))
    .join('; ');

  return customizationText
    ? `${item.itemName || 'Sản phẩm'} (${customizationText})`
    : item.itemName || 'Sản phẩm';
};

const toVietnamExcelDate = (value) => {
  if (!value) return null;
  const values = getVietnamDateParts(value);
  if (!values) return null;

  return new Date(Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  ));
};

const copyTemplateRowStyle = (sourceRow, targetRow) => {
  targetRow.height = sourceRow.height;
  for (let column = 1; column <= 10; column += 1) {
    targetRow.getCell(column).style = { ...sourceRow.getCell(column).style };
  }
};

const buildOrderExportRows = (orders) => orders.map((order) => {
  const items = order.items || [];
  const productText = items.map(getOrderExportProductText).join('; ');
  const quantity = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  return {
    date: toVietnamExcelDate(order.createdAt),
    orderCode: String(order.id || '').slice(-5).toUpperCase(),
    customer: order.recipientName || order.user?.fullName || order.user?.email || 'Người dùng',
    productType: productText || 'Đơn hàng',
    price: Number(order.subtotalAmount ?? order.totalAmount) || 0,
    quantity,
    total: Number(order.totalAmount) || 0,
    phone: order.recipientPhone || order.user?.phone || '',
    address: order.user?.address || 'Chưa cập nhật'
  };
});

export const exportOrders = async ({ search, status }) => {
  const filter = {};

  if (status) filter.orderStatus = getStatusFilter(status);

  if (search) {
    filter.$or = [
      { 'items.itemId': { $regex: search, $options: 'i' } },
      { 'items.isBox': { $regex: search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName email phone address');
  const itemMap = await getOrderItemMap(orders);
  const mappedOrders = orders.map((order) => mapOrder(order, itemMap));
  const exportRows = buildOrderExportRows(mappedOrders);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(ORDER_EXPORT_TEMPLATE_PATH);
  const worksheet = workbook.worksheets[0];
  const templateStartRow = 3;
  const templateEndRow = worksheet.rowCount;
  const exportDate = getVietnamDateParts(new Date());
  const exportDateLabel = [exportDate.day, exportDate.month, exportDate.year]
    .map((part) => String(part).padStart(2, '0'))
    .join('-');

  worksheet.getCell('A1').value = `Revenue for (${exportDateLabel})`;
  const templateRow = worksheet.getRow(templateStartRow);
  worksheet.getCell('C2').value = 'Order code';
  worksheet.getColumn(10).width = 42;

  exportRows.forEach((exportRow, index) => {
    const row = worksheet.getRow(templateStartRow + index);
    copyTemplateRowStyle(templateRow, row);

    row.getCell(1).value = index + 1;
    row.getCell(2).value = exportRow.date;
    row.getCell(3).value = exportRow.orderCode;
    row.getCell(3).numFmt = '@';
    row.getCell(4).value = exportRow.customer;
    row.getCell(5).value = exportRow.productType;
    row.getCell(6).value = exportRow.price;
    row.getCell(7).value = exportRow.quantity;
    row.getCell(8).value = exportRow.total;
    row.getCell(9).numFmt = '@';
    row.getCell(9).value = String(exportRow.phone || '').trim();
    row.getCell(10).value = exportRow.address;
    row.getCell(10).alignment = {
      ...row.getCell(10).alignment,
      wrapText: true,
      vertical: 'middle'
    };
  });

  for (let rowNumber = templateStartRow + exportRows.length; rowNumber <= templateEndRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    for (let column = 1; column <= 10; column += 1) {
      row.getCell(column).value = null;
    }
  }

  const lastUsedRow = Math.max(templateEndRow, templateStartRow + exportRows.length - 1);
  for (let rowNumber = 1; rowNumber <= lastUsedRow; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    for (let column = 1; column <= 10; column += 1) {
      const cell = row.getCell(column);
      cell.font = { ...cell.font, name: 'Times New Roman' };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const datePart = [exportDate.day, exportDate.month, exportDate.year]
    .map((part) => String(part).padStart(2, '0'))
    .join('-');
  return {
    buffer,
    fileName: `du-lieu-don-hang-her-days-to_${datePart}.xlsx`
  };
};

export const getOrders = async ({ page, limit, search, status }) => {
  const filter = {};

  if (status) filter.orderStatus = getStatusFilter(status);

  if (search) {
    filter.$or = [
      { 'items.itemId': { $regex: search, $options: 'i' } },
      { 'items.isBox': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'fullName email phone address'),
    Order.countDocuments(filter)
  ]);

  const itemMap = await getOrderItemMap(orders);

  return {
    orders: orders.map((order) => mapOrder(order, itemMap)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getOrdersByUser = async (userId) => {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  const itemMap = await getOrderItemMap(orders);
  return orders.map((order) => mapOrder(order, itemMap));
};

export const createOrderFromCart = async (userId, {
  recipientName,
  recipientPhone,
  paymentMethod = 'bank_transfer',
  lovelyMessage = '',
  cartItemIds,
  boxIds,
  subscriptionMonths = 1
} = {}) => {
  const session = await Order.startSession();
  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart || cart.items.length === 0) {
        throw new HttpError(400, 'Cart is empty');
      }

      const selectedCartItemIdSet = Array.isArray(cartItemIds) && cartItemIds.length > 0
        ? new Set(cartItemIds.map((cartItemId) => cartItemId.toString()))
        : null;
      const selectedBoxIdSet = !selectedCartItemIdSet && Array.isArray(boxIds) && boxIds.length > 0
        ? new Set(boxIds.map((boxId) => boxId.toString()))
        : null;
      const selectedCartItems = selectedCartItemIdSet
        ? cart.items.filter((item) => selectedCartItemIdSet.has(item._id.toString()))
        : selectedBoxIdSet
          ? cart.items.filter((item) => selectedBoxIdSet.has(item.boxId.toString()))
          : cart.items;

      if (selectedCartItems.length === 0) {
        throw new HttpError(400, 'Selected cart items are empty');
      }

      const cartBoxIds = selectedCartItems.map((item) => item.boxId);
      const boxes = await Box.find({ _id: { $in: cartBoxIds } })
        .populate('products.productId', 'productName unit thumbnail price category quantity')
        .session(session);
      const boxById = new Map(boxes.map((box) => [box._id.toString(), box]));

      const items = selectedCartItems.map((cartItem) => {
        const box = boxById.get(cartItem.boxId.toString());
        if (!box) throw new HttpError(404, 'Box not found');
        if (box.quantity < cartItem.quantity) {
          throw new HttpError(400, `${box.boxName} does not have enough stock`);
        }

        return {
          itemId: box._id,
          isBox: true,
          quantity: cartItem.quantity,
          customizedProducts: cartItem.customizedProducts || [],
          boxSnapshot: createBoxSnapshot(box),
          price: getCustomizedBoxPrice(box, cartItem.customizedProducts || [])
        };
      });

      const monthlySubtotalAmount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const subtotalAmount = monthlySubtotalAmount * Number(subscriptionMonths);
      const discountPercent = getSubscriptionDiscount(subscriptionMonths);
      const discountAmount = Math.round((subtotalAmount * discountPercent) / 100);
      const totalAmount = subtotalAmount - discountAmount;

      [createdOrder] = await Order.create([{
        userId,
        recipientName,
        recipientPhone,
        items,
        totalAmount,
        subtotalAmount,
        subscriptionMonths: Number(subscriptionMonths),
        discountPercent,
        discountAmount,
        inventoryAdjusted: true,
        paymentMethod,
        lovelyMessage
      }], { session });

      const stockUpdates = await Promise.all(items.map((item) => (
        Box.updateOne(
          { _id: item.itemId, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { session }
        )
      )));

      if (stockUpdates.some((result) => result.modifiedCount !== 1)) {
        throw new HttpError(400, 'Some items do not have enough stock');
      }

      await adjustProductStock(items, session, -1);

      if (selectedCartItemIdSet) {
        cart.items = cart.items.filter((item) => !selectedCartItemIdSet.has(item._id.toString()));
      } else if (selectedBoxIdSet) {
        cart.items = cart.items.filter((item) => !selectedBoxIdSet.has(item.boxId.toString()));
      } else {
        cart.items = [];
      }
      await cart.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const itemMap = await getOrderItemMap([createdOrder]);
  return mapOrder(createdOrder, itemMap);
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id).populate('userId', 'fullName email phone address');
  if (!order) throw new HttpError(404, 'Order not found');
  const itemMap = await getOrderItemMap([order]);
  return mapOrder(order, itemMap);
};

export const getOrderByIdForUser = async (id, userId) => {
  const order = await Order.findOne({ _id: id, userId });
  if (!order) throw new HttpError(404, 'Order not found');
  const itemMap = await getOrderItemMap([order]);
  return mapOrder(order, itemMap);
};

export const cancelOrderForUser = async (id, userId) => {
  const session = await Order.startSession();
  let cancelledOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: id, userId }).session(session);
      if (!order) throw new HttpError(404, 'Order not found');

      const currentStatus = normalizeOrderStatus(order.orderStatus);
      if (currentStatus !== ORDER_STATUS.PENDING) {
        throw new HttpError(400, 'Only pending orders can be cancelled');
      }

      const boxItems = order.items.filter((item) => item.isBox);
      await Promise.all(boxItems.map((item) => (
        Box.updateOne(
          { _id: item.itemId },
          { $inc: { quantity: item.quantity } },
          { session }
        )
      )));

      if (order.inventoryAdjusted) {
        await adjustProductStock(order.items, session, 1);
        order.inventoryAdjusted = false;
      }

      order.orderStatus = ORDER_STATUS.CANCELLED;
      order.deleteAt = null;
      cancelledOrder = await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const itemMap = await getOrderItemMap([cancelledOrder]);
  return mapOrder(cancelledOrder, itemMap);
};

export const updateOrderStatus = async (id, status) => {
  const session = await Order.startSession();
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(id)
        .populate('userId', 'fullName email phone address')
        .session(session);
      if (!order) throw new HttpError(404, 'Order not found');

      const currentStatus = normalizeOrderStatus(order.orderStatus);

      if (currentStatus === status) {
        updatedOrder = order;
        return;
      }

      if (!canTransitionOrderStatus(currentStatus, status)) {
        const nextStatus = getNextOrderStatus(currentStatus);
        const currentLabel = ORDER_STATUS_LABELS[currentStatus] || currentStatus;
        const nextLabel = nextStatus ? ORDER_STATUS_LABELS[nextStatus] : null;

        throw new HttpError(
          400,
          nextLabel
            ? `Order status can only move from ${currentLabel} to ${nextLabel}`
            : `Order status ${currentLabel} cannot be changed`
        );
      }

      if (status === ORDER_STATUS.CANCELLED) {
        const boxItems = order.items.filter((item) => item.isBox);
        await Promise.all(boxItems.map((item) => (
          Box.updateOne(
            { _id: item.itemId },
            { $inc: { quantity: item.quantity } },
            { session }
          )
        )));

        if (order.inventoryAdjusted) {
          await adjustProductStock(order.items, session, 1);
          order.inventoryAdjusted = false;
        }
      }

      order.orderStatus = status;
      order.deleteAt = status === ORDER_STATUS.DELETED ? new Date(Date.now() + DELETED_ORDER_TTL_MS) : null;
      updatedOrder = await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  const itemMap = await getOrderItemMap([updatedOrder]);
  return mapOrder(updatedOrder, itemMap);
};

export const updateOrderCreatedAt = async (id, createdAt) => {
  const order = await Order.findById(id).select('_id');
  if (!order) throw new HttpError(404, 'Order not found');

  await Order.collection.updateOne(
    { _id: order._id },
    { $set: { createdAt, updatedAt: new Date() } }
  );

  return getOrderById(id);
};

export const getOrderStats = async () => {
  const [total, pending, confirmed, delivering, delivered, deleted, cancelled] =
    await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: ORDER_STATUS.PENDING }),
      Order.countDocuments({ orderStatus: { $in: [ORDER_STATUS.CONFIRMED, 'preparing'] } }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERING }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERED }),
      Order.countDocuments({ orderStatus: ORDER_STATUS.DELETED }),
      Order.countDocuments({ orderStatus: { $in: [ORDER_STATUS.CANCELLED, 'Cancel', 'cancel'] } })
    ]);

  return { total, pending, confirmed, delivering, delivered, deleted, cancelled };
};
