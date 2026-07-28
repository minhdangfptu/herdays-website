import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'motion/react'
import { useLocation } from 'react-router-dom'

const revealTransition = {
  duration: 0.42,
  ease: [0.16, 1, 0.3, 1],
}

export function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

export function PageTransition({ children, className = '' }) {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${location.pathname}${location.search}`}
        className={`site-route-motion ${className}`.trim()}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={shouldReduceMotion ? { duration: 0.12 } : revealTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function Reveal({ children, className = '', delay = 0, as = 'div', ...props }) {
  const shouldReduceMotion = useReducedMotion()
  const MotionElement = motion[as] || motion.div

  return (
    <MotionElement
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={shouldReduceMotion ? { duration: 0.12 } : { ...revealTransition, delay }}
      {...props}
    >
      {children}
    </MotionElement>
  )
}

export function MotionCard({ children, className = '', delay = 0, as = 'div', ...props }) {
  const shouldReduceMotion = useReducedMotion()
  const MotionElement = motion[as] || motion.div

  return (
    <MotionElement
      className={`motion-card ${className}`.trim()}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={shouldReduceMotion ? { duration: 0.12 } : { ...revealTransition, delay }}
      {...props}
    >
      {children}
    </MotionElement>
  )
}
