const getTargetRect = (targetElement) => {
  if (targetElement) return targetElement.getBoundingClientRect()

  return {
    left: window.innerWidth - 56,
    top: 24,
    width: 32,
    height: 32
  }
}

export const getCartTargetElement = () => (
  document.querySelector('[data-cart-target]')
)

export const getFlyToCartSourceRect = (sourceElement) => {
  if (!sourceElement) return null

  const rect = sourceElement.getBoundingClientRect()
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  }
}

export const flyToCart = ({ sourceElement, sourceRect, targetElement, imageUrl, label = 'San pham' }) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve()
  }

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    return Promise.resolve()
  }

  const activeSourceRect = sourceRect || getFlyToCartSourceRect(sourceElement)
  if (!activeSourceRect) {
    return Promise.resolve()
  }

  const targetRect = getTargetRect(targetElement)

  if (!activeSourceRect.width || !activeSourceRect.height) {
    return Promise.resolve()
  }

  const ghostSize = Math.min(Math.max(activeSourceRect.width, 72), 128)
  const startX = activeSourceRect.left + activeSourceRect.width / 2 - ghostSize / 2
  const startY = activeSourceRect.top + activeSourceRect.height / 2 - ghostSize / 2
  const endX = targetRect.left + targetRect.width / 2 - ghostSize / 2
  const endY = targetRect.top + targetRect.height / 2 - ghostSize / 2

  const ghost = document.createElement('div')
  ghost.setAttribute('aria-hidden', 'true')
  ghost.style.position = 'fixed'
  ghost.style.left = `${startX}px`
  ghost.style.top = `${startY}px`
  ghost.style.width = `${ghostSize}px`
  ghost.style.height = `${ghostSize}px`
  ghost.style.borderRadius = '18px'
  ghost.style.boxShadow = '0 18px 34px rgba(233, 100, 159, 0.28)'
  ghost.style.overflow = 'hidden'
  ghost.style.pointerEvents = 'none'
  ghost.style.zIndex = '9999'
  ghost.style.transform = 'translate3d(0, 0, 0) scale(1)'
  ghost.style.transformOrigin = 'center'
  ghost.style.transition = 'transform 680ms cubic-bezier(0.19, 1, 0.22, 1), opacity 680ms ease'
  ghost.style.background = '#fff'

  const image = document.createElement('img')
  image.src = imageUrl
  image.alt = label
  image.style.width = '100%'
  image.style.height = '100%'
  image.style.objectFit = 'cover'
  image.style.display = 'block'
  ghost.appendChild(image)

  document.body.appendChild(ghost)

  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      ghost.style.transform = `translate3d(${endX - startX}px, ${endY - startY}px, 0) scale(0.18)`
      ghost.style.opacity = '0.15'
    })

    window.setTimeout(() => {
      ghost.remove()
      resolve()
    }, 700)
  })
}
