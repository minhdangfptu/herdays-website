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
    boxSnapshot: {
      boxName: {
        type: String,
        default: null
      },
      thumbnail: {
        type: String,
        default: null
      },
      category: {
        type: String,
        default: null
      },
      products: {
        type: [
          {
            productId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Product',
              required: true
            },
            productName: {
              type: String,
              required: true
            },
            unit: {
              type: String,
              default: null
            },
            thumbnail: {
              type: String,
              default: null
            },
            price: {
              type: Number,
              default: 0,
              min: 0
            },
            quantity: {
              type: Number,
              min: 1,
              default: 1
            },
            isCustomizable: {
              type: Boolean,
              default: false
            },
            selectionGroup: {
              type: String,
              trim: true,
              default: null,
              maxlength: 100
            }
          }
        ],
        default: []
      }
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
    recipientName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null
    },
    recipientPhone: {
      type: String,
      trim: true,
      maxlength: 10,
      default: null
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
    subtotalAmount: {
      type: Number,
      required: false,
      min: 0
    },
    subscriptionMonths: {
      type: Number,
      enum: [1, 3, 6, 12],
      default: 1
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    discountAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    inventoryAdjusted: {
      type: Boolean,
      default: false
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
