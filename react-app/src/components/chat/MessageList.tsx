import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatBubble, type ChatMessage } from './ChatBubble'
import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

type MessageListProps = {
  messages: ChatMessage[]
  isLoading?: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <ScrollArea className="h-full flex-1">
      <div className="flex flex-col gap-2 pb-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className={cn(
            'flex gap-3 px-4 py-3'
          )}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            </div>
            <div className="flex items-center rounded-lg bg-muted px-4 py-2">
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </ScrollArea>
  )
}
