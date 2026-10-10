// frontend/src/components/chat/ChatMessages.tsx
'use client';

import { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';
import { ChatBlocks } from './ChatBlocks';
import { ChatRichText } from './ChatRichText';

// Starter prompts are just UI copy for the customer to tap; every answer still comes from live data.
const SUGGESTIONS = ['Show me new arrivals', "What's on sale?", 'Where can I see my orders?', 'What is your return policy?'];

interface ChatMessagesProps {
  messages: ChatMessage[];
  isSending: boolean;
  onSuggestion: (text: string) => void;
  onRetry: () => void;
  onNavigate: () => void;
}

function TypingIndicator() {
  return (
    <div role="status" className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
      <span className="sr-only">The assistant is typing</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatMessages({ messages, isSending, onSuggestion, onRetry, onNavigate }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view (scrollTop on the panel itself, so the page behind never moves).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  const lastId = messages.at(-1)?.id;

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation"
      className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
    >
      {messages.length === 0 && (
        <div className="space-y-3">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-3.5 py-2.5 text-sm text-foreground">
            <p>Hello! I can help you find products, track your orders, and answer questions about our policies.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestion(suggestion)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((message) =>
        message.role === 'user' ? (
          <div key={message.id} className="flex justify-end">
            <div
              dir="auto"
              className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
            >
              {message.text}
            </div>
          </div>
        ) : (
          <div key={message.id} className="max-w-[92%]">
            <div
              dir="auto"
              className={cn(
                'break-words rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-sm',
                message.isError ? 'border-destructive/40 bg-destructive/5 text-foreground' : 'border-border bg-card text-foreground'
              )}
            >
              <ChatRichText text={message.text} />
            </div>
            {message.isError && message.id === lastId && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isSending}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                <RotateCcw className="h-3 w-3" />
                Try again
              </button>
            )}
            <ChatBlocks blocks={message.blocks} onNavigate={onNavigate} />
          </div>
        )
      )}

      {isSending && <TypingIndicator />}
    </div>
  );
}
