'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { ObjectPhoto } from '@/types/objects';

type ObjectImageCarouselProps = {
  photos: ObjectPhoto[];
  objectName: string;
};

export function ObjectImageCarousel({ photos, objectName }: ObjectImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-square mb-6">
        <ImageWithFallback
          alt={`Placeholder pour ${objectName || 'objet'}`}
          className="w-full h-full rounded bg-gray-100"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Carousel principal */}
      <div className="overflow-hidden rounded-lg shadow-md mb-4" ref={emblaRef}>
        <div className="flex">
          {photos.map((photo, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative aspect-square">
              <ImageWithFallback
                src={photo.url}
                alt={`Photo ${index + 1} de ${objectName} - ${photo.description.join(', ')}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="rounded"
                imgClassName="object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {photos.length > 1 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Photo précédente"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Indicateurs de pagination */}
          <div className="flex gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Aller à la photo ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Photo suivante"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Miniatures (thumbnails) */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
              aria-label={`Voir la photo ${index + 1}`}
            >
              <ImageWithFallback
                src={photo.url}
                alt={`Miniature ${index + 1}`}
                fill
                sizes="(max-width: 768px) 25vw, 8vw"
                className="rounded"
                imgClassName="object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

