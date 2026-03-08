import { MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  isPinned?: boolean
  messageCount?: number
}

interface ConversationHistoryProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onClose: () => void
}

function formatDate(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function ConversationHistory({
  conversations,
  activeId,
  onSelect,
  onClose,
}: ConversationHistoryProps) {
  return (
    <div className="absolute right-4 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-scale-in origin-top-right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-[10px] font-semibold text-cyan uppercase tracking-widest font-mono">
          Conversations
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="max-h-80 overflow-y-auto p-1.5">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left rounded-md px-3 py-2.5 mb-0.5 transition-all duration-150 cursor-pointer ${
              activeId === conv.id
                ? 'bg-cyan/10 text-cyan'
                : 'hover:bg-secondary text-foreground'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${
                activeId === conv.id ? 'text-cyan' : 'text-muted-foreground'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium truncate">
                    {conv.title}
                  </span>
                  <span className="text-[9px] text-muted-foreground shrink-0">
                    {formatDate(conv.timestamp)}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
