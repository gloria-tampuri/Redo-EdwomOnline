"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

interface HeroSliderProps {
  slides: HeroSlide[];
  autoSlideInterval?: number;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  autoSlideInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0) {
        setCurrentIndex(slides.length - 1);
      } else if (index >= slides.length) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(index);
      }
    },
    [slides.length]
  );

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [autoSlideInterval, slides.length]);

  return (
    <section className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image - using Next Image for optimization */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            quality={85}
            sizes="100vw"
            placeholder="empty"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#556B2F]/90 via-[#556B2F]/60 to-transparent" />

          {/* Content */}
          <div className="relative mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-20">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {slide.title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-100 mb-8 max-w-xl">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {slide.primaryCta && (
                  <Link
                    href={slide.primaryCta.href}
                    className="px-8 py-3 rounded-lg bg-white text-gray-900 font-bold hover:bg-primary-foreground transition text-center shadow-lg"
                  >
                    {slide.primaryCta.text}
                  </Link>
                )}
                {slide.secondaryCta && (
                  <Link
                    href={slide.secondaryCta.href}
                    className="px-8 py-3 rounded-lg border-2 border-white text-white font-bold hover:bg-white/10 transition text-center"
                  >
                    {slide.secondaryCta.text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-[#00CC4D] w-8"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
