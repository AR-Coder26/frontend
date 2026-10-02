// frontend/src/components/chat/ChatWidget.tsx
'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageSquare, RotateCcw, X } from 'lucide-react';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';
import { useChatStore } from '@/store/chatStore';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { isSmallScreen } from './chatUtils';

/**
 * Floating AI shopping assistant, mounted once in StorefrontShell so it appears on every
 * customer-facing page. The button sits above the WhatsApp FAB when that one is rendered
 * (it only renders when NEXT_PUBLIC_STORE_WHATSAPP_NUMBER is set), otherwise in its corner.
 */
export function ChatWidget() {
  const isOpen = useChatStore((s) => s.isOpen);
  const status = useChatStore((s) => s.status);
  const messages = useChatStore((s) => s.messages);
  const open = useChatStore((s) => s.open);
  const close = useChatStore((s) => s.close);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const retry = useChatStore((s) => s.retry);
  const reset = useChatStore((s) => s.reset);

  const authStatus = useCustomerAuthStore((s) => s.status);
  const reduceMotion = useReducedMotion();
  const fabRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const previousAuth = useRef(authStatus);

  const hasWhatsAppFab = buildStoreWhatsAppLink('hi') !== null;

  // Replies can contain a customer's order details: wipe the conversation on logout.
  useEffect(() => {
    if (previousAuth.current === 'authenticated' && authStatus === 'unauthenticated') reset();
    previousAuth.current = authStatus;
  }, [authStatus, reset]);

  // Escape closes the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  // Full-screen on phones: stop the page behind from scrolling.
  useEffect(() => {
    if (!isOpen || !isSmallScreen()) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Give focus back to the button when the panel closes.
  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      const frame = requestAnimationFrame(() => fabRef.current?.focus());
      wasOpen.current = false;
      return () => cancelAnimationFrame(frame);
    }
    wasOpen.current = isOpen;
    return undefined;
  }, [isOpen]);

  const handleNavigate = () => {
    if (isSmallScreen()) close();
  };

  const isSending = status === 'sending';
  const enter = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' as const };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            ref={fabRef}
            type="button"
            onClick={open}
            aria-label="Open shopping assistant chat"
            aria-haspopup="dialog"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.5, duration: 0.35, ease: 'easeOut' }}
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            className={`fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/20 transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:right-6 ${
              hasWhatsAppFab ? 'bottom-[5.5rem] sm:bottom-[5.75rem]' : 'bottom-5 sm:bottom-6'
            }`}
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-label="Brandox shopping assistant"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={enter}
            className="fixed inset-0 z-50 flex h-dvh flex-col bg-background sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(36rem,calc(100dvh-3rem))] sm:w-[24rem] sm:overflow-hidden sm:rounded-xl sm:border sm:border-border sm:shadow-2xl"
          >
            <header className="flex shrink-0 items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
              <div className="min-w-0">
                <h2 className="font-display text-base leading-tight">Brandox Assistant</h2>
                <p className="truncate text-xs text-primary-foreground/80">Products, orders &amp; policies</p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Start a new conversation"
                    className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close chat"
                  className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <ChatMessages
              messages={messages}
              isSending={isSending}
              onSuggestion={(text) => void sendMessage(text)}
              onRetry={() => void retry()}
              onNavigate={handleNavigate}
            />
            <ChatInput disabled={isSending} onSend={(text) => void sendMessage(text)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
