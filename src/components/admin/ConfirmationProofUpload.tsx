'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { MessageCircle, ShieldCheck, ShieldAlert, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadConfirmationProof } from '@/lib/api/orders';
import { ApiError } from '@/lib/api/client';
import type { Order } from '@/types';

interface ConfirmationProofUploadProps {
  order: Order;
  onVerified: (updatedOrder: Order) => void;
}

/**
 * This is the frontend half of the client's core anti-fraud mechanism (backend
 * PROJECT_STATE §7.8, §8): the admin clicks the generated wa.me link, manually sends that
 * message from their own WhatsApp, screenshots it, and uploads the screenshot here.
 * tesseract.js (server-side) OCRs it for the order number + store branding phrase and only
 * then flips `firstMessageSent`, which is what actually unblocks Pending -> Confirmed.
 * There was NO admin UI for any of this before this build (see finalization audit F-03) —
 * this component is the first one.
 */
export function ConfirmationProofUpload({ order, onVerified }: ConfirmationProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      const updated = await uploadConfirmationProof(order._id, formData);
      onVerified(updated);
      if (updated.firstMessageSent) {
        toast.success('Screenshot verified — order can now be confirmed.');
      } else {
        // The endpoint can succeed (200) without the OCR match actually being found — the
        // backend only flips firstMessageSent when BOTH the order number and the branding
        // phrase are detected. A non-throwing "not verified yet" response is a real, valid
        // outcome, not an error, so this is a warning toast rather than a caught exception.
        toast.warning('Screenshot uploaded, but verification did not find the order number and branding text. Try a clearer screenshot.');
      }
    } catch (error) {
      toast.error('Could not upload screenshot', {
        description: error instanceof ApiError ? error.message : 'Please try again.',
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">WhatsApp Confirmation Gate</h3>
        {order.firstMessageSent ? (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
            <ShieldAlert className="h-3.5 w-3.5" /> Not yet verified
          </span>
        )}
      </div>

      <p className="mb-4 text-xs text-neutral-500">
        Send the order confirmation on WhatsApp, screenshot it, then upload it here. The order
        cannot move to <strong>Confirmed</strong> until this screenshot is verified.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={order.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" /> Open WhatsApp Message
          </a>
        </Button>

        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800">
          {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {isUploading ? 'Verifying…' : order.firstMessageProof ? 'Re-upload screenshot' : 'Upload screenshot'}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelected}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {order.firstMessageProof?.url && (
        <div className="mt-4">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-400">Uploaded proof</p>
          <Image
            src={order.firstMessageProof.url}
            alt="WhatsApp confirmation screenshot"
            width={200}
            height={280}
            className="rounded-md border border-neutral-200 object-cover"
          />
        </div>
      )}
    </div>
  );
}
