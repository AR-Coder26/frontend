'use client';

import { useState, type PointerEvent as ReactPointerEvent } from 'react';
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

  // The backend can return an ImageAsset object that EXISTS but has an empty-string `url`
  // (not just a missing/null image) — next/image throws "An empty string was passed to the
  // src attribute" if that ever reaches it un-filtered. Filtering once here, at the
  // boundary, covers both the main image and every thumbnail below in one place, rather
  // than needing a separate guard at each render site.
  const validImages = images.filter((image) => image.url);
  const activeImage = validImages[activeIndex];

  // Hover-zoom is for a real mouse only. Touch screens fire emulated mouseenter/mousemove on a
  // tap, which used to leave the photo stuck at 1.6x until the next tap elsewhere. Pointer
  // events carry the pointer type, so touch and pen are ignored here (pinch-zoom still works).
  function handlePointerEnter(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse') setIsZooming(true);
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse') setIsZooming(false);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  if (!activeImage) {
    return <div className="skeleton mx-auto aspect-[3/4] w-full max-w-lg rounded-md bg-secondary lg:max-w-none" />;
  }

  return (
    // max-w-lg keeps the 3:4 photo from becoming ~900px tall on tablets, where the layout is
    // still a single column; min-w-0 stops a long thumbnail strip from widening the page.
    <div className="mx-auto w-full min-w-0 max-w-lg lg:max-w-none">
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-md bg-secondary md:cursor-zoom-in"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
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

      {validImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {validImages.map((image, index) => (
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