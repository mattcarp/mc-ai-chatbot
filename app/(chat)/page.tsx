import { AIProvider } from '@/components/ai-provider'
import { ChatWrapper } from '@/components/chat-wrapper'
import { Session } from '@/lib/types'
import { getMissingKeys } from '@/app/actions'

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  const userId = null
  const user = null
  const session: Session = { userId, user }
  const missingKeys = await getMissingKeys()

  return (
    <AIProvider>
      <ChatWrapper session={session} missingKeys={missingKeys} />
    </AIProvider>
  )
}