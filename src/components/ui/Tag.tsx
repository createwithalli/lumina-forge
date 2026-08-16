import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode, SVGProps } from 'react'

const X = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export type TagStyle = 'filled' | 'outline' | 'ghost'
export type TagSize = 'sm' | 'md'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  style?: TagStyle
  size?: TagSize
  onRemove?: () => void
  removable?: boolean
  children?: ReactNode
}

const styleClasses: Record<TagStyle, string> = {
  filled: 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/25',
  outline: 'bg-transparent text-white/70 border border-white/20 hover:border-white/40',
  ghost: 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80',
}

const sizeClasses: Record<TagSize, string> = {
  sm: 'h-6 px-2.5 text-[11px]',
  md: 'h-7 px-3 text-xs',
}

export function Tag({
  className,
  style = 'filled',
  size = 'md',
  children,
  onRemove,
  removable = false,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium tracking-wide rounded-full transition-all duration-200',
        styleClasses[style],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
