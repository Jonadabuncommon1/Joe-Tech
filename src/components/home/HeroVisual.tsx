import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { heroShots, HeroShot } from './heroShots';

/** How long each shot holds before the next one slides in. */
const HOLD_MS = 2600;

/** Length of the slide transition itself. */
const SLIDE_MS = 600;

/**
 * Hero art: a single real product shot at a time, filling one big framed box
 * and sliding straight through to the next. It replaced an earlier two-photo
 * diagonal layout (one shot pinned top-left, one bottom-right) with a single
 * centered frame per Joe's request, one clear picture rather than two small
 * overlapping ones, so it reads at a glance on both phone and desktop.
 *
 * Shots are drawn from a shuffled queue that works through every picture once
 * before reshuffling into a new order, so the running order changes lap to
 * lap instead of repeating a fixed sequence.
 *
 * It stays cheap: only the outgoing and incoming shot are ever in the DOM at
 * once (AnimatePresence drops the outgoing one the moment its exit finishes),
 * the next shot is warmed a beat ahead of time, and only transform/opacity
 * animate so it stays on the compositor. A background tab does not advance,
 * since browsers throttle rAF for occluded windows but keep timers running,
 * and advancing on a timer (rather than an animation-complete callback) means
 * the slideshow can't get stuck mid-lap if a tab was hidden through a tick.
 */

/** Fisher-Yates over a copy. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const HeroVisual: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduceMotion = useReducedMotion();
  const queueRef = useRef<HeroShot[]>([]);

  const [frame, setFrame] = useState<{ shot: HeroShot; lap: number }>(() => {
    const deck = shuffle(heroShots);
    const shot = deck.shift() as HeroShot;
    queueRef.current = deck;
    return { shot, lap: 0 };
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      // A background tab shouldn't burn through the queue for slides nobody
      // is looking at.
      if (document.hidden) return;
      setFrame((f) => {
        let deck = queueRef.current;
        if (deck.length === 0) deck = shuffle(heroShots);
        const [shot, ...rest] = deck;
        queueRef.current = rest;
        return { shot, lap: f.lap + 1 };
      });
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  // Warm the next shot a beat ahead so a slide never lands on a blank frame.
  useEffect(() => {
    const upcoming = queueRef.current[0] ?? heroShots[0];
    const img = new Image();
    img.src = upcoming.src;
  }, [frame.lap]);

  const slideIn = reduceMotion ? { opacity: 0 } : { opacity: 0, x: '100%' };
  const slideOut = reduceMotion ? { opacity: 0 } : { opacity: 0, x: '-100%' };

  return (
    <div className={`relative mx-auto w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[540px] ${className}`}>
      {/* Soft color wash behind the frame, cheap radial blurs instead of a canvas glow */}
      <div className="pointer-events-none absolute -top-10 right-0 h-64 w-64 rounded-full bg-jt-blue/20 blur-[70px] dark:bg-jt-blue/25" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-jt-mint/20 blur-[60px] dark:bg-jt-mint/15" />

      {/* One big bordered frame, taller on every breakpoint than the old
          two-photo layout so it reads clearly on both phone and desktop.
          object-contain plus a white mat, not object-cover, because the shot
          pool mixes full-bleed lifestyle photos with promo-card graphics
          that already carry their own white background baked into the
          image, cover would crop those oddly instead of just showing them
          whole the way the old two-photo layout did. */}
      <div className="relative h-[340px] w-full overflow-hidden rounded-3xl border-4 border-white/25 bg-white shadow-2xl sm:h-[420px] lg:h-[480px]">
        <AnimatePresence initial={false}>
          <motion.img
            key={frame.lap}
            src={frame.shot.src}
            alt={frame.shot.alt}
            decoding="async"
            initial={frame.lap === 0 ? false : slideIn}
            animate={{ opacity: 1, x: '0%' }}
            exit={slideOut}
            transition={{ duration: SLIDE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-contain p-3 sm:p-4"
          />
        </AnimatePresence>
      </div>
    </div>
  );
};
