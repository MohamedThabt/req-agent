import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Sidebar } from '@/components/chat/Sidebar'
import { MessageList } from '@/components/chat/MessageList'
import { ChatInput } from '@/components/chat/ChatInput'
import { sendMessage } from '@/lib/api'
import type { ChatMessage } from '@/components/chat/ChatBubble'
import { MenuIcon } from 'lucide-react'

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const { content: reply } = await sendMessage(content)
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center gap-2 border-b px-4 py-2 md:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="size-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" showCloseButton className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <Sidebar onNewChat={handleNewChat} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">Req Agent</h1>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <Sidebar onNewChat={handleNewChat} />
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MessageList messages={messages} isLoading={isLoading} />
          <ChatInput onSubmit={handleSend} disabled={isLoading} />
        </main>
      </div>
    </div>
  )
}

export default App
