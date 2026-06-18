import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    passwordHash: {
      type: String,
      select: false
    },
    fullName: {
      type: String,
      trim: true
    },
    avatarUrl: {
      type: String,
      trim: true
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    providerId: {
      type: String,
      trim: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'disabled'],
      default: 'pending'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.index(
  { provider: 1, providerId: 1 },
  {
    unique: true,
    partialFilterExpression: { providerId: { $exists: true, $type: 'string' } }
  }
);

const User = mongoose.model('User', userSchema);

export default User;
