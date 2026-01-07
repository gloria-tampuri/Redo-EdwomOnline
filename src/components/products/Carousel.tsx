'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode[];
  itemsPerView?: number;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  itemsPerView = 4,
  autoSlide = false,
  autoSlideInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = Math.max(1, Math.ceil(children.length / itemsPerView));

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, totalSlides - 1)));
  }, [totalSlides]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, totalSlides]);

  const startIndex = currentIndex * itemsPerView;
  const visibleItems = children.slice(startIndex, startIndex + itemsPerView);

  // Determine grid columns based on itemsPerView
  const getGridColsClass = () => {
    switch (itemsPerView) {
      case 2:
        return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2';
      case 3:
        return 'grid-cols-3 md:grid-cols-3 lg:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';
      case 6:
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';
    }
  };

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div className={`grid ${getGridColsClass()} gap-4 w-full`}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} className="w-full">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Only show if there are multiple slides */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>

          <button
            onClick={goToNext}
            disabled={currentIndex === totalSlides - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Next slide"
          >
            <ChevronRight size={20} className="text-gray-700" />
          </button>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-[#556B2F] w-6'
                    : 'bg-gray-300 w-2 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? 'page' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
