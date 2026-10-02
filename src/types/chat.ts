// frontend/src/types/chat.ts

export type ChatRole = 'user' | 'assistant';

/** Product card exactly as the backend chatbot tools return it (backend/src/ai/chat/tools/catalog.js). */
export interface ChatProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  brand: { name: string; slug: string } | null;
  discountPercentage: number;
  price: number | null;
  comparePrice: number | null;
  colors: string[];
  sizes: string[];
  inStock: boolean;
}

/** Order summary from backend/src/ai/chat/tools/orders.js — contains no phone/address. */
export interface ChatOrderSummary {
  orderNumber: string;
  status: string;
  total?: number;
  placedAt: string;
  route: string;
}

/** Structured UI blocks. The server builds these from real tool results, never from model text. */
export type ChatBlock =
  | { type: 'product_list'; products: ChatProduct[]; total: number; viewAllRoute: string | null }
  | { type: 'product_card'; product: ChatProduct }
  | { type: 'navigation'; label: string; route: string }
  | { type: 'policy'; title: string; route: string }
  | { type: 'order_list'; orders: ChatOrderSummary[] }
  | { type: 'order_status'; order: ChatOrderSummary };

export interface ChatReply {
  reply: string;
  blocks: ChatBlock[];
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  blocks: ChatBlock[];
  /** Client-only: a failed request shown as an assistant bubble with a Retry button. */
  isError?: boolean;
}
