import { useCallback, useEffect, useRef, useState } from 'react'
import googleLogo from '../../assets/google-logo.png'
import { authApi } from '../../services/apiService.js'

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

function GoogleAuthButton({
  label = 'Đăng nhập bằng Google',
  buttonText = 'signin_with',
  onAuthenticated,
  onError
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef(null)
  const providerRef = useRef(null)
  const isGoogleInitialized = useRef(false)
  const renderTimerRef = useRef(null)

  const reportError = useCallback((message) => {
    onError?.(message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.')
  }, [onError])

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response.credential) {
      reportError('Không nhận được thông tin đăng nhập từ Google.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await authApi.socialLogin({
        provider: 'google',
        idToken: response.credential
      })
      onAuthenticated?.(result)
    } catch (error) {
      reportError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [onAuthenticated, reportError])

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
    if (!googleClientId || !containerRef.current || !providerRef.current) return

    await initializeGoogleIdentity()

    const width = Math.floor(containerRef.current.getBoundingClientRect().width)

    if (!width) return

    providerRef.current.innerHTML = ''

    window.google.accounts.id.renderButton(providerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: buttonText,
      shape: 'rectangular',
      logo_alignment: 'left',
      locale: 'vi',
      width: Math.max(200, width)
    })
  }, [buttonText, initializeGoogleIdentity])

  useEffect(() => {
    if (!googleClientId || !containerRef.current) return undefined

    const renderSafely = () => {
      window.clearTimeout(renderTimerRef.current)

      renderTimerRef.current = window.setTimeout(() => {
        renderGoogleButton().catch(() => {
          reportError('Không thể tải đăng nhập Google. Vui lòng thử lại sau.')
        })
      }, 80)
    }

    renderSafely()

    const resizeObserver = new ResizeObserver(renderSafely)
    resizeObserver.observe(containerRef.current)

    window.addEventListener('resize', renderSafely)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', renderSafely)
      window.clearTimeout(renderTimerRef.current)
    }
  }, [renderGoogleButton, reportError])

  if (!googleClientId) {
    return (
      <button
        type="button"
        disabled
        title="Cần cấu hình VITE_GOOGLE_CLIENT_ID để đăng nhập Google"
      >
        <img src={googleLogo} alt="" />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div
      className="google-login-button"
      ref={containerRef}
      aria-label={label}
      aria-busy={isSubmitting}
    >
      <div className="google-login-button__facade" aria-hidden="true">
        <img src={googleLogo} alt="" />
        <span>{label}</span>
      </div>
      <div className="google-login-button__provider" ref={providerRef} aria-hidden="true" />
    </div>
  )
}

export default GoogleAuthButton
