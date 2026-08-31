import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

/** A plain native <select>, styled to match Input/Textarea. No @radix-ui/react-select is
 *  installed (checked package.json before adding this) — introducing it just for the admin
 *  panel would be a new dependency for a handful of simple enum pickers (category, brand,
 *  size, fabricType, order status...), all of which a native select handles fine. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border bg-card px-3 py-2 pr-9 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          invalid ? 'border-destructive' : 'border-input',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
);
Select.displayName = 'Select';

export { Select };