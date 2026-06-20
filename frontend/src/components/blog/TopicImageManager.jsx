import { useState } from 'react'

import { blogApi } from '../../services/apiService.js'
import ImageUploader from './ImageUploader.jsx'

function TopicImageManager({ topics, onUpdated }) {
  const [savingTopicId, setSavingTopicId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleUploaded = async (topicId, image) => {
    setSavingTopicId(topicId)
    setErrorMessage('')
    try {
      const result = await blogApi.updateTopicImage(topicId, image.url)
      onUpdated(result.message)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSavingTopicId('')
    }
  }

  return (
    <section className="mb-8 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="mb-5 text-2xl font-bold text-slate-800">Ảnh chủ đề</h2>
      {errorMessage && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{errorMessage}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <article className="overflow-hidden rounded-2xl border border-slate-100" key={topic._id}>
            {topic.imgThumbnail ? (
              <img className="aspect-[16/9] w-full object-cover" src={topic.imgThumbnail} alt={topic.name} />
            ) : <div className="aspect-[16/9] bg-pink-50" />}
            <div className="p-4">
              <h3 className="mb-3 font-bold text-slate-800">{topic.name}</h3>
              <ImageUploader
                label="Đổi ảnh"
                onUploaded={(image) => handleUploaded(topic._id, image)}
                disabled={savingTopicId === topic._id}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TopicImageManager
