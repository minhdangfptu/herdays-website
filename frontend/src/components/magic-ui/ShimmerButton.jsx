import { forwardRef } from 'react'

export const ShimmerButton = forwardRef(function ShimmerButton({
  as: Component = 'button',
  children,
  className = '',
  ...props
}, ref) {
  const componentProps = {
    ...props,
    ref,
    className: `magic-shimmer-button ${className}`.trim(),
  }

  if (Component === 'button' && !componentProps.type) {
    componentProps.type = 'button'
  }

  return (
    <Component {...componentProps}>
      <span className="magic-shimmer-button__content">{children}</span>
    </Component>
  )
})
