import { useRef, useEffect } from 'react'
import { MessageBubble, type Message } from './MessageBubble'
import { Wand2, Sparkles, Zap, Brain, Code } from 'lucide-react'

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
}

function EmptyState() {
  const suggestions = [
    { icon: <Code className="h-4 w-4" />, text: 'Analyze codebase', desc: 'Review architecture and patterns' },
    { icon: <Brain className="h-4 w-4" />, text: 'Generate a plan', desc: 'Step-by-step strategy' },
    { icon: <Zap className="h-4 w-4" />, text: 'Debug an issue', desc: 'Find and fix problems fast' },
    { icon: <Sparkles className="h-4 w-4" />, text: 'Write docs', desc: 'Auto-generate clear docs' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-in-up">
      <div className="relative mb-8 flex items-center justify-center">
        <div className="hero-glow" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg ring-1 ring-border/50 z-10 relative">
          <Wand2 className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2 text-center">
        How can I help you?
      </h1>
      <p className="text-muted-foreground text-sm mb-10 text-center max-w-sm">
        Ask me anything &mdash; I can analyze code, generate plans, debug issues, and much more.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full px-4">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="group flex flex-col items-start gap-2 rounded-2xl p-5 text-left gradient-border-card shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up cursor-pointer hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
              {s.icon}
            </div>
            <div>
              <span className="text-[15px] font-semibold text-foreground block mb-1">
                {s.text}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {s.desc}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
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
        <EmptyState />
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLatest={i === messages.length - 1}
          />
        ))}

        {isLoading && (
          <div className="flex gap-4 px-4 py-3 animate-fade-in-up">
            <div className="shrink-0 mt-0.5">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center shadow-sm">
              <Wand2 className="h-[18px] w-[18px] text-primary-foreground" />
              </div>
            </div>
            <div className="bg-card border border-border/60 rounded-xl rounded-tl-sm px-4 py-3 shadow-sm h-11 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary/40 block"
                  style={{ animation: 'typing-dot 1.4s infinite' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary/40 block"
                  style={{ animation: 'typing-dot 1.4s 0.2s infinite' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary/40 block"
                  style={{ animation: 'typing-dot 1.4s 0.4s infinite' }}
                />
              </div>
            </div>
          </div>
        )}
        
        <div ref={bottomRef} className="h-4 w-full shrink-0" />
      </div>
    </div>
  )
}
