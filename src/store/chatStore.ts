// frontend/src/store/chatStore.ts
import { create } from 'zustand';
import { ApiError } from '@/lib/api/client';
import { sendChatMessage, type ChatHistoryItem } from '@/lib/api/chat';
import type { ChatMessage } from '@/types/chat';

// Must mirror backend/src/validators/chat.validator.js (<=10 messages, <=500 chars each) and the
// 10 kb JSON body limit in app.js.
export const MAX_INPUT_CHARS = 500;
const MAX_HISTORY_MESSAGES = 8;
const MAX_ASSISTANT_HISTORY_CHARS = 300;
const MAX_BODY_BYTES = 8000;

const GENERIC_ERROR = "I'm having trouble processing that request right now. Please try again.";
const NETWORK_ERROR = "I can't reach the store right now. Please check your connection and try again.";

let idCounter = 0;
// crypto.randomUUID() needs a secure context; plain http on a LAN dev server would break it.
const newId = () => `${Date.now()}-${idCounter++}`;

let inFlight: AbortController | null = null;

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut}…`;
}

/** Last few turns only; failed requests are never sent; long bot replies are shortened so the
 *  server's per-message limit and the request body limit can't be exceeded (Urdu is 2 bytes/char). */
export function buildHistory(messages: ChatMessage[]): ChatHistoryItem[] {
  let items: ChatHistoryItem[] = messages
    .filter((m) => !m.isError)
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({
      role: m.role,
      text: m.role === 'user' ? m.text.slice(0, MAX_INPUT_CHARS) : clip(m.text, MAX_ASSISTANT_HISTORY_CHARS),
    }));

  const bytes = (list: ChatHistoryItem[]) => new TextEncoder().encode(JSON.stringify(list)).length;
  while (items.length > 1 && bytes(items) > MAX_BODY_BYTES) items = items.slice(1);
  return items;
}

export function friendlyChatError(err: unknown): string {
  if (err instanceof ApiError) {
    // 503 (AI unavailable) and 429 (rate limit) carry safe, customer-ready messages from the server.
    if (err.statusCode === 503 || err.statusCode === 429) return err.message;
    return GENERIC_ERROR;
  }
  if (err instanceof TypeError) return NETWORK_ERROR; // fetch itself failed
  return GENERIC_ERROR;
}

interface ChatState {
  isOpen: boolean;
  status: 'idle' | 'sending';
  messages: ChatMessage[];
  open: () => void;
  close: () => void;
  sendMessage: (text: string) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

/**
 * In-memory on purpose (no persist): replies can contain a customer's order details, so nothing is
 * written to localStorage/sessionStorage. The conversation survives client-side navigation (the
 * widget lives in the shared layout) and is dropped on reload or logout.
 */
export const useChatStore = create<ChatState>((set, get) => {
  const runRequest = async () => {
    inFlight?.abort();
    const controller = new AbortController();
    inFlight = controller;
    set({ status: 'sending' });

    try {
      const reply = await sendChatMessage(buildHistory(get().messages), controller.signal);
      if (controller.signal.aborted) return;
      set((s) => ({
        messages: [
          ...s.messages,
          { id: newId(), role: 'assistant', text: reply.reply, blocks: reply.blocks },
        ],
      }));
    } catch (err) {
      if (controller.signal.aborted) return; // chat was cleared while waiting
      set((s) => ({
        messages: [
          ...s.messages,
          { id: newId(), role: 'assistant', text: friendlyChatError(err), blocks: [], isError: true },
        ],
      }));
    } finally {
      if (inFlight === controller) {
        inFlight = null;
        set({ status: 'idle' });
      }
    }
  };

  return {
    isOpen: false,
    status: 'idle',
    messages: [],

    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),

    sendMessage: async (text) => {
      const trimmed = text.trim().slice(0, MAX_INPUT_CHARS);
      if (!trimmed || get().status === 'sending') return;
      set((s) => ({
        messages: [...s.messages, { id: newId(), role: 'user', text: trimmed, blocks: [] }],
      }));
      await runRequest();
    },

    retry: async () => {
      if (get().status === 'sending') return;
      const last = get().messages.at(-1);
      if (!last?.isError) return;
      set((s) => ({ messages: s.messages.slice(0, -1) }));
      await runRequest();
    },

    reset: () => {
      inFlight?.abort();
      inFlight = null;
      set({ messages: [], status: 'idle' });
    },
  };
});
