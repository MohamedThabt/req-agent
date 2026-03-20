import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type RequirementCategory,
  type RequirementItem,
  type RequirementStatus,
} from '@/lib/requirements'

interface RequirementPanelProps {
  requirements: RequirementItem[]
  documentsCount: number
  onStatusChange: (id: string, status: RequirementStatus) => void
}

function statusClass(status: RequirementStatus): string {
  if (status === 'completed') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
  if (status === 'in_progress') return 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
  if (status === 'needs_clarification') return 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
  if (status === 'blocked') return 'bg-destructive/15 text-destructive'
  return 'bg-secondary text-muted-foreground'
}

export function RequirementPanel({ requirements, documentsCount, onStatusChange }: RequirementPanelProps) {
  const grouped = requirements.reduce<Record<RequirementCategory, RequirementItem[]>>(
    (acc, req) => {
      acc[req.category].push(req)
      return acc
    },
    { business: [], functional: [], technical: [], 'non-functional': [] }
  )

  return (
    <aside className="w-[360px] shrink-0 border-l border-border bg-card/70 p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Requirement Memory</p>
          <h2 className="text-sm font-semibold text-foreground">Structured Lifecycle</h2>
        </div>
        <Badge variant="outline" className="h-5 gap-1 px-2 text-[10px]">
          <FileText className="h-3 w-3" /> {documentsCount} docs
        </Badge>
      </div>

      <div className="space-y-4 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {(Object.keys(grouped) as RequirementCategory[]).map((category) => (
          <div key={category} className="rounded-lg border border-border bg-background/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">{CATEGORY_LABELS[category]}</p>
              <Badge variant="secondary" className="text-[10px]">
                {grouped[category].length}
              </Badge>
            </div>

            <div className="space-y-2">
              {grouped[category].map((req) => (
                <div key={req.id} className="rounded-md border border-border/70 bg-card p-2.5">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{req.id}</span>
                    <Badge className={`text-[10px] ${statusClass(req.status)}`}>
                      {STATUS_LABELS[req.status]}
                    </Badge>
                  </div>

                  <p className="line-clamp-2 text-xs text-foreground/90">{req.question}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Confidence {req.confidence}%</p>

                  <div className="mt-2 flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-5 px-1.5 text-[10px]"
                      onClick={() => onStatusChange(req.id, 'completed')}
                    >
                      Complete
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-5 px-1.5 text-[10px]"
                      onClick={() => onStatusChange(req.id, 'needs_clarification')}
                    >
                      Clarify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
