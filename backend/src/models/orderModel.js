import mongoose from 'mongoose';
import { ORDER_STATUSES, ORDER_STATUS } from '../constants/orderStatus.js';

const orderItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    isBox: {
      type: Boolean,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    customizedProducts: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
          },
          quantity: {
            type: Number,
            min: 1,
            required: true
          }
        }
      ],
      default: []
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order must have at least one item'
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      default: null
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: ORDER_STATUS.PENDING
    },
    lovelyMessage: {
      type: String,
      default: ''
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    deleteAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
