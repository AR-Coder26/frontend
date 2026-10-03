export const dynamic = 'force-dynamic';
import { request } from './client';
import { getCurrentCustomer } from './auth';
import { useCustomerAuthStore } from '@/store/customerAuthStore';
import type { ChatReply, ChatRole } from '@/types/chat';

export interface ChatHistoryItem {
  role: ChatRole;
  text: string;
}

function postChat(messages: ChatHistoryItem[], signal?: AbortSignal) {
  // /chat uses optional auth on the server (guests allowed), so this is a plain request, not customerRequest.
  return request<ChatReply>('/chat', { method: 'POST', body: { messages }, signal });
}

/** A "log in" button in the reply while the store says we ARE logged in means the 15-minute
 *  access cookie expired (the chat route never answers 401, so nothing refreshed it). */
function suggestsExpiredSession(reply: ChatReply): boolean {
  return reply.blocks.some((b) => b.type === 'navigation' && b.route.startsWith('/login'));
}

export async function sendChatMessage(
  messages: ChatHistoryItem[],
  signal?: AbortSignal
): Promise<ChatReply> {
  const reply = await postChat(messages, signal);

  if (useCustomerAuthStore.getState().status === 'authenticated' && suggestsExpiredSession(reply)) {
    try {
      // customerRequest inside getCurrentCustomer refreshes the session cookie on a 401.
      await getCurrentCustomer();
    } catch {
      return reply; // really logged out — keep the login button
    }
    return postChat(messages, signal);
  }
  return reply;
}
