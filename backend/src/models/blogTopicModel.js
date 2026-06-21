import mongoose from 'mongoose';

const blogTopicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    },
    imgThumbnail: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true,
    collection: 'posts_topics'
  }
);

const BlogTopic = mongoose.model('BlogTopic', blogTopicSchema);

export default BlogTopic;
