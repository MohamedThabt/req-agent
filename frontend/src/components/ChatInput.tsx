import { useState, useRef, useEffect, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Paperclip,
  ArrowUpIcon,
  StopCircle,
  PlusIcon,
  Code,
  Brain,
  Zap,
  Sparkles,
} from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  onStop?: () => void
  showHints?: boolean
}

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return
      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }
      textarea.style.height = `${minHeight}px`
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Infinity))
      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) textarea.style.height = `${minHeight}px`
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

export function ChatInput({ onSend, isLoading, onStop, showHints }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 200,
  })

  const handleSend = useCallback(() => {
    if (message.trim() && !isLoading) {
      onSend(message.trim())
      setMessage('')
      adjustHeight(true)
    }
  }, [message, isLoading, onSend, adjustHeight])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="shrink-0 relative z-10 px-4 pb-5 pt-2">
      <div className="max-w-3xl mx-auto">
        <div
          className={cn(
            'relative rounded-xl bg-card border border-border transition-all duration-200',
            isLoading && 'opacity-60',
          )}
          style={{ boxShadow: message.trim() ? '0 0 0 1px color-mix(in srgb, var(--ring) 15%, transparent)' : undefined }}
        >
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                adjustHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message ReqAgent..."
              className={cn(
                'w-full px-4 py-3',
                'resize-none',
                'bg-transparent',
                'border-none',
                'text-foreground text-sm',
                'focus:outline-none',
                'focus-visible:ring-0 focus-visible:ring-offset-0',
                'placeholder:text-muted-foreground/40 placeholder:text-sm',
              )}
              style={{ overflow: 'hidden' }}
            />
          </div>

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="group p-2 hover:bg-secondary rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Paperclip className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground hidden group-hover:inline transition-opacity">
                  Attach
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2 py-1 rounded-lg text-sm text-muted-foreground transition-colors border border-dashed border-border hover:border-muted-foreground/40 hover:bg-secondary flex items-center justify-between gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="text-xs">Project</span>
              </button>

              {isLoading ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="p-1.5 rounded-lg bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
                >
                  <StopCircle className="w-4 h-4" />
                  <span className="sr-only">Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={cn(
                    'p-1.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center',
                    message.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground border border-border hover:bg-secondary',
                  )}
                >
                  <ArrowUpIcon className="w-4 h-4" />
                  <span className="sr-only">Send</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {showHints && (
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <HintPill icon={<Code className="w-3.5 h-3.5" />} label="Analyze code" color="text-primary" />
            <HintPill icon={<Brain className="w-3.5 h-3.5" />} label="Generate plan" color="text-accent-foreground" />
            <HintPill icon={<Zap className="w-3.5 h-3.5" />} label="Debug issue" color="text-destructive" />
            <HintPill icon={<Sparkles className="w-3.5 h-3.5" />} label="Write docs" color="text-chart-1" />
          </div>
        )}

        {!showHints && (
          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className="px-2 py-0.5 rounded-sm bg-muted">
              <kbd className="font-mono">⏎</kbd> Send
            </span>
            <span className="px-2 py-0.5 rounded-sm bg-muted">
              <kbd className="font-mono">⇧⏎</kbd> New line
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function HintPill({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-secondary rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
    >
      <span className={color}>{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  )
}
