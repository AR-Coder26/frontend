'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  /** If this rejects, the dialog simply stays open and re-enables its buttons — it does NOT
   *  rethrow. Callers are expected to show their own toast/error feedback inside onConfirm's
   *  own try/catch; they never need to rethrow just to keep this dialog open on failure. */
  onConfirm: () => Promise<void>;
  destructive?: boolean;
}

/**
 * No @radix-ui/react-alert-dialog is installed, and this project already has a working
 * @radix-ui/react-dialog-based Dialog — reusing that (same reasoning dialog.tsx itself gave
 * for reusing Sheet's package) rather than adding a second, near-identical dependency for
 * "the same modal but with a different a11y role."
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  destructive = true,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleConfirm() {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Swallowed deliberately — see onConfirm's doc comment above. The caller already
      // surfaced a toast; re-throwing here would just become an unhandled rejection since
      // this is invoked from a plain onClick, not awaited by anything upstream.
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className={destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isConfirming ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}