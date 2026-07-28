import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { setLenis } from './lenisInstance.js'

export function SmoothScroll() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frameId = null

    const destroy = () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      frameId = null
      lenisRef.current?.destroy()
      lenisRef.current = null
      setLenis(null)
    }

    const setup = () => {
      destroy()

      if (!desktopQuery.matches || reducedMotionQuery.matches) return

      const lenis = new Lenis({
        autoRaf: false,
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        stopInertiaOnNavigate: true,
        prevent: (node) => Boolean(node?.closest?.('[data-lenis-prevent]')),
      })

      lenisRef.current = lenis
      setLenis(lenis)

      const raf = (time) => {
        lenis.raf(time)
        frameId = window.requestAnimationFrame(raf)
      }

      frameId = window.requestAnimationFrame(raf)
    }

    setup()

    const handlePreferenceChange = () => setup()
    desktopQuery.addEventListener?.('change', handlePreferenceChange)
    reducedMotionQuery.addEventListener?.('change', handlePreferenceChange)

    return () => {
      desktopQuery.removeEventListener?.('change', handlePreferenceChange)
      reducedMotionQuery.removeEventListener?.('change', handlePreferenceChange)
      destroy()
    }
  }, [])

  return null
}
