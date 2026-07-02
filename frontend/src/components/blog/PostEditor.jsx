import { useState } from 'react'

import { blogApi } from '../../services/apiService.js'
import ImageUploader from './ImageUploader.jsx'
import RichTextEditor from './RichTextEditor.jsx'

const EMPTY_FORM = {
  postTopicId: '',
  title: '',
  content: '',
  images: [],
  thumbnail: '',
  status: 'Draft'
}

const getInitialForm = (post) => post ? {
  postTopicId: post.postTopicId,
  title: post.title,
  content: post.content,
  images: post.images || [],
  thumbnail: post.thumbnail,
  status: post.status
} : EMPTY_FORM

const fieldClassName = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100'

function PostEditor({ post, topics, onSaved, onCancel }) {
  const [form, setForm] = useState(() => getInitialForm(post))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const result = post
        ? await blogApi.updatePost(post._id, form)
        : await blogApi.createPost(form)
      onSaved(result.message)
      if (!post) setForm(EMPTY_FORM)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleThumbnailUploaded = (image) => {
    setForm((current) => ({ ...current, thumbnail: image.url }))
  }

  const handleRemoveThumbnail = () => {
    setForm((current) => ({ ...current, thumbnail: '' }))
  }

  const handleContentChange = (content) => {
    setForm((current) => ({ ...current, content }))
  }

  return (
    <form className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">{post ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'}</h2>
        {post && <button className="text-sm font-semibold text-slate-500 hover:text-pink-600" type="button" onClick={onCancel}>Hủy sửa</button>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-600">
          Chủ đề
          <select className={fieldClassName} name="postTopicId" value={form.postTopicId} onChange={handleChange} required>
            <option value="">Chọn chủ đề</option>
            {topics.map((topic) => <option key={topic._id} value={topic._id}>{topic.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-600">
          Trạng thái
          <select className={fieldClassName} name="status" value={form.status} onChange={handleChange}>
            <option value="Draft">Bản nháp</option>
            <option value="Published">Đã xuất bản</option>
          </select>
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-600">
        Tiêu đề
        <input className={fieldClassName} name="title" value={form.title} maxLength="200" onChange={handleChange} required />
      </label>
      <div className="mt-5 grid gap-2 text-sm font-semibold text-slate-600">
        Nội dung
        <RichTextEditor value={form.content} onChange={handleContentChange} />
      </div>
      <div className="mt-5 grid gap-3">
        <p className="text-sm font-semibold text-slate-600">Ảnh đại diện</p>
        <ImageUploader label={form.thumbnail ? 'Thay ảnh đại diện' : 'Chọn ảnh đại diện'} onUploaded={handleThumbnailUploaded} />
        {form.thumbnail && (
          <div className="relative w-fit">
            <img className="h-28 w-44 rounded-xl object-cover" src={form.thumbnail} alt="Xem trước ảnh đại diện" />
            <button className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-red-600 shadow" type="button" onClick={handleRemoveThumbnail}>Xóa</button>
          </div>
        )}
      </div>

      {errorMessage && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{errorMessage}</p>}
      <button className="mt-6 w-full rounded-xl bg-pink-500 px-5 py-3 font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : post ? 'Cập nhật bài viết' : 'Tạo bài viết'}
      </button>
    </form>
  )
}

export default PostEditor
