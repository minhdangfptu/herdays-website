import { useRef, useState } from 'react'

import { cloudinaryApi } from '../../services/apiService.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024

function ImageUploader({ label, multiple = false, maxFiles = 1, onUploaded, disabled = false }) {
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length === 0) return

    if (files.length > maxFiles) {
      setErrorMessage(`Chỉ được chọn tối đa ${maxFiles} ảnh.`)
      return
    }

    const invalidFile = files.find((file) => !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE)
    if (invalidFile) {
      setErrorMessage('Chỉ chấp nhận file ảnh có dung lượng tối đa 5 MB.')
      return
    }

    setIsUploading(true)
    setErrorMessage('')
    try {
      const uploadedImages = await Promise.all(files.map(cloudinaryApi.uploadImage))
      onUploaded(multiple ? uploadedImages : uploadedImages[0])
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFiles}
        disabled={disabled || isUploading}
      />
      <button
        className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-bold text-pink-600 transition hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
      >
        {isUploading ? 'Đang tải ảnh...' : label}
      </button>
      {errorMessage && <p className="mt-2 text-sm font-medium text-red-600" role="alert">{errorMessage}</p>}
    </div>
  )
}

export default ImageUploader
