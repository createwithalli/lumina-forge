import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type InputState = 'default' | 'focus' | 'error' | 'disabled'
export type InputSize = 'sm' | 'md'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  state?: InputState
  size?: InputSize
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const stateClasses: Record<InputState, string> = {
  default: 'border-white/10 focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/30',
  focus: 'border-[#d4af37]/50 ring-1 ring-[#d4af37]/30',
  error: 'border-rose-500/50 ring-1 ring-rose-500/30 text-rose-100',
  disabled: 'border-white/5 bg-white/[0.01]',
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-11 px-4 text-sm rounded-xl',
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      state = 'default',
      size = 'md',
      label,
      error,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const effectiveState: InputState = disabled ? 'disabled' : error ? 'error' : state

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium tracking-wide text-white/60 uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              'w-full bg-white/[0.03] border text-white placeholder:text-white/30 transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed',
              stateClasses[effectiveState],
              sizeClasses[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
