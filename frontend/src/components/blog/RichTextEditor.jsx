import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ImagePlus,
  Link as LinkIcon,
  List,
  ListOrdered
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cloudinaryApi } from '../../services/apiService.js'
import '../../pages/Blog/Blog.scss'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const TYPING_SIZE_PLACEHOLDER = '\u200B'
const inlineFontSizeByOption = {
  header: '1.75rem',
  normal: '1.0625rem',
  small: '0.875rem'
}
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
  const [linkForm, setLinkForm] = useState({
    isOpen: false,
    text: '',
    url: '',
    error: ''
  })

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

  const cleanupTypingSizeMarkers = useCallback((root) => {
    root?.querySelectorAll('[data-typing-size="true"]').forEach((marker) => {
      const textNodes = document.createTreeWalker(marker, NodeFilter.SHOW_TEXT)
      let currentNode = textNodes.nextNode()

      while (currentNode) {
        currentNode.nodeValue = currentNode.nodeValue.replaceAll(TYPING_SIZE_PLACEHOLDER, '')
        currentNode = textNodes.nextNode()
      }

      marker.removeAttribute('data-typing-size')

      if (!marker.textContent && marker.children.length === 0) {
        marker.remove()
      }
    })
  }, [])

  const getCleanEditorHtml = useCallback(() => {
    if (!editorRef.current) return ''

    const cleanEditor = editorRef.current.cloneNode(true)
    cleanupTypingSizeMarkers(cleanEditor)
    return cleanEditor.innerHTML
  }, [cleanupTypingSizeMarkers])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || document.activeElement === editor) return

    if (getCleanEditorHtml() !== (value || '')) {
      editor.innerHTML = value || ''
    }
  }, [getCleanEditorHtml, value])

  const syncValue = () => {
    onChange(getCleanEditorHtml())
    saveSelection()
  }

  const handleInput = () => {
    syncValue()
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

  const removeNestedFontSizes = (element) => {
    element.querySelectorAll('[style]').forEach((node) => {
      node.style.removeProperty('font-size')
      if (!node.getAttribute('style')) node.removeAttribute('style')
    })
  }

  const applyInlineSize = (size) => {
    const editor = editorRef.current
    const selection = window.getSelection()
    const fontSize = inlineFontSizeByOption[size]

    if (!editor || !selection || selection.rangeCount === 0 || !fontSize) return 'none'

    const range = selection.getRangeAt(0)
    if (!editor.contains(range.commonAncestorContainer)) return 'none'

    if (selection.isCollapsed) {
      const marker = document.createElement('span')
      marker.style.fontSize = fontSize
      marker.dataset.typingSize = 'true'
      marker.textContent = TYPING_SIZE_PLACEHOLDER

      range.insertNode(marker)
      range.setStart(marker.firstChild, TYPING_SIZE_PLACEHOLDER.length)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      selectionRef.current = range.cloneRange()

      return 'pending'
    }

    const span = document.createElement('span')
    span.style.fontSize = fontSize

    const fragment = range.extractContents()
    span.appendChild(fragment)
    removeNestedFontSizes(span)
    range.insertNode(span)

    const nextRange = document.createRange()
    nextRange.selectNodeContents(span)
    selection.removeAllRanges()
    selection.addRange(nextRange)
    selectionRef.current = nextRange.cloneRange()

    return 'applied'
  }

  const applySize = (size) => {
    editorRef.current?.focus()
    restoreSelection()

    const applyResult = applyInlineSize(size)

    if (applyResult === 'applied') {
      syncValue()
      return
    }

    if (applyResult === 'pending') {
      saveSelection()
    }
  }

  const handleOpenLinkModal = () => {
    editorRef.current?.focus()
    restoreSelection()

    const selection = window.getSelection()
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null
    const hasEditorSelection = Boolean(
      range && editorRef.current?.contains(range.commonAncestorContainer)
    )
    const selectedText = hasEditorSelection && !selection.isCollapsed ? selection.toString() : ''

    if (range && hasEditorSelection) {
      selectionRef.current = range.cloneRange()
    }

    setLinkForm({
      isOpen: true,
      text: selectedText,
      url: '',
      error: ''
    })
  }

  const handleCloseLinkModal = () => {
    setLinkForm({ isOpen: false, text: '', url: '', error: '' })
  }

  const handleLinkFormChange = (event) => {
    const { name, value } = event.target
    setLinkForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      error: ''
    }))
  }

  const handleSubmitLink = (event) => {
    event?.preventDefault()

    const url = normalizeUrl(linkForm.url)
    const label = linkForm.text.trim()

    if (!label) {
      setLinkForm((currentForm) => ({
        ...currentForm,
        error: 'Vui lòng nhập cụm text hiển thị cho liên kết.'
      }))
      return
    }

    if (!url) {
      setLinkForm((currentForm) => ({
        ...currentForm,
        error: 'Vui lòng nhập URL liên kết.'
      }))
      return
    }

    editorRef.current?.focus()
    restoreSelection()
    document.execCommand(
      'insertHTML',
      false,
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
    )
    updateLinks()
    syncValue()
    handleCloseLinkModal()
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
          defaultValue=""
          onChange={(event) => {
            applySize(event.target.value)
            event.target.value = ''
          }}
          onMouseDown={saveSelection}
        >
          <option value="" disabled>Cỡ chữ</option>
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
        <button className={editorButtonClassName} type="button" title="Bullet list" aria-label="Bullet list" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('insertUnorderedList')}>
          <List size={18} />
        </button>
        <button className={editorButtonClassName} type="button" title="Number list" aria-label="Number list" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('insertOrderedList')}>
          <ListOrdered size={18} />
        </button>
        <button className={editorButtonClassName} type="button" title="Chèn liên kết" aria-label="Chèn liên kết" onMouseDown={(event) => event.preventDefault()} onClick={handleOpenLinkModal}>
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

      {linkForm.isOpen && (
        <div
          className="grid gap-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-lg"
          role="dialog"
          aria-label="Chèn liên kết"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSubmitLink(event)
            }

            if (event.key === 'Escape') {
              handleCloseLinkModal()
            }
          }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-600" htmlFor="blog-link-text">
              Cụm text hiển thị
            </label>
            <input
              id="blog-link-text"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              name="text"
              value={linkForm.text}
              onChange={handleLinkFormChange}
              placeholder="Ví dụ: xem thêm tại đây"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-600" htmlFor="blog-link-url">
              URL liên kết
            </label>
            <input
              id="blog-link-url"
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
              name="url"
              value={linkForm.url}
              onChange={handleLinkFormChange}
              placeholder="https://example.com"
            />
          </div>

          {linkForm.error && (
            <p className="text-sm font-medium text-red-600" role="alert">{linkForm.error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              type="button"
              onClick={handleCloseLinkModal}
            >
              Hủy
            </button>
            <button
              className="rounded-xl bg-pink-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-pink-600"
              type="button"
              onClick={handleSubmitLink}
            >
              Chèn liên kết
            </button>
          </div>
        </div>
      )}

      <div
        ref={editorRef}
        className="blog-content min-h-72 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
        contentEditable
        role="textbox"
        aria-label="Nội dung bài viết"
        onBlur={saveSelection}
        onInput={handleInput}
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
