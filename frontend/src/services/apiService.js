import { translateError, translateFieldError } from '../utils/translateError.js'

const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')
const API_BASE_URL = configuredBackendUrl
  ? `${configuredBackendUrl}${configuredBackendUrl.endsWith('/herdays-api') ? '' : '/herdays-api'}`
  : import.meta.env.DEV
    ? 'http://localhost:8080/herdays-api'
    : '/herdays-api'

let refreshTokenRequest = null

export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event('auth-state-change'))
}

export const setAuthSession = ({ accessToken, refreshToken, user }) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken)
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
  if (user?.role) localStorage.setItem('userRole', user.role)
  notifyAuthChanged()
}

export const clearAuthSession = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userRole')
  notifyAuthChanged()
}

export const hasAuthSession = () => Boolean(localStorage.getItem('refreshToken'))

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.success !== true) {
    const rawMessage = payload.message || 'Unable to connect to server.'
    const message = translateError(rawMessage)
    const error = new Error(message)
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
  register: async (payload) => {
    const response = await request('/auth/register', {
      method: 'POST',
      body: payload
    })
    return response.data
  },
  confirmOtp: async ({ identifier, otp, purpose }) => {
    const response = await request('/auth/confirm-otp', {
      method: 'POST',
      body: { identifier, otp, purpose }
    })
    return response.data
  },
  login: async (credentials) => {
    const response = await request('/auth/login', { method: 'POST', body: credentials })
    return response.data
  },
  forgotPassword: async ({ identifier }) => {
    const response = await request('/auth/forgot-password', {
      method: 'POST',
      body: { identifier }
    })
    return response.data
  },
  forgotPasswordByEmail: async ({ email }) => {
    const response = await request('/auth/forgot-password/email', {
      method: 'POST',
      body: { email }
    })
    return response.data
  },
  forgotPasswordByPhoneNumber: async ({ phone }) => {
    const response = await request('/auth/forgot-password/phone-number', {
      method: 'POST',
      body: { phone }
    })
    return response.data
  },
  resetPassword: async ({ resetToken, newPassword }) => {
    const response = await request('/auth/reset-password', {
      method: 'POST',
      body: { resetToken, newPassword }
    })
    return response.data
  },
  refreshToken: async () => refreshAccessToken(),
  socialLogin: async ({ provider, idToken, accessToken }) => {
    const response = await request('/auth/social-login', {
      method: 'POST',
      body: { provider, idToken, accessToken }
    })
    return response.data
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return
    await request('/auth/logout', {
      method: 'POST',
      body: { refreshToken }
    })
  },
  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await request('/auth/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
      isAuthenticated: true
    })
    return response.data
  }
}

export const profileApi = {
  getProfile: async () => {
    const response = await request('/profile', { isAuthenticated: true })
    return response.data
  },
  updateProfile: async (updates) => {
    const response = await request('/profile', {
      method: 'PUT',
      body: updates,
      isAuthenticated: true
    })
    return { message: response.message, profile: response.data }
  }
}

export const blogApi = {
  getTopics: async () => {
    const response = await request('/blog/topics')
    return { topics: response.data }
  },
  getTopicPosts: async (topicId, page = 1) => {
    const response = await request(`/blog/topics/${topicId}/posts${buildQuery({ page })}`)
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
  getAdminPosts: async (params = {}) => {
    const response = await request(`/admin/posts${buildQuery(params)}`, { isAuthenticated: true })
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

export const quizApi = {
  getQuestions: async (tag) => {
    const response = await request(`/quiz/${tag}`)
    return { questions: response.data }
  },
  submitAnswers: async (questionAnswerContent) => {
    const response = await request('/quiz/answers', {
      method: 'POST',
      body: { questionAnswerContent },
      isAuthenticated: true
    })
    return { message: response.message, result: response.data }
  }
}

export const contactApi = {
  submitContact: async (data) => {
    const response = await request('/contacts', {
      method: 'POST',
      body: {
        senderName: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address || null,
        province: data.city,
        topic: data.subject,
        message: data.message
      }
    })
    return { message: response.message, data: response.data, errors: null }
  },
  getFieldErrors: (error) => {
    const details = error.details
    if (!Array.isArray(details)) return {}
    return {
      name: translateFieldError('senderName', details.find((e) => e.field === 'senderName')?.message || ''),
      phone: translateFieldError('phone', details.find((e) => e.field === 'phone')?.message || ''),
      email: translateFieldError('email', details.find((e) => e.field === 'email')?.message || ''),
      address: translateFieldError('address', details.find((e) => e.field === 'address')?.message || ''),
      city: translateFieldError('province', details.find((e) => e.field === 'province')?.message || ''),
      subject: translateFieldError('topic', details.find((e) => e.field === 'topic')?.message || ''),
      message: translateFieldError('message', details.find((e) => e.field === 'message')?.message || '')
    }
  }
}

export const boxApi = {
  list: async (params = {}) => {
    const response = await request(`/box${buildQuery(params)}`)
    return { items: response.data, pagination: response.meta }
  },
  getById: async (id) => {
    const response = await request(`/box/${id}`)
    return response.data
  }
}

export const cartApi = {
  getCart: async () => {
    const response = await request('/cart', { isAuthenticated: true })
    return response.data
  },
  addItem: async ({ boxId, quantity }) => {
    const response = await request('/cart', {
      method: 'POST',
      body: { boxId, quantity },
      isAuthenticated: true
    })
    return response.data
  },
  updateItem: async ({ boxId, quantity }) => {
    const response = await request('/cart', {
      method: 'PUT',
      body: { boxId, quantity },
      isAuthenticated: true
    })
    return response.data
  },
  removeItem: async (boxId) => {
    const response = await request(`/cart/${boxId}`, {
      method: 'DELETE',
      isAuthenticated: true
    })
    return response.data
  },
  clear: async () => {
    const response = await request('/cart', {
      method: 'DELETE',
      isAuthenticated: true
    })
    return response.data
  }
}

export const adminApi = {
  getUsers: async (params = {}) => {
    const response = await request(`/admin/users${buildQuery(params)}`, { isAuthenticated: true })
    return { users: response.data, pagination: response.meta }
  },
  getUser: async (id) => {
    const response = await request(`/admin/users/${id}`, { isAuthenticated: true })
    return { user: response.data }
  },
  disableUser: async (id) => {
    const response = await request(`/admin/users/${id}/disable`, {
      method: 'PATCH',
      isAuthenticated: true
    })
    return { message: response.message, user: response.data }
  },
  getOrders: async (params = {}) => {
    const response = await request(`/admin/orders${buildQuery(params)}`, { isAuthenticated: true })
    return { orders: response.data, pagination: response.meta }
  },
  getOrderStats: async () => {
    const response = await request('/admin/orders/stats', { isAuthenticated: true })
    return response.data
  },
  updateOrderStatus: async (id, orderStatus) => {
    const response = await request(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: { orderStatus },
      isAuthenticated: true
    })
    return response.data
  },
  getContacts: async (params = {}) => {
    const response = await request(`/admin/contacts${buildQuery(params)}`, { isAuthenticated: true })
    return { contacts: response.data, pagination: response.meta }
  },
  updateContactResponseStatus: async (id, isRessponsed) => {
    const response = await request(`/admin/contacts/${id}/response-status`, {
      method: 'PATCH',
      body: { isRessponsed },
      isAuthenticated: true
    })
    return { message: response.message, contact: response.data }
  }
}

export const cloudinaryApi = {
  uploadImage: async (file, type = 'blog') => {
    const signatureResponse = await request(`/admin/uploads/signature${buildQuery({ type })}`, {
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
