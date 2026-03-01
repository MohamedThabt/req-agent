import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SendIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatInputProps = {
  onSubmit: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-2 border-t bg-background p-4">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        rows={1}
        className={cn(
          'min-h-[44px] max-h-[200px] resize-none py-3 pr-12',
          'field-sizing-content'
        )}
      />
      <Button
        type="button"
        size="icon"
        className="shrink-0 self-end"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
      >
        <SendIcon className="size-4" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  )
}
