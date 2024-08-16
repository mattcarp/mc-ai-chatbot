'use client'

import { useAIState, useActions } from 'ai/rsc'
import { Chat, ChatProps } from './chat'
import { AIState } from '@/lib/chat/actions'

export function ChatWrapper({ session, missingKeys }: Omit<ChatProps, 'aiState' | 'onSubmit'>) {
  const [aiState, setAIState] = useAIState<AIState>()
  const { submitUserMessage } = useActions()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem('message') as HTMLInputElement
    const message = input.value
    input.value = ''

    setAIState((prevState) => ({
      ...prevState,
      messages: [
        ...prevState.messages,
        { id: Date.now().toString(), role: 'user', content: message }
      ]
    }))

    const result = await submitUserMessage(message)
    if (result.error) {
      console.error(result.error)
      return
    }

    setAIState((prevState) => ({
      ...prevState,
      messages: [
        ...prevState.messages,
        { id: Date.now().toString(), role: 'assistant', content: result.result }
      ]
    }))
  }

  return (
    <Chat
      id={aiState.chatId}
      session={session}
      missingKeys={missingKeys}
      aiState={aiState}
      onSubmit={handleSubmit}
    />
  )
}