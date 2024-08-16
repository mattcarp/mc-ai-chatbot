import { AI } from '@/lib/chat/actions'
import { nanoid } from '@/lib/utils'

export function AIProvider({ children }: { children: React.ReactNode }) {
  const id = nanoid()
  
  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      {children}
    </AI>
  )
}