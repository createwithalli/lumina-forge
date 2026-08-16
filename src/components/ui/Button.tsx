import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

export type ButtonStyle = 'primary' | 'secondary' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  style?: ButtonStyle
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const styleClasses: Record<ButtonStyle, string> = {
  primary:
    'bg-[#d4af37] text-black hover:bg-[#e0c04a] active:bg-[#c9a227] shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]',
  secondary:
    'bg-white/10 text-white hover:bg-white/15 active:bg-white/20 border border-white/10',
  ghost:
    'bg-transparent text-white/70 hover:text-white hover:bg-white/5 active:bg-white/10',
  outline:
    'bg-transparent text-[#d4af37] border border-[#d4af37]/40 hover:border-[#d4af37] hover:bg-[#d4af37]/10 active:bg-[#d4af37]/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-full',
  md: 'h-10 px-5 text-sm rounded-full',
  lg: 'h-12 px-7 text-base rounded-full',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      style = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black select-none',
          styleClasses[style],
          sizeClasses[size],
          isDisabled && 'opacity-40 pointer-events-none cursor-not-allowed',
          loading && 'cursor-wait',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
