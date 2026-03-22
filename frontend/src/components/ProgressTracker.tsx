import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type RequirementCategory,
} from '@/lib/requirements'

interface ProgressTrackerProps {
  progressByCategory: Record<
    RequirementCategory,
    { completed: number; total: number; skipped?: number; resolved?: number }
  >
}

export function ProgressTracker({ progressByCategory }: ProgressTrackerProps) {
  const categories = CATEGORY_ORDER.filter((category) => progressByCategory[category])
  const overall = categories.reduce(
    (acc, category) => {
      acc.completed += progressByCategory[category].completed
      acc.resolved += progressByCategory[category].resolved ?? progressByCategory[category].completed
      acc.total += progressByCategory[category].total
      return acc
    },
    { completed: 0, resolved: 0, total: 0 }
  )

  const overallPercent = overall.total ? Math.round((overall.resolved / overall.total) * 100) : 0

  return (
    <section className="surface rounded-xl p-4">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Requirements Progress</p>
          <p className="text-sm font-semibold text-foreground">{overallPercent}% Complete</p>
        </div>
        <p className="text-xs text-muted-foreground">{overall.resolved}/{overall.total} closed</p>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const item = progressByCategory[category]
          const resolved = item.resolved ?? item.completed
          const percent = item.total ? Math.round((resolved / item.total) * 100) : 0

          return (
            <div key={category}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-foreground/90">{CATEGORY_LABELS[category]}</span>
                <span className="text-muted-foreground">{percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
