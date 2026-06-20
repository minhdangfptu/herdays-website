import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    postTopicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogTopic',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    images: {
      type: [String],
      default: []
    },
    thumbnail: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'posts'
  }
);

blogPostSchema.index({ postTopicId: 1, status: 1, createdAt: -1 });
blogPostSchema.index({ status: 1, createdAt: -1 });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;
