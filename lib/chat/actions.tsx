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
import { requireAuth } from "@/auth";

// Types
export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Server Actions
export async function getUIState() {
  'use server'
  
  try {
    const { userId } = await requireAuth();
    const aiState = getAIState() as Chat

    if (aiState) {
      return getUIStateFromAIState(aiState)
    }
  } catch (error) {
    console.error('Error in getUIState:', error);
    return []; // Return an empty array instead of throwing an error
  }
  return []
}

export async function setAIState(state: AIState) {
  'use server'
  
  try {
    const { userId } = await requireAuth();
    const { chatId, messages } = state

    const createdAt = new Date()
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
  } catch (error) {
    console.error('Error in setAIState:', error);
    // Handle the error appropriately, maybe by returning an error object
  }
}

export async function submitUserMessage(message: string) {
  'use server'
  
  console.log('submitUserMessage called with:', message);
  
  try {
    const { userId } = await requireAuth();
    console.log('User authenticated with ID:', userId);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    console.log('OpenAI response received:', response);

    return { result: response.choices[0].message.content };
  } catch (error) {
    console.error('Error in submitUserMessage:', error);
    return { error: error.message || 'An error occurred while processing your message' };
  }
}

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: getUIState
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