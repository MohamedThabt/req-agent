import { Brain, MessageCircleQuestion, Search, FileStack, BarChart3, CheckCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AgentRuntimeState } from '@/lib/requirements'

interface AgentStateIndicatorProps {
  state: AgentRuntimeState
}

const phaseConfig = {
  planning: { label: 'Planning', icon: Brain },
  asking: { label: 'Asking', icon: MessageCircleQuestion },
  evaluating: { label: 'Evaluating', icon: Search },
  processing_documents: { label: 'Processing Docs', icon: FileStack },
  updating_progress: { label: 'Updating Progress', icon: BarChart3 },
  finalizing: { label: 'Finalizing', icon: CheckCheck },
} as const

export function AgentStateIndicator({ state }: AgentStateIndicatorProps) {
  const config = phaseConfig[state.phase]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <Icon className="h-3.5 w-3.5 text-primary" />
      <Badge variant="secondary" className="h-5 px-2 text-[10px] uppercase tracking-wide">
        {config.label}
      </Badge>
      <span className="hidden text-[10px] text-muted-foreground md:inline">{state.detail}</span>
    </div>
  )
}
