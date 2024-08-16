'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { Message, Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'
import { AIState } from '@/lib/chat/actions'

export interface ChatProps extends React.ComponentProps<'div'> {
  id?: string
  session?: Session
  missingKeys: string[]
  aiState: AIState
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function Chat({ id, className, session, missingKeys, aiState, onSubmit }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [_, setNewChatId] = useLocalStorage('newChatId', id)
  const { isLoaded, userId, sessionId, getToken } = useAuth()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setNewChatId(id)
  }, [id, setNewChatId])

  useEffect(() => {
    missingKeys.forEach(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    await onSubmit(e)
    setInput('')
    setIsLoading(false)
    if (!path.includes('chat') && aiState.messages.length === 1) {
      window.history.replaceState({}, '', `/chat/${id}`)
    }
    router.refresh()
  }

  return (
    <div
      className={cn("group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]", className)}
      ref={scrollRef}
    >
      <div className={cn('pb-[200px] pt-4 md:pt-10')} ref={messagesRef}>
        {aiState.messages.length > 0 ? (
          <ChatList messages={aiState.messages} isShared={false} session={session} />
        ) : (
          <EmptyScreen />
        )}
        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        messages={aiState.messages}
      />
    </div>
  )
}