import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

export type StatTheme = 'dark' | 'gold' | 'glass' | 'platinum'
export type StatSize = 'sm' | 'md'

export interface StatBlockProps extends HTMLAttributes<HTMLDivElement> {
  theme?: StatTheme
  size?: StatSize
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
  suffix?: string
}

const themeClasses: Record<StatTheme, string> = {
  dark: 'bg-[#0a0a0a] border border-white/8',
  gold: 'bg-[#d4af37]/08 border border-[#d4af37]/20',
  glass: 'bg-white/[0.03] backdrop-blur-xl border border-white/10',
  platinum: 'bg-[#e5e4e2]/05 border border-[#e5e4e2]/15',
}

const sizeClasses: Record<StatSize, string> = {
  sm: 'p-4',
  md: 'p-6',
}

export function StatBlock({
  className,
  theme = 'glass',
  size = 'md',
  label,
  value,
  change,
  changeType = 'neutral',
  icon,
  suffix,
  ...props
}: StatBlockProps) {
  const changeColor =
    changeType === 'positive'
      ? 'text-emerald-400'
      : changeType === 'negative'
        ? 'text-rose-400'
        : 'text-white/50'

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        themeClasses[theme],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-widest text-white/40 font-medium">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-light text-white tracking-tight">
              {value}
            </span>
            {suffix && (
              <span className="text-sm text-white/40 font-light">{suffix}</span>
            )}
          </div>
          {change && (
            <p className={cn('text-xs font-medium', changeColor)}>{change}</p>
          )}
        </div>
        {icon && <div className="text-white/30 shrink-0">{icon}</div>}
      </div>
    </div>
  )
}
