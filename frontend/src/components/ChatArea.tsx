import { useRef, useEffect, useState } from 'react'
import { MessageBubble, type Message } from './MessageBubble'
import { UploadCloud, Wand2 } from 'lucide-react'
import { ProgressTracker } from './ProgressTracker'
import type {
  AgentRuntimeState,
  RequirementCategory,
  RequirementItem,
  RequirementStatus,
} from '@/lib/requirements'

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  agentState: AgentRuntimeState
  progressByCategory: Record<RequirementCategory, { completed: number; total: number }>
  onFilesSelected: (files: File[]) => void
  getRequirementById: (id: string) => RequirementItem | undefined
  onRequirementStatusChange: (id: string, status: RequirementStatus) => void
}

function EmptyState({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(event.dataTransfer.files)
    onFilesSelected(droppedFiles)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-in-up">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <Wand2 className="h-7 w-7 text-primary-foreground" />
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 text-center">
        What can I help you with?
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-md">
        Ask me anything &mdash; code analysis, architecture plans, debugging, documentation, and more.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-6 w-full max-w-lg rounded-xl border border-dashed px-5 py-6 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card/60'
        }`}
      >
        <UploadCloud className="mx-auto mb-2 h-5 w-5 text-primary" />
        <p className="text-xs text-foreground/85">Drop PDF or image files to enrich requirement context</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Browse files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,image/*"
          multiple
          onChange={(event) => {
            const pickedFiles = Array.from(event.target.files || [])
            onFilesSelected(pickedFiles)
            event.currentTarget.value = ''
          }}
        />
      </div>
    </div>
  )
}

export function ChatArea({
  messages,
  isLoading,
  agentState,
  progressByCategory,
  onFilesSelected,
  getRequirementById,
  onRequirementStatusChange,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add a small delay to ensure DOM is fully painted before scrolling
    const timeoutId = setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      } else if (scrollRef.current) {
        // Fallback
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      }
    }, 50)
    
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-3xl px-4 pt-4">
          <ProgressTracker progressByCategory={progressByCategory} />
        </div>
        <EmptyState onFilesSelected={onFilesSelected} />
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <ProgressTracker progressByCategory={progressByCategory} />

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLatest={i === messages.length - 1}
            requirement={msg.requirementId ? getRequirementById(msg.requirementId) : undefined}
            onRequirementStatusChange={onRequirementStatusChange}
          />
        ))}

        {isLoading && (
          <div className="flex gap-4 px-4 py-3 animate-fade-in-up">
            <div className="shrink-0 mt-0.5">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Wand2 className="h-[18px] w-[18px] text-primary-foreground" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl rounded-tl-sm px-4 py-3 min-h-11 flex flex-col items-start justify-center">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary block"
                  style={{ animation: 'typing-dot 1.4s infinite' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary block"
                  style={{ animation: 'typing-dot 1.4s 0.2s infinite' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary block"
                  style={{ animation: 'typing-dot 1.4s 0.4s infinite' }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {agentState.detail}
              </span>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} className="h-4 w-full shrink-0" />
      </div>
    </div>
  )
}
