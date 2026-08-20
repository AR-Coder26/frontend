import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShoppingBag className="h-10 w-10 text-muted-foreground" />
      <p className="mt-4 font-display text-lg text-foreground">Your cart is empty</p>
      <p className="mt-1 text-sm text-muted-foreground">Start adding pieces you love.</p>
      <Button asChild className="mt-6">
        <Link href="/products">Shop All</Link>
      </Button>
    </div>
  );
}