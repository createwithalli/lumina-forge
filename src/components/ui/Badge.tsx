import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export type BadgeType = 'default' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  type?: BadgeType
  size?: BadgeSize
}

const typeClasses: Record<BadgeType, string> = {
  default: 'bg-white/10 text-white/80 border border-white/10',
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  error: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
  info: 'bg-sky-500/15 text-sky-400 border border-sky-500/25',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[10px]',
  md: 'h-6 px-2.5 text-xs',
}

export function Badge({ className, type = 'default', size = 'md', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium tracking-wide rounded-full transition-colors',
        typeClasses[type],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}
