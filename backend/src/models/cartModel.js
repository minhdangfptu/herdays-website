import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    boxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Box',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
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
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: {
      type: [cartItemSchema],
      default: []
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

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
