import { useRef, useEffect } from 'react'
import { MessageBubble, type Message } from './MessageBubble'
import { Bot, Sparkles, Zap, Brain, Code } from 'lucide-react'

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
      <div className="relative mb-12">
        <div className="h-28 w-28 rounded-full bg-primary/10 flex items-center justify-center animate-float shadow-lg">
          <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl animate-pulse-glow" />
          <div className="absolute inset-3 rounded-full border border-primary/10" style={{ animation: 'orb-rotate 12s linear infinite' }} />
          <div className="relative z-10 h-18 w-18 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-9 w-9 text-primary-foreground" />
          </div>
        </div>
        <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-500 border-[3px] border-background animate-glow-pulse" />
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-3 text-center">
        How can I help you?
      </h1>
      <p className="text-muted-foreground text-sm mb-10 text-center max-w-sm leading-relaxed">
        Ask me anything -- I can analyze code, generate plans, debug issues, and much more.
      </p>

      <div className="flex gap-3 flex-wrap justify-center max-w-2xl">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="group bg-card border border-border rounded-lg px-5 py-3 text-left hover:bg-muted/50 transition-all duration-200 hover:shadow-md cursor-pointer animate-scale-in"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="text-primary/70 group-hover:text-primary transition-colors duration-200">
                {s.icon}
              </div>
              <div>
                <span className="text-sm font-medium text-foreground/85 group-hover:text-foreground transition-colors block">
                  {s.text}
                </span>
                <span className="text-[11px] text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  {s.desc}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
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
          <div className="flex gap-3 px-4 py-3 animate-fade-in-up">
            <div className="shrink-0 mt-1">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center ring-2 ring-primary/20 animate-glow-pulse shadow-md">
                <Bot className="h-[18px] w-[18px] text-primary-foreground" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg rounded-tl-sm px-5 py-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full bg-primary"
                  style={{ animation: 'typing-dot 1.4s ease-in-out 0s infinite' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-primary/70"
                  style={{ animation: 'typing-dot 1.4s ease-in-out 0.2s infinite' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-primary/50"
                  style={{ animation: 'typing-dot 1.4s ease-in-out 0.4s infinite' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
