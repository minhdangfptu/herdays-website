import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import facebookLogo from '../../assets/facebook-logo.png'
import herdaysLogo from '../../assets/herdays-logo.png'
import { authApi, setAuthSession } from '../../services/apiService.js'
import './LoginPage.scss'
import toast from 'react-hot-toast'

const GOOGLE_SCRIPT_ID = 'google-identity-services'
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

const loadGoogleIdentityScript = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) {
    resolve()
    return
  }

  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)
  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true })
    existingScript.addEventListener('error', reject, { once: true })
    return
  }

  const script = document.createElement('script')
  script.id = GOOGLE_SCRIPT_ID
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = resolve
  script.onerror = reject
  document.head.appendChild(script)
})

function FieldIcon({ type }) {
  if (type === 'email') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M15.8 15.6c-1.2 0-1.8-.7-1.8-1.7v-4.1m0 0a3.2 3.2 0 1 0 0 4.4m0-4.4v4.1c0 1 .6 1.7 1.8 1.7 2.1 0 3.7-1.8 3.7-4.3A7.6 7.6 0 1 0 16.6 17" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="9.5" width="15" height="11" rx="2.5" />
      <path d="M7.5 9.5V7a4.5 4.5 0 0 1 9 0v2.5M12 14v2" />
    </svg>
  )
}

function PasswordToggleIcon({ isVisible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.3-5 9.5-5 9.5 5 9.5 5-3.3 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.5" />
      {!isVisible && <path d="m4 4 16 16" />}
    </svg>
  )
}

function MoodCard() {
  return (
    <div className="mood-card" aria-hidden="true">
      <div className="mood-card__heading">
        <span>Điểm tâm trạng</span>
        <span className="mood-card__key" />
      </div>
      <svg viewBox="0 0 118 88" role="presentation">
        <path className="mood-card__axis" d="M15 6v68h96M15 20h-4M15 38h-4M15 56h-4" />
        <path className="mood-card__grid" d="M43 28v46M72 28v46M101 14v60" />
        <path className="mood-card__line" d="m15 58 28-19h29l29-16" />
        <g className="mood-card__points">
          <circle cx="15" cy="58" r="4" />
          <circle cx="43" cy="39" r="4" />
          <circle cx="72" cy="39" r="4" />
          <circle cx="101" cy="23" r="4" />
        </g>
        <g className="mood-card__labels">
          <text x="4" y="61">1</text>
          <text x="4" y="42">2</text>
          <text x="4" y="24">3</text>
          <text x="4" y="8">4</text>
          <text x="10" y="86">T9</text>
          <text x="36" y="86">T10</text>
          <text x="65" y="86">T11</text>
          <text x="94" y="86">T12</text>
        </g>
      </svg>
    </div>
  )
}

