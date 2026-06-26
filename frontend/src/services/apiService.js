const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')
const API_BASE_URL = configuredBackendUrl
  ? `${configuredBackendUrl}${configuredBackendUrl.endsWith('/herdays-api') ? '' : '/herdays-api'}`
  : '/herdays-api'

let refreshTokenRequest = null

export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event('auth-state-change'))
}

export const setAuthSession = ({ accessToken, refreshToken, user }) => {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('userRole', user.role)
  notifyAuthChanged()
}

export const clearAuthSession = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userRole')
  notifyAuthChanged()
}

export const hasAuthSession = () => Boolean(localStorage.getItem('refreshToken'))

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.success !== true) {
    const error = new Error(payload.message || 'Không thể kết nối đến máy chủ.')
    error.statusCode = payload.statusCode || response.status
    error.details = payload.errors || null
    throw error
  }
  return payload
}

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('Phiên đăng nhập đã hết hạn.')

  if (!refreshTokenRequest) {
    refreshTokenRequest = fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })
      .then(parseResponse)
      .then((response) => {
        const tokens = response.data
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        notifyAuthChanged()
        return tokens.accessToken
      })
      .catch((error) => {
        clearAuthSession()
        throw error
      })
      .finally(() => {
        refreshTokenRequest = null
      })
  }

  return refreshTokenRequest
}

const request = async (path, { method = 'GET', body, isAuthenticated = false } = {}) => {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (isAuthenticated) {
    const token = localStorage.getItem('accessToken') || await refreshAccessToken()
    headers.Authorization = `Bearer ${token}`
  }

  const requestConfig = {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestConfig)

  try {
    return await parseResponse(response)
  } catch (error) {
    if (!isAuthenticated || error.statusCode !== 401) throw error

    const accessToken = await refreshAccessToken()
    requestConfig.headers.Authorization = `Bearer ${accessToken}`
    return parseResponse(await fetch(`${API_BASE_URL}${path}`, requestConfig))
  }
}

export const authApi = {
  login: async (credentials) => {
    const response = await request('/auth/login', { method: 'POST', body: credentials })
    return response.data
  },
  refreshToken: async () => refreshAccessToken(),
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return
    await request('/auth/logout', {
      method: 'POST',
      body: { refreshToken }
    })
  }
}

export const blogApi = {
  getTopics: async () => {
    const response = await request('/blog/topics')
    return { topics: response.data }
  },
  getTopicPosts: async (topicId, page = 1) => {
    const response = await request(`/blog/topics/${topicId}/posts?page=${page}`)
    return {
      topic: response.meta?.topic || null,
      posts: response.data,
      pagination: response.meta
    }
  },
  getPost: async (postId) => {
    const response = await request(`/blog/posts/${postId}`)
    return { post: response.data }
  },
  getAdminPosts: async () => {
    const response = await request('/admin/posts', { isAuthenticated: true })
    return { posts: response.data, pagination: response.meta }
  },
  getAdminPost: async (postId) => {
    const response = await request(`/admin/posts/${postId}`, { isAuthenticated: true })
    return { post: response.data }
  },
  createPost: async (post) => {
    const response = await request('/admin/posts', {
      method: 'POST',
      body: post,
      isAuthenticated: true
    })
    return { message: response.message, post: response.data }
  },
  updatePost: async (postId, post) => {
    const response = await request(`/admin/posts/${postId}`, {
      method: 'PUT',
      body: post,
      isAuthenticated: true
    })
    return { message: response.message, post: response.data }
  },
  updateTopicImage: async (topicId, imgThumbnail) => {
    const response = await request(`/admin/topics/${topicId}/image`, {
      method: 'PUT',
      body: { imgThumbnail },
      isAuthenticated: true
    })
    return { message: response.message, topic: response.data }
  }
}

export const cloudinaryApi = {
  uploadImage: async (file) => {
    const signatureResponse = await request('/admin/uploads/signature', {
      method: 'POST',
      isAuthenticated: true
    })
    const { uploadUrl, apiKey, timestamp, folder, signature } = signatureResponse.data
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp)
    formData.append('folder', folder)
    formData.append('signature', signature)

    const response = await fetch(uploadUrl, { method: 'POST', body: formData })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok || !payload.secure_url) {
      throw new Error(payload.error?.message || 'Không thể tải ảnh lên Cloudinary.')
    }

    return {
      url: payload.secure_url,
      publicId: payload.public_id,
      width: payload.width,
      height: payload.height
    }
  }
}
