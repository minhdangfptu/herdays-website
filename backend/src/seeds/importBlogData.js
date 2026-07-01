import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import { decodeHTML } from 'entities';
import { v2 as cloudinary } from 'cloudinary';

import env from '../config/environment.js';
import BlogPost from '../models/blogPostModel.js';
import BlogTopic from '../models/blogTopicModel.js';
import User from '../models/userModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..');
const blogDataDir = path.join(rootDir, 'blog-data');

const TOPIC_BY_FOLDER_PREFIX = {
  ivf: {
    name: 'IVF & H\u1ed7 Tr\u1ee3 Sinh S\u1ea3n',
    slug: 'ivf-ho-tro-sinh-san',
    description: 'Ki\u1ebfn th\u1ee9c v\u1ec1 IVF v\u00e0 c\u00e1c ph\u01b0\u01a1ng ph\u00e1p h\u1ed7 tr\u1ee3 sinh s\u1ea3n.'
  },
  'king-nguyet': {
    name: 'Chu K\u1ef3 Kinh Nguy\u1ec7t',
    slug: 'chu-ky-kinh-nguyet',
    description: 'Ki\u1ebfn th\u1ee9c v\u1ec1 chu k\u1ef3, s\u1ee9c kh\u1ecfe kinh nguy\u1ec7t v\u00e0 c\u00e1ch theo d\u00f5i c\u01a1 th\u1ec3.'
  },
  fertility: {
    name: 'Chu\u1ea9n b\u1ecb mang thai & Th\u1ee5 Thai',
    slug: 'chuan-bi-mang-thai-thu-thai',
    description: 'Th\u00f4ng tin chu\u1ea9n b\u1ecb s\u1ee9c kh\u1ecfe v\u00e0 n\u00e2ng cao kh\u1ea3 n\u0103ng th\u1ee5 thai.'
  },
  'pregnancy-care': {
    name: 'Thai K\u1ef3',
    slug: 'thai-ky',
    description: '\u0110\u1ed3ng h\u00e0nh c\u00f9ng m\u1eb9 trong t\u1eebng giai \u0111o\u1ea1n c\u1ee7a thai k\u1ef3.'
  },
  khac: {
    name: 'Kh\u00e1c',
    slug: 'khac',
    description: 'C\u00e1c ch\u1ee7 \u0111\u1ec1 ch\u0103m s\u00f3c s\u1ee9c kh\u1ecfe n\u1eef gi\u1edbi kh\u00e1c.'
  }
};

const normalizeText = (value) => decodeHTML(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getTopicConfig = (folderName) => {
  const normalizedFolderName = folderName.toLowerCase();
  const prefix = Object.keys(TOPIC_BY_FOLDER_PREFIX)
    .find((candidate) => normalizedFolderName.startsWith(candidate));

  if (!prefix) {
    throw new Error(`No topic mapping for blog-data folder: ${folderName}`);
  }

  return TOPIC_BY_FOLDER_PREFIX[prefix];
};

const configureCloudinary = () => {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
};

const getBodyContent = (html) => {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
};

const getTitle = (html, folderName) => {
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
    || html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    || html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i)
    || html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const title = titleMatch ? normalizeText(titleMatch[1]) : '';

  if (!title) {
    throw new Error(`Unable to read title from ${folderName}`);
  }

  return title.slice(0, 200);
};

const rewriteImageSources = (content, imageUrlByName) => content.replace(
  /<img\b([^>]*?)\bsrc=(["'])images\/([^"']+)\2([^>]*)>/gi,
  (_match, before, quote, fileName, after) => {
    const imageUrl = imageUrlByName.get(fileName);
    if (!imageUrl) return _match;

    return `<img${before}src=${quote}${imageUrl}${quote}${after}>`;
  }
);

const sanitizeContent = (content) => sanitizeHtml(content, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'figure', 'figcaption']),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https']
  },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true)
  }
});

const getImageUrls = (content) => [
  ...new Set([...content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((match) => match[1]))
];

const uploadImages = async (folderName) => {
  const sourceDir = path.join(blogDataDir, folderName, 'images');
  const imageUrlByName = new Map();

  if (!fs.existsSync(sourceDir)) return imageUrlByName;

  const targetFolder = `${env.cloudinary.folder}/blog-data/${folderName}`.replace(/\/+/g, '/');

  for (const imageName of fs.readdirSync(sourceDir).sort()) {
    const imagePath = path.join(sourceDir, imageName);
    const publicId = path.parse(imageName).name;
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: targetFolder,
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      resource_type: 'image'
    });

    imageUrlByName.set(imageName, result.secure_url);
  }

  return imageUrlByName;
};

const ensureTopic = async (topicConfig) => BlogTopic.findOneAndUpdate(
  { slug: topicConfig.slug },
  { $set: topicConfig },
  { new: true, upsert: true, runValidators: true }
);

const getImportAuthor = async () => {
  const author = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });

  if (!author) {
    throw new Error('No admin user found. Create an admin account before importing blog data.');
  }

  return author;
};

const getImportFolders = () => {
  const targetFolder = process.env.BLOG_DATA_FOLDER?.trim();
  if (targetFolder) return [targetFolder];

  return fs.readdirSync(blogDataDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
};

const updatePost = async ({ filter, postData, targetPostId }) => {
  if (!targetPostId) {
    await BlogPost.findOneAndUpdate(
      filter,
      { $set: postData },
      { new: true, upsert: true, runValidators: true }
    );
    return;
  }

  const updatedPost = await BlogPost.findByIdAndUpdate(
    targetPostId,
    { $set: postData },
    { new: true, runValidators: true }
  );

  if (!updatedPost) {
    throw new Error(`Post not found: ${targetPostId}`);
  }
};

const importBlogData = async () => {
  configureCloudinary();
  await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDbName });

  const author = await getImportAuthor();
  const folders = getImportFolders();
  const targetPostId = process.env.BLOG_POST_ID?.trim();

  const results = [];

  for (const folderName of folders) {
    const htmlPath = path.join(blogDataDir, folderName, 'NidungWebHerdays.html');
    if (!fs.existsSync(htmlPath)) {
      results.push({ folderName, status: 'skipped', reason: 'missing_html' });
      continue;
    }

    const rawHtml = fs.readFileSync(htmlPath, 'utf8');
    const title = getTitle(rawHtml, folderName);
    const topic = await ensureTopic(getTopicConfig(folderName));

    const imageUrlByName = await uploadImages(folderName);

    const rewrittenContent = rewriteImageSources(getBodyContent(rawHtml), imageUrlByName);
    const content = sanitizeContent(rewrittenContent);
    const images = getImageUrls(content);

    const sourceFilter = images[0]
      ? { images: images[0] }
      : { postTopicId: topic._id, title };

    await updatePost({
      filter: sourceFilter,
      targetPostId,
      postData: {
        postTopicId: topic._id,
        title,
        content,
        authorId: author._id,
        images,
        thumbnail: images[0] || '',
        status: 'Published'
      }
    });

    results.push({ folderName, status: 'imported', title, images: images.length });
  }

  await mongoose.disconnect();
  return results;
};

importBlogData()
  .then((results) => {
    for (const result of results) {
      process.stdout.write(`${result.status}: ${result.folderName}`);
      if (result.title) process.stdout.write(` - ${result.title} (${result.images} images)`);
      if (result.reason) process.stdout.write(` - ${result.reason}`);
      process.stdout.write('\n');
    }
  })
  .catch(async (error) => {
    process.stderr.write(`Unable to import blog data: ${error.message}\n`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
