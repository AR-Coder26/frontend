'use client';

import { useState, type MouseEvent } from 'react';
import Image from 'next/image';
import type { ImageAsset } from '@/types';

interface ProductGalleryProps {
  images: ImageAsset[];
  productName: string;
}

/**
 * IMPORTANT for callers: render this with `key={someIdentifierForTheImageSet}` (e.g. the
 * selected color) whenever the `images` prop can switch to a genuinely different set —
 * React needs that key to remount the component and reset activeIndex back to 0. Without
 * it, switching color could leave the gallery showing "photo #3" from the NEW color purely
 * because that was the thumbnail index scrolled to on the PREVIOUS color.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState('center');
  const [isZooming, setIsZooming] = useState(false);

  const activeImage = images[activeIndex];

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  if (!activeImage) {
    return <div className="skeleton aspect-[3/4] rounded-md bg-secondary" />;
  }

  return (
    <div>
      <div
        className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-md bg-secondary"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={activeImage.url}
          alt={productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 ease-out"
          style={{
            transformOrigin: zoomOrigin,
            transform: isZooming ? 'scale(1.6)' : 'scale(1)',
          }}
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.publicId}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                index === activeIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}