import { useCallback, useEffect, useState } from 'react'
import facebookLogo from '../../assets/facebook-logo.png'
import { authApi } from '../../services/apiService.js'

const FACEBOOK_SCRIPT_ID = 'facebook-jssdk'
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID
const facebookGraphVersion = import.meta.env.VITE_FACEBOOK_GRAPH_VERSION || 'v23.0'

const loadFacebookSdk = () => new Promise((resolve, reject) => {
  if (window.FB) {
    resolve()
    return
  }

  const existingScript = document.getElementById(FACEBOOK_SCRIPT_ID)
  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true })
    existingScript.addEventListener('error', reject, { once: true })
    return
  }

  window.fbAsyncInit = () => {
    window.FB.init({
      appId: facebookAppId,
      cookie: true,
      xfbml: false,
      version: facebookGraphVersion
    })
    resolve()
  }

  const script = document.createElement('script')
  script.id = FACEBOOK_SCRIPT_ID
  script.src = 'https://connect.facebook.net/vi_VN/sdk.js'
  script.async = true
  script.defer = true
  script.crossOrigin = 'anonymous'
  script.onerror = reject
  document.body.appendChild(script)
})

function FacebookAuthButton({
  label = 'Đăng nhập với Facebook',
  onAuthenticated,
  onError
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sdkError, setSdkError] = useState('')

  const reportError = useCallback((message) => {
    onError?.(message || 'Không thể đăng nhập bằng Facebook. Vui lòng thử lại.')
  }, [onError])

  const handleClick = useCallback(async () => {
    if (!facebookAppId) return
    if (sdkError) {
      reportError(sdkError)
      return
    }

    setIsSubmitting(true)

    try {
      await loadFacebookSdk()

      const loginResponse = await new Promise((resolve) => {
        window.FB.login(resolve, { scope: 'public_profile,email' })
      })

      const accessToken = loginResponse.authResponse?.accessToken
      if (!accessToken) {
        reportError('Không nhận được quyền đăng nhập từ Facebook.')
        return
      }

      const result = await authApi.socialLogin({
        provider: 'facebook',
        accessToken
      })
      onAuthenticated?.(result)
    } catch (error) {
      reportError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [onAuthenticated, reportError, sdkError])

  useEffect(() => {
    if (!facebookAppId) return

    loadFacebookSdk()
      .then(() => {
        setSdkError('')
      })
      .catch(() => {
        setSdkError('Không thể tải đăng nhập Facebook. Vui lòng thử lại sau.')
      })
  }, [])

  if (!facebookAppId) {
    return (
      <button
        type="button"
        disabled
        title="Cần cấu hình VITE_FACEBOOK_APP_ID để đăng nhập Facebook"
      >
        <img src={facebookLogo} alt="" />
        <span>{label}</span>
      </button>
    )
  }

  return (
    <button type="button" onClick={handleClick} disabled={isSubmitting}>
      <img src={facebookLogo} alt="" />
      <span>{isSubmitting ? 'Đang kết nối Facebook...' : label}</span>
    </button>
  )
}

export default FacebookAuthButton
