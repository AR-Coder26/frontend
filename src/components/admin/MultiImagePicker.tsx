'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';

interface MultiImagePickerProps {
  label: string;
  maxFiles: number;
  files: File[];
  onChange: (files: File[]) => void;
}

/** Purely local — no upload happens here. Used only where images must be gathered BEFORE
 *  the parent resource exists (new-product's general gallery, sent as part of the initial
 *  multipart POST /admin/products). Once a resource exists, ProductImageManager is the right
 *  component instead — it uploads/deletes immediately against real per-resource endpoints. */
export function MultiImagePicker({ label, maxFiles, files, onChange }: MultiImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    onChange([...files, ...picked].slice(0, maxFiles));
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  const remainingSlots = maxFiles - files.length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
        <span className="text-xs text-neutral-400">{files.length}/{maxFiles}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {files.map((file, i) => (
          <div key={`${file.name}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-md border border-neutral-200">
            {previewUrls[i] && (
              <Image src={previewUrls[i]} alt={file.name} width={80} height={80} className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
              aria-label="Remove image"
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
    </div>
  );
}
