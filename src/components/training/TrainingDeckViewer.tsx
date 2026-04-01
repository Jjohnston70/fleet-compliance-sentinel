'use client';

import { useState, useEffect, useCallback } from 'react';

interface Slide {
  slide_number: number;
  slide_type: string;
  title: string;
  content: string;
  notes: string;
  bullet_points: string[];
}

interface DeckTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    text_secondary: string;
  };
  slide_types: Record<string, { bg: string; text: string }>;
}

interface DeckData {
  module_code: string;
  title: string;
  phmsa_equivalent: string;
  estimated_duration_minutes: number;
  slide_count: number;
  slides: Slide[];
  theme: DeckTheme;
}

interface TrainingDeckViewerProps {
  moduleCode: string;
  onDeckComplete: () => void;
  onSlideChange?: (slideNumber: number, totalSlides: number) => void;
}

export default function TrainingDeckViewer({
  moduleCode,
  onDeckComplete,
  onSlideChange,
}: TrainingDeckViewerProps) {
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const [slideStartTime, setSlideStartTime] = useState(Date.now());
  const [timePerSlide, setTimePerSlide] = useState<Record<number, number>>({});
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    async function loadDeck() {
      try {
        const res = await fetch(`/api/v1/training/${moduleCode}/deck`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Failed to load training deck');
          return;
        }
        const data = await res.json();
        setDeck(data);
      } catch {
        setError('Network error loading training deck');
      } finally {
        setLoading(false);
      }
    }
    loadDeck();
  }, [moduleCode]);

  const recordSlideTime = useCallback(() => {
    const elapsed = Math.round((Date.now() - slideStartTime) / 1000);
    setTimePerSlide((prev) => ({
      ...prev,
      [currentSlide]: (prev[currentSlide] || 0) + elapsed,
    }));
  }, [currentSlide, slideStartTime]);

  function goToSlide(index: number) {
    if (!deck) return;
    recordSlideTime();
    const next = Math.max(0, Math.min(index, deck.slides.length - 1));
    setCurrentSlide(next);
    setSlideStartTime(Date.now());
    onSlideChange?.(next + 1, deck.slides.length);
  }

  function handleNext() {
    if (!deck) return;
    if (currentSlide >= deck.slides.length - 1) {
      recordSlideTime();
      const totalSeconds = Math.round((Date.now() - startTime) / 1000);
      onDeckComplete();
      return;
    }
    goToSlide(currentSlide + 1);
  }

  function handlePrev() {
    goToSlide(currentSlide - 1);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500">Loading training module...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (!deck || deck.slides.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700">No slides found for this module.</p>
      </div>
    );
  }

  const slide = deck.slides[currentSlide];
  const progress = ((currentSlide + 1) / deck.slides.length) * 100;
  const isLastSlide = currentSlide === deck.slides.length - 1;
  const slideStyle = deck.theme.slide_types[slide.slide_type] || {
    bg: '#FFFFFF',
    text: '#1E293B',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide counter */}
      <div className="flex justify-between items-center px-4 py-2 text-sm text-slate-500">
        <span>{deck.title}</span>
        <span>
          Slide {currentSlide + 1} of {deck.slides.length}
        </span>
      </div>

      {/* Slide content */}
      <div
        className="flex-1 rounded-lg p-8 md:p-12 min-h-[400px] flex flex-col justify-center transition-colors duration-300"
        style={{ backgroundColor: slideStyle.bg, color: slideStyle.text }}
      >
        {slide.title && (
          <h2
            className="text-2xl md:text-3xl font-bold mb-6"
            style={{ color: slideStyle.text }}
          >
            {slide.title}
          </h2>
        )}

        {slide.bullet_points.length > 0 ? (
          <ul className="space-y-3 text-lg">
            {slide.bullet_points.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-2 w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      slideStyle.bg === '#FFFFFF'
                        ? deck.theme.colors.secondary
                        : deck.theme.colors.accent,
                  }}
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : slide.content ? (
          <div className="text-lg leading-relaxed whitespace-pre-wrap">
            {slide.content.split('\n\n').map((para, i) => (
              <p key={i} className="mb-4">
                {para}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {/* Notes toggle */}
      {slide.notes && (
        <div className="mt-2">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-sm text-teal-600 hover:text-teal-800 underline"
          >
            {showNotes ? 'Hide Details' : 'Learn More'}
          </button>
          {showNotes && (
            <div className="mt-2 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
              {slide.notes}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex gap-1">
          {deck.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentSlide
                  ? 'bg-teal-600'
                  : i < currentSlide
                    ? 'bg-teal-300'
                    : 'bg-slate-300'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isLastSlide
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {isLastSlide ? 'Start Assessment' : 'Next'}
        </button>
      </div>
    </div>
  );
}
