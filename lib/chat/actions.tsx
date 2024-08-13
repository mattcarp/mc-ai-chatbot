import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  createStreamableValue
} from 'ai/rsc'
import OpenAI from 'openai'

import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  Stock,
  Purchase
} from '@/components/stocks'

import { z } from 'zod'
import { EventsSkeleton } from '@/components/stocks/events-skeleton'
import { Events } from '@/components/stocks/events'
import { StocksSkeleton } from '@/components/stocks/stocks-skeleton'
import { Stocks } from '@/components/stocks/stocks'
import { StockSkeleton } from '@/components/stocks/stock-skeleton'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat, Message } from '@/lib/types'
import { auth } from '@/auth'

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<AIState>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })

  const ui = createStreamableUI(
    <SpinnerMessage />
  )

  runAsyncFnWithoutBlocking(async () => {
    const thread = await openai.beta.threads.create()

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: content
    })

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.ASSISTANT_ID!,
      instructions: "You are a helpful AI assistant."
    })

    let response = await openai.beta.threads.runs.retrieve(thread.id, run.id)

    while (response.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      response = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    }

    const messages = await openai.beta.threads.messages.list(thread.id)

    const lastMessageForRun = messages.data
      .filter(message => message.run_id === run.id && message.role === 'assistant')
      .pop()

    if (lastMessageForRun) {
      const newMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: lastMessageForRun.content[0].text.value
      }

      aiState.done({
        ...aiState.get(),
        messages: [...aiState.get().messages, newMessage]
      })

      ui.update(<BotMessage content={newMessage.content} />)
    }

    ui.done()
  })

  return {
    id: nanoid(),
    display: ui.value
  }
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return []
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0]?.content as string
      const title = firstMessageContent?.substring(0, 100) || 'New Chat'

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat): UIState => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.id}-${index}`,
      display:
        message.role === 'user' ? (
          <UserMessage key={message.id}>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage key={message.id} content={message.content} />
        ) : null
    }))
}