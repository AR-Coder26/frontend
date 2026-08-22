'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getMyAddresses, deleteMyAddress } from '@/lib/api/addresses';
import { AddressCard } from '@/components/account/AddressCard';
import { AddressFormDialog } from '@/components/account/AddressFormDialog';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/client';
import type { Address } from '@/types';

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    getMyAddresses()
      .then(setAddresses)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'Could not load addresses.')
      );
  }, []);

  async function handleDelete(addressId: string) {
    try {
      const updated = await deleteMyAddress(addressId);
      setAddresses(updated);
      toast.success('Address removed');
    } catch (err) {
      toast.error('Could not remove address', {
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    }
  }

  function handleEdit(address: Address) {
    setEditingAddress(address);
    setIsFormOpen(true);
  }

  function handleAddNew() {
    setEditingAddress(null);
    setIsFormOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-foreground">My Addresses</h1>
        <Button size="sm" onClick={handleAddNew}>
          Add Address
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {!addresses && !error && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      {addresses && addresses.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">No saved addresses yet.</p>
      )}

      {addresses && addresses.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={() => handleEdit(address)}
              onDelete={() => handleDelete(address._id)}
            />
          ))}
        </div>
      )}

      <AddressFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        address={editingAddress}
        onSaved={(updated) => {
          setAddresses(updated);
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}