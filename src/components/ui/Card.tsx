import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

export type CardStyle = 'glass' | 'solid' | 'outline'
export type CardSize = 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  style?: CardStyle
  size?: CardSize
  children?: ReactNode
}

const styleClasses: Record<CardStyle, string> = {
  glass: 'bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
  solid: 'bg-[#0a0a0a] border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]',
  outline: 'bg-transparent border border-white/15 hover:border-white/25',
}

const sizeClasses: Record<CardSize, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ className, style = 'glass', size = 'md', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300 overflow-hidden',
        styleClasses[style],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
