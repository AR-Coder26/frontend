import { Badge } from '@/components/ui/badge';
import type { Address } from '@/types';

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}

export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          {address.label && (
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              {address.label}
            </p>
          )}
          <p className="mt-0.5 text-sm text-foreground">{address.addressLine}</p>
          <p className="text-sm text-muted-foreground">
            {address.city}
            {address.postalCode && `, ${address.postalCode}`}
          </p>
        </div>
        {address.isDefault && <Badge variant="secondary">Default</Badge>}
      </div>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-primary hover:text-primary-hover"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs font-medium text-destructive hover:text-destructive/80"
        >
          Delete
        </button>
      </div>
    </div>
  );
}