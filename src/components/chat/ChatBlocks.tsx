// frontend/src/components/chat/ChatBlocks.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { formatPKR } from '@/lib/utils';
import type { ChatBlock, ChatOrderSummary, ChatProduct } from '@/types/chat';
import { formatChatDate, isOrderStatus, isSafeInternalRoute } from './chatUtils';

interface ChatBlocksProps {
  blocks: ChatBlock[];
  /** Called when the customer follows a link, so the panel can step aside on phones. */
  onNavigate: () => void;
}

function ProductMiniCard({ product, onNavigate, wide = false }: { product: ChatProduct; onNavigate: () => void; wide?: boolean }) {
  const hasDiscountPrice =
    product.price !== null && product.comparePrice !== null && product.comparePrice > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={onNavigate}
      className={`group block shrink-0 snap-start rounded-md border border-border bg-card p-2 transition-shadow hover:shadow-md ${
        wide ? 'w-full' : 'w-36'
      }`}
    >
      <div className="skeleton relative aspect-[3/4] overflow-hidden rounded bg-secondary">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes={wide ? '320px' : '144px'}
            className="object-cover"
          />
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="text-[10px] font-medium uppercase tracking-wide text-foreground">Out of Stock</span>
          </div>
        )}
        {product.discountPercentage > 0 && (
          <Badge variant="accent" className="absolute left-1 top-1 px-1.5 py-0 text-[10px]">
            {product.discountPercentage}% OFF
          </Badge>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        {product.brand && (
          <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">{product.brand.name}</p>
        )}
        <p className="line-clamp-2 text-xs text-foreground">{product.name}</p>
        <p className="font-display text-sm text-foreground">
          {product.price !== null ? formatPKR(product.price) : 'See price'}
          {hasDiscountPrice && product.comparePrice !== null && (
            <span className="ml-1.5 text-[11px] font-sans text-muted-foreground line-through">
              {formatPKR(product.comparePrice)}
            </span>
          )}
        </p>
        {product.sizes.length > 0 && (
          <p className="truncate text-[10px] text-muted-foreground">Sizes: {product.sizes.join(', ')}</p>
        )}
      </div>
    </Link>
  );
}

function OrderRow({ order, onNavigate }: { order: ChatOrderSummary; onNavigate: () => void }) {
  const date = formatChatDate(order.placedAt);
  const body = (
    <>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground">{order.orderNumber}</p>
        <p className="text-[11px] text-muted-foreground">
          {date}
          {date && order.total !== undefined ? ' · ' : ''}
          {order.total !== undefined ? formatPKR(order.total) : ''}
        </p>
      </div>
      {isOrderStatus(order.status) ? (
        <OrderStatusBadge status={order.status} />
      ) : (
        <Badge variant="outline">{order.status}</Badge>
      )}
    </>
  );

  const className = 'flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2';
  return isSafeInternalRoute(order.route) ? (
    <Link href={order.route} onClick={onNavigate} className={`${className} transition-shadow hover:shadow-md`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function renderBlock(block: ChatBlock, onNavigate: () => void) {
  switch (block.type) {
    case 'product_list':
      return (
        <div className="space-y-2">
          <div className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-2">
            {block.products.map((product) => (
              <ProductMiniCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
          {block.viewAllRoute && isSafeInternalRoute(block.viewAllRoute) && block.total > block.products.length && (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={block.viewAllRoute} onClick={onNavigate}>
                View all {block.total} results
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      );

    case 'product_card':
      return (
        <div className="max-w-[12rem]">
          <ProductMiniCard product={block.product} onNavigate={onNavigate} wide />
        </div>
      );

    case 'navigation':
      return isSafeInternalRoute(block.route) ? (
        <Button asChild size="sm" className="w-full justify-between">
          <Link href={block.route} onClick={onNavigate}>
            {block.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null;

    case 'policy':
      return isSafeInternalRoute(block.route) ? (
        <Button asChild variant="outline" size="sm" className="w-full justify-start">
          <Link href={block.route} onClick={onNavigate}>
            <FileText className="h-3.5 w-3.5" />
            Read the full {block.title}
          </Link>
        </Button>
      ) : null;

    case 'order_list':
      return (
        <div className="space-y-1.5">
          {block.orders.map((order) => (
            <OrderRow key={order.orderNumber} order={order} onNavigate={onNavigate} />
          ))}
        </div>
      );

    case 'order_status':
      return <OrderRow order={block.order} onNavigate={onNavigate} />;

    default: {
      // Compile-time guard: adding a block type on the server without a renderer is a type error.
      const unreachable: never = block;
      return unreachable;
    }
  }
}

export function ChatBlocks({ blocks, onNavigate }: ChatBlocksProps) {
  if (blocks.length === 0) return null;
  return (
    <div className="mt-2 space-y-2">
      {blocks.map((block, i) => (
        <div key={`${block.type}-${i}`}>{renderBlock(block, onNavigate)}</div>
      ))}
    </div>
  );
}
