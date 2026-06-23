import mongoose from 'mongoose';

const boxSchema = new mongoose.Schema(
  {
    boxName: {
      type: String,
      required: true,
      trim: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    description: {
      type: String,
      default: null
    },
    category: {
      type: String,
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

const Box = mongoose.model('Box', boxSchema);

export default Box;
