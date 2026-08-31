'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ApiError } from '@/lib/api/client';
import type { ImageAsset } from '@/types';

interface ProductImageManagerProps {
  label: string;
  existingImages: ImageAsset[];
  maxFiles: number;
  /** Called immediately when the person clicks "Upload" — this hits a real, dedicated
   *  multipart endpoint right away (POST .../images or .../variants/:id/images) rather than
   *  batching with the rest of the product form. That mirrors the backend's actual two-step
   *  design (see backend PROJECT_STATE §6 "CRITICAL for frontend") instead of pretending it's
   *  a single combined save. */
  onUpload: (files: File[]) => Promise<void>;
  /** Called immediately on confirmed delete — also a real, standalone endpoint call. */
  onDelete: (publicId: string) => Promise<void>;
}

export function ProductImageManager({ label, existingImages, maxFiles, onUpload, onDelete }: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const urls = pendingFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [pendingFiles]);

  // Same empty-string-url guard as ProductGallery.tsx — filter once at the boundary.
  const validExisting = existingImages.filter((img) => img.url);
  const remainingSlots = maxFiles - validExisting.length - pendingFiles.length;

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    if (picked.length > remainingSlots) {
      toast.error(`You can add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} here (max ${maxFiles} total).`);
    }
    setPendingFiles((prev) => [...prev, ...picked].slice(0, maxFiles - validExisting.length));
    if (inputRef.current) inputRef.current.value = '';
  }

  function removePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUploadClick() {
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    try {
      await onUpload(pendingFiles);
      setPendingFiles([]);
      toast.success('Images uploaded');
    } catch (error) {
      toast.error('Upload failed', { description: error instanceof ApiError ? error.message : 'Please try again.' });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget);
      toast.success('Image removed');
    } catch (error) {
      toast.error('Could not remove image', { description: error instanceof ApiError ? error.message : 'Please try again.' });
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
        <span className="text-xs text-neutral-400">
          {validExisting.length + pendingFiles.length}/{maxFiles}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {validExisting.map((img) => (
          <div key={img.publicId} className="group relative h-20 w-20 overflow-hidden rounded-md border border-neutral-200">
            <Image src={img.url} alt={label} width={80} height={80} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setDeleteTarget(img.publicId)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        {pendingFiles.map((file, i) => (
          <div key={`${file.name}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-md border-2 border-dashed border-accent">
            {previewUrls[i] && (
              <Image src={previewUrls[i]} alt={file.name} width={80} height={80} className="h-full w-full object-cover opacity-80" />
            )}
            <button
              type="button"
              onClick={() => removePending(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
              aria-label="Cancel this image"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        {remainingSlots > 0 && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600">
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px]">Add</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handlePick}
              className="hidden"
            />
          </label>
        )}
      </div>

      {pendingFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isUploading && <Loader2 className="h-3 w-3 animate-spin" />}
          {isUploading ? 'Uploading…' : `Upload ${pendingFiles.length} image${pendingFiles.length === 1 ? '' : 's'}`}
        </button>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this image?"
        description="This permanently deletes the image from storage. This cannot be undone."
        confirmLabel="Remove"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
