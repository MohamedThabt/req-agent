import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MessageSquarePlusIcon } from 'lucide-react'

type SidebarProps = {
  onNewChat?: () => void
}

export function Sidebar({ onNewChat }: SidebarProps) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r bg-muted/30">
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Req Agent</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onNewChat}
        >
          <MessageSquarePlusIcon className="size-4" />
          New chat
        </Button>
      </div>
      <Separator />
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Task Progress
        </h3>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2">
            <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Step 1: Context
            </div>
            <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Step 2: Requirements
            </div>
            <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Step 3: Validation
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
