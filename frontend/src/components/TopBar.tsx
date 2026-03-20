import { Wand2, Settings, ChevronDown, Plus, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TopBarProps {
  model: string
  isOnline: boolean
  onNewChat: () => void
  onHistoryToggle: () => void
  historyOpen: boolean
}

export function TopBar({ model, isOnline, onNewChat, onHistoryToggle, historyOpen }: TopBarProps) {
  return (
    <header className="px-6 py-3 flex items-center justify-between border-b border-border surface z-20 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Wand2 className="h-[18px] w-[18px] text-primary-foreground" />
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
              isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'
            }`}
          />
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight hidden sm:block">
          ReqAgent
        </span>
      </div>

      <Button
        variant="ghost"
        className="h-8 px-3 rounded-full bg-secondary hover:bg-secondary/80 border border-border transition-all duration-200 gap-2"
      >
        <span className="relative flex h-2 w-2">
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`} />
        </span>
        <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] px-1.5 py-0 h-4 rounded-sm font-mono">
          AI
        </Badge>
        <span className="text-xs font-medium text-foreground/90">{model}</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>

      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onHistoryToggle}
                className={`h-8 w-8 rounded-md transition-all duration-200 ${
                  historyOpen
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Clock className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">History</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNewChat}
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">New chat</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
