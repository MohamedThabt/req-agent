import { useState, useRef, useEffect, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Paperclip,
  Send,
  Mic,
  Sparkles,
  StopCircle,
  Smile,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  onStop?: () => void
}

export function ChatInput({ onSend, isLoading, onStop }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [message, isLoading, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [message])

  return (
    <div className="shrink-0 relative z-10 px-4 pb-6 pt-3">
      <div className="max-w-3xl mx-auto">
        <div className={`bg-popover border border-border rounded-lg p-2 input-glow ${isLoading ? 'animate-pulse-glow' : ''}`}>
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-0.5 pb-1.5 pl-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Attach file</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Emoji</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message ReqAgent..."
              className="flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/50 min-h-[40px] max-h-[160px] py-2.5 px-1"
              rows={1}
            />

            <div className="flex items-center gap-1 pb-1.5 pr-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Voice input</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {isLoading ? (
                <Button
                  onClick={onStop}
                  size="icon"
                  className="h-9 w-9 rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all duration-200"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  size="icon"
                  className="h-9 w-9 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                >
                  {message.trim() ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="px-2 py-0.5 rounded-sm bg-muted">
            <kbd className="font-mono">⏎</kbd> Send
          </span>
          <span className="px-2 py-0.5 rounded-sm bg-muted">
            <kbd className="font-mono">⇧⏎</kbd> New line
          </span>
          <span className="hidden sm:inline">
            Agent can make mistakes. Verify important information.
          </span>
        </div>
      </div>
    </div>
  )
}
