'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import type { ImageAsset } from '@/types';

interface SingleImagePickerProps {
  label: string;
  existingImage: ImageAsset | null;
  /** Fires with the picked File, or null if the person clears their pending selection.
   *  Clearing does NOT delete the existing image server-side — the backend's create/update
   *  endpoints for Category/Brand simply keep the current image whenever no file is sent
   *  (see lib/api/categories.ts's updateCategory doc comment), so "clear" here only means
   *  "cancel my replacement choice," never "remove the logo entirely." There's no dedicated
   *  delete-image endpoint for these two resources, unlike Product's gallery. */
  onChange: (file: File | null) => void;
}

export function SingleImagePicker({ label, existingImage, onChange }: SingleImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPendingFile(file);
    onChange(file);
  }

  function handleClear() {
    setPendingFile(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // Same empty-string-url guard pattern as ProductGallery.tsx — an ImageAsset can exist with
  // a blank `url` and next/image will throw on that, not just on a missing image object.
  const displayUrl = previewUrl ?? (existingImage?.url ? existingImage.url : null);

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-neutral-300 bg-neutral-50">
          {displayUrl ? (
            <Image src={displayUrl} alt={label} width={96} height={96} className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-6 w-6 text-neutral-300" />
          )}
        </div>
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
            <ImagePlus className="h-3.5 w-3.5" />
            {existingImage || pendingFile ? 'Replace image' : 'Choose image'}
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePick} className="hidden" />
          </label>
          {pendingFile && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-destructive"
            >
              <X className="h-3 w-3" /> Cancel new selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
