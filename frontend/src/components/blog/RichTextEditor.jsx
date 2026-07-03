import { AlignCenter, AlignLeft, AlignRight, ImagePlus, Link as LinkIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cloudinaryApi } from '../../services/apiService.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const editorButtonClassName = 'flex h-10 w-10 items-center justify-center rounded-xl border border-pink-100 bg-white text-slate-600 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50'

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const normalizeUrl = (value) => {
  const trimmedValue = value.trim()
  if (!trimmedValue) return ''
  if (/^(https?:|mailto:)/i.test(trimmedValue)) return trimmedValue
  return `https://${trimmedValue}`
}

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)
  const selectionRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const saveSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return

    const range = selection.getRangeAt(0)
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange()
    }
  }

  const restoreSelection = () => {
    if (!selectionRef.current) return
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(selectionRef.current)
  }

  const syncValue = () => {
    onChange(editorRef.current?.innerHTML || '')
    saveSelection()
  }

  const updateLinks = () => {
    editorRef.current?.querySelectorAll('a').forEach((anchor) => {
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
    })
  }

  const runCommand = (command, commandValue = null) => {
    editorRef.current?.focus()
    restoreSelection()
    document.execCommand(command, false, commandValue)
    updateLinks()
    syncValue()
  }

  const getSelectedBlocks = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || selection.rangeCount === 0) return []

    const range = selection.getRangeAt(0)
    const blocks = Array.from(editor.querySelectorAll('p,h2,h3,div,li,blockquote'))
      .filter((block) => range.intersectsNode(block))

    if (blocks.length > 0) return blocks

    const startNode = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer
      : range.startContainer.parentElement
    const currentBlock = startNode?.closest?.('p,h2,h3,div,li,blockquote')
    return currentBlock && editor.contains(currentBlock) ? [currentBlock] : []
  }

  const applySize = (size) => {
    editorRef.current?.focus()
    restoreSelection()

    if (size === 'header') {
      document.execCommand('formatBlock', false, 'h2')
    } else {
      document.execCommand('formatBlock', false, 'p')
    }

    getSelectedBlocks().forEach((block) => {
      if (size === 'small') {
        block.style.fontSize = '0.875rem'
      } else {
        block.style.removeProperty('font-size')
      }
    })

    syncValue()
  }

  const handleInsertLink = () => {
    editorRef.current?.focus()
    restoreSelection()

    const url = normalizeUrl(window.prompt('Nhập URL liên kết') || '')
    if (!url) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      const label = window.prompt('Nhập nội dung hiển thị') || url
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      )
    } else {
      document.execCommand('createLink', false, url)
      updateLinks()
    }

    syncValue()
  }

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/') || file.size > MAX_FILE_SIZE) {
      setErrorMessage('Chỉ chấp nhận file ảnh có dung lượng tối đa 5 MB.')
      return
    }

    setIsUploading(true)
    setErrorMessage('')
    try {
      editorRef.current?.focus()
      restoreSelection()
      const image = await cloudinaryApi.uploadImage(file)
      document.execCommand(
        'insertHTML',
        false,
        `<figure><img src="${escapeHtml(image.url)}" alt="" loading="lazy" /></figure><p><br></p>`
      )
      syncValue()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-pink-100 bg-pink-50/40 p-2">
        <select
          className="h-10 rounded-xl border border-pink-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
          defaultValue="normal"
          onChange={(event) => applySize(event.target.value)}
          onMouseDown={saveSelection}
        >
          <option value="header">Header</option>
          <option value="normal">Normal</option>
          <option value="small">Small</option>
        </select>

        <button className={editorButtonClassName} type="button" title="Căn trái" aria-label="Căn trái" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('justifyLeft')}>
          <AlignLeft size={18} />
        </button>
        <button className={editorButtonClassName} type="button" title="Căn giữa" aria-label="Căn giữa" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('justifyCenter')}>
          <AlignCenter size={18} />
        </button>
        <button className={editorButtonClassName} type="button" title="Căn phải" aria-label="Căn phải" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('justifyRight')}>
          <AlignRight size={18} />
        </button>
        <button className={editorButtonClassName} type="button" title="Chèn liên kết" aria-label="Chèn liên kết" onMouseDown={(event) => event.preventDefault()} onClick={handleInsertLink}>
          <LinkIcon size={18} />
        </button>
        <button
          className={editorButtonClassName}
          type="button"
          title="Upload ảnh vào nội dung"
          aria-label="Upload ảnh vào nội dung"
          onMouseDown={saveSelection}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <ImagePlus size={18} />
        </button>
        <input ref={fileInputRef} className="sr-only" type="file" accept="image/*" onChange={handleImageSelected} disabled={isUploading} />
      </div>

      <div
        ref={editorRef}
        className="blog-content min-h-72 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
        contentEditable
        role="textbox"
        aria-label="Nội dung bài viết"
        onBlur={saveSelection}
        onInput={syncValue}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        suppressContentEditableWarning
      />
      {isUploading && <p className="text-sm font-medium text-slate-500">Đang tải ảnh...</p>}
      {errorMessage && <p className="text-sm font-medium text-red-600" role="alert">{errorMessage}</p>}
    </div>
  )
}

export default RichTextEditor
