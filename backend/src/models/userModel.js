import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required() {
        return this.authProvider !== 'google';
      },
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      trim: true,
      default: null
    },
    fullName: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['user_free', 'user_premium', 'admin', 'others'],
      required: true,
      default: 'user_free'
    },
    targetStatus: {
      type: String,
      enum: ['tryingToConceive', 'pregnant', 'ivf', 'normal', 'periodTracking', 'relatives', null],
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    address: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $exists: true, $type: 'string' } }
  }
);

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { googleId: { $exists: true, $type: 'string' } }
  }
);

const User = mongoose.model('User', userSchema);

export default User;
