import { Separator } from '@/components/ui/separator'
import { UIState } from '@/lib/chat/actions'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Session } from '@/lib/types'

export interface ChatList {
  messages: UIState[]
  isShared: boolean
  session?: Session
}

export function ChatList({ messages, isShared, session }: ChatList) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {!isShared && !session?.user ? (
        <>
          <div className="group relative mb-4 flex items-start md:-ml-12">
            <div className="bg-background flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border shadow-sm">
              <ExclamationTriangleIcon />
            </div>
            <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
              <p className="text-muted-foreground leading-normal">
                Please{' '}
                <Link href="/sign-in" className="underline">
                  log in
                </Link>{' '}
                or{' '}
                <Link href="/sign-up" className="underline">
                  sign up
                </Link>{' '}
                to save and revisit your chat history!
              </p>
            </div>
          </div>
          <Separator className="my-4" />
        </>
      ) : null}

      {messages.filter(Boolean).map((message, index) => (
        <div key={message.id || `message-${index}`}>
          {message.display}
          {index < messages.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
}