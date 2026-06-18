import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    purpose: {
      type: String,
      enum: ['register', 'reset-password'],
      required: true
    },
    otpHash: {
      type: String,
      required: true,
      select: false
    },
    expiresAt: {
      type: Date,
      required: true
    },
    attemptCount: {
      type: Number,
      default: 0
    },
    consumedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ identifier: 1, purpose: 1, consumedAt: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