function CycleChart() {
  const bars = [54, 76, 36, 54, 78]

  return (
    <div className="cycle-visual" aria-hidden="true">
      <div className="cycle-card">
        <div className="cycle-card__header">
          <strong>Xu hướng độ dài kì kinh</strong>
          <span><i />Số ngày hành kinh</span>
        </div>

        <img className="cycle-card__watermark" src={herdaysLogo} alt="" />

        <div className="cycle-card__y-labels">
          {[7, 6, 5, 4, 3, 2].map((value) => <span key={value}>{value} ng</span>)}
        </div>

        <div className="cycle-card__plot">
          <div className="cycle-card__bars">
            {bars.map((height, index) => (
              <span key={index} style={{ '--bar-height': `${height}%` }} />
            ))}
          </div>
          <div className="cycle-card__x-labels">
            {['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map((label) => <span key={label}>{label}</span>)}
          </div>
        </div>
      </div>

      <MoodCard />

      <div className="carousel-dots">
        <span className="is-active" />
        <span />
        <span />
      </div>
    </div>
  )
}

function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const isGoogleInitialized = useRef(false)
  const isGoogleButtonRendered = useRef(false)
  const googleButtonRef = useRef(null)
  const navigate = useNavigate()

  const completeLogin = useCallback((result) => {
    setAuthSession(result)
    navigate(result.user.role === 'admin' ? '/admin/posts' : '/blog')
  }, [navigate])

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response.credential) {
      setErrorMessage('Không nhận được thông tin đăng nhập từ Google.')
      toast.error('Không nhận được thông tin đăng nhập từ Google.')
      return
    }

    setIsGoogleSubmitting(true)
    setErrorMessage('')

    try {
      const result = await authApi.socialLogin({
        provider: 'google',
        idToken: response.credential
      })
      toast.success('Đăng nhập thành công!')
      completeLogin(result)
    } catch (error) {
      setErrorMessage(error.message)
      toast.error(error.message)
    } finally {
      setIsGoogleSubmitting(false)
    }
  }, [completeLogin])

  const initializeGoogleIdentity = useCallback(async () => {
    await loadGoogleIdentityScript()

    if (isGoogleInitialized.current) return

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential
    })
    isGoogleInitialized.current = true
  }, [handleGoogleCredential])

  const renderGoogleButton = useCallback(async () => {
    if (!googleClientId || !googleButtonRef.current || isGoogleButtonRendered.current) return

    await initializeGoogleIdentity()

    const buttonWidth = Math.min(400, Math.max(200, googleButtonRef.current.offsetWidth || 240))
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      locale: 'vi',
      width: buttonWidth
    })
    isGoogleButtonRendered.current = true
  }, [initializeGoogleIdentity])

  useEffect(() => {
    if (!googleClientId) return

    renderGoogleButton()
      .catch(() => {
        setErrorMessage('Không thể tải đăng nhập Google. Vui lòng thử lại sau.')
        toast.error('Không thể tải đăng nhập Google. Vui lòng thử lại sau.')
      })
  }, [renderGoogleButton])

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const result = await authApi.login({
        identifier: formData.get('identifier'),
        password: formData.get('password')
      })
      toast.success("Đăng nhập thành công!");
      completeLogin(result)
    } catch (error) {
      setErrorMessage(error.message)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-form-panel" aria-labelledby="login-title">
      <div className="login-form-panel__content">
      <img className="brand-logo" src={herdaysLogo} alt="Herdays" />

      <div className="login-copy">
        <h1 id="login-title">Đăng nhập</h1>
        <p>Chào mừng bạn quay trở lại. Hãy nhập thông tin của bạn</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email/Số điện thoại</span>
          <span className="input-shell">
            <span className="field-icon"><FieldIcon type="email" /></span>
            <input
              type="text"
              name="identifier"
              autoComplete="username"
              placeholder="Nhập địa chỉ Email hoặc số điện thoại của bạn"
              required
            />
          </span>
        </label>

        <label className="form-field">
          <span>Mật khẩu</span>
          <span className="input-shell">
            <span className="field-icon"><FieldIcon type="password" /></span>
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="Nhập mật khẩu của bạn"
              required
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-pressed={isPasswordVisible}
              onClick={() => setIsPasswordVisible((value) => !value)}
            >
              <PasswordToggleIcon isVisible={isPasswordVisible} />
            </button>
          </span>
        </label>

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" name="remember" />
            <span>Ghi nhớ tôi</span>
          </label>
          <a href="#forgot-password">Quên mật khẩu?</a>
        </div>

        {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}
        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="divider"><span>Hoặc</span></div>

        <div className="social-login">
          <div
            className="google-login-button"
            ref={googleButtonRef}
            aria-label="Đăng nhập với Google"
            aria-busy={isGoogleSubmitting}
          >
            {!googleClientId && <span>Google login chưa được cấu hình</span>}
          </div>
          <button
            type="button"
            disabled
            title="Đăng nhập với Facebook chưa được hỗ trợ"
          >
            <img src={facebookLogo} alt="" />
            <span>Đăng nhập với Facebook</span>
          </button>
        </div>

        <p className="register-prompt">
          Chưa có tài khoản? <a href="/register">Đăng ký</a>
        </p>
      </form>
      </div>
    </section>
  )
}

function WelcomePanel() {
  return (
    <aside className="welcome-panel">
      <div className="welcome-panel__content">
      <div className="welcome-copy">
        <h2>CHÀO MỪNG BẠN!</h2>
        <p className="welcome-lead">
          Hãy đăng nhập để sử dụng<br />toàn bộ tính năng của <u>Herdays</u>
        </p>
        <p className="welcome-description">
          HERDAYS - Nền tảng chăm sóc sức khoẻ nữ giới và<br />dịch vụ Subcription Box
        </p>
      </div>
      <CycleChart />
      </div>
    </aside>
  )
}

function LoginPage() {
  return (
    <main className="login-page relative isolate grid min-h-svh place-items-center overflow-hidden bg-[#f9eef2] p-4">
      <div className="login-card grid w-full max-w-[1100px] overflow-hidden rounded-xl bg-white min-[961px]:h-[min(700px,calc(100svh-32px))]">
        <LoginForm />
        <WelcomePanel />
      </div>
    </main>
  )
}

export default LoginPage
