import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export type AgentStatusType = 'online' | 'busy' | 'idle' | 'offline'
export type AgentStyle = 'pill' | 'dot'

export interface AgentStatusProps extends HTMLAttributes<HTMLDivElement> {
  status?: AgentStatusType
  style?: AgentStyle
  label?: string
  pulse?: boolean
}

const pillClasses: Record<AgentStatusType, string> = {
  online: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  busy: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  idle: 'bg-sky-500/10 text-sky-400 border border-sky-500/25',
  offline: 'bg-white/5 text-white/40 border border-white/10',
}

const textClasses: Record<AgentStatusType, string> = {
  online: 'text-emerald-400',
  busy: 'text-amber-400',
  idle: 'text-sky-400',
  offline: 'text-white/40',
}

const dotClasses: Record<AgentStatusType, string> = {
  online: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
  busy: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
  idle: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]',
  offline: 'bg-white/30',
}

export function AgentStatus({
  className,
  status = 'online',
  style = 'pill',
  label,
  pulse = true,
  ...props
}: AgentStatusProps) {
  const displayLabel =
    label ||
    (status === 'online' ? 'Online' : status === 'busy' ? 'Busy' : status === 'idle' ? 'Idle' : 'Offline')

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 font-medium transition-all duration-300',
        style === 'pill' && 'rounded-full px-3 py-1.5 text-xs',
        style === 'pill' && pillClasses[status],
        style === 'dot' && 'text-xs',
        style === 'dot' && textClasses[status],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full shrink-0',
          dotClasses[status],
          pulse && status !== 'offline' && 'animate-pulse'
        )}
      />
      <span>{displayLabel}</span>
    </div>
  )
}
