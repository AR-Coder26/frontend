// frontend/src/components/chat/ChatInput.tsx
'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { MAX_INPUT_CHARS } from '@/store/chatStore';
import { isSmallScreen } from './chatUtils';

interface ChatInputProps {
  disabled: boolean;
  onSend: (text: string) => void;
}

const MAX_HEIGHT_PX = 96;

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus on open (desktop only — on phones it would pop the keyboard over the greeting).
  useEffect(() => {
    if (!isSmallScreen()) textareaRef.current?.focus();
  }, []);

  // Grow with the text up to a cap, then scroll.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const canSend = !disabled && value.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: don't send while an IME (e.g. an Urdu keyboard) is still choosing characters.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-t border-border bg-card px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={MAX_INPUT_CHARS}
          dir="auto"
          placeholder="Ask about products, orders, policies…"
          aria-label="Message to the shopping assistant"
          // text-base on phones: iOS Safari zooms the page when a focused field is under 16px.
          className="max-h-24 min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>AI assistant — please double-check important details.</span>
        {value.length > MAX_INPUT_CHARS - 100 && (
          <span>
            {value.length}/{MAX_INPUT_CHARS}
          </span>
        )}
      </div>
    </form>
  );
}
