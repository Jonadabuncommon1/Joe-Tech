import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { heroShots, HeroShot } from './heroShots';

/** How long each pair holds before the next one slides in. */
const HOLD_MS = 4200;

/** Length of the slide itself, and how long the outgoing pair is kept around. */
const SLIDE_MS = 650;

/**
 * Hero art: two real product shots at a time, sliding through side by side. It
 * replaced a static CSS phone/laptop mockup, which in turn replaced an animated
 * canvas scene that ran a continuous requestAnimationFrame simulation on every
 * visit and was the main thing making the homepage feel heavy on slower devices.
 *
 * The two on screen always come from different shop categories, so a visitor
 * sees two sides of the business at once rather than two near-identical phone
 * photos. Shots are drawn from a queue that works through every picture once,
 * then reshuffles into a different order, so the running order and the pairings
 * both change every lap instead of repeating a fixed sequence.
 *
 * Each picture sizes itself rather than being poured into a fixed frame: the
 * `<img>` scales down to fit its column and keeps its own shape, so the rounded
 * corners hug the actual photo and nothing sits marooned in an empty box.
 *
 * It stays cheap: at most four shots are in the DOM (the pair on screen plus
 * the pair leaving), a couple more are warmed ahead, a background tab does
 * not advance, and only transform/opacity animate so it stays on the
 * compositor. It used to be hidden below `lg` to spare phones the download
 * entirely; Joe asked for it on phones too, so the only saving left is
 * capping the DOM/preload count, not the screen size.
 *
 * The outgoing pair is dropped on a timer rather than on an animation-complete
 * callback, and that is deliberate. Browsers throttle requestAnimationFrame to
 * a standstill for occluded windows while `document.hidden` stays false, so an
 * animation-driven cleanup can simply never fire and leave slides piling up in
 * the DOM. Timers keep running in that state, so the ceiling holds whether or
 * not the animations themselves ever get to play.
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

/**
 * Take the next two shots off the queue, topping it up with a freshly shuffled
 * lap when it runs low so every picture still shows once per lap. The partner
 * is pulled from further down the queue when the next one along would repeat
 * the first one's category, which keeps the pair on screen from being two of
 * the same kind of thing.
 */
function takePair(queue: HeroShot[]): { pair: [HeroShot, HeroShot]; rest: HeroShot[] } {
  const rest = [...queue];
  while (rest.length < 2) rest.push(...shuffle(heroShots));

  const first = rest.shift() as HeroShot;
  let at = rest.findIndex((s) => s.category !== first.category && s.src !== first.src);
  if (at < 0) {
    // The tail of a lap can run down to a single category. Start the next lap
    // early rather than give up and show two of the same kind of thing; the
    // shots still queued are ahead of it, so nothing gets skipped.
    rest.push(...shuffle(heroShots));
    at = rest.findIndex((s) => s.category !== first.category && s.src !== first.src);
  }
  if (at < 0) at = 0;
  const [second] = rest.splice(at, 1);

  return { pair: [first, second], rest };
}

export const HeroVisual: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduceMotion = useReducedMotion();
  const queueRef = useRef<HeroShot[]>([]);

  /** What the hero is showing: the pair sliding in, and the pair sliding out. */
  const [frame, setFrame] = useState<{
    pair: [HeroShot, HeroShot];
    outgoing: [HeroShot, HeroShot] | null;
    lap: number;
  }>(() => {
    const { pair, rest } = takePair(shuffle(heroShots));
    queueRef.current = rest;
    return { pair, outgoing: null, lap: 0 };
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      // A background tab shouldn't burn through the queue, or pull down images
      // for slides nobody is looking at.
      if (document.hidden) return;
      const { pair, rest } = takePair(queueRef.current);
      queueRef.current = rest;
      setFrame((f) => ({ pair, outgoing: f.pair, lap: f.lap + 1 }));
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  // Retire the outgoing pair once it has had time to slide away, so the hero
  // never holds more than the four slots.
  useEffect(() => {
    if (!frame.outgoing) return;
    const id = window.setTimeout(
      () => setFrame((f) => (f.lap === frame.lap ? { ...f, outgoing: null } : f)),
      SLIDE_MS,
    );
    return () => window.clearTimeout(id);
  }, [frame.lap, frame.outgoing]);

  // Warm exactly the next pair so a slide never lands on a blank frame. This
  // peeks with the same picker rather than taking the queue's first two, since
  // the category rule can pull the partner from further down; guessing meant
  // warming a third image that was usually never shown.
  useEffect(() => {
    takePair(queueRef.current).pair.forEach((shot) => {
      const img = new Image();
      img.src = shot.src;
    });
  }, [frame.lap]);

  const slideIn = reduceMotion ? { opacity: 0 } : { opacity: 0, x: '38%' };
  const slideOut = reduceMotion ? { opacity: 0 } : { opacity: 0, x: '-38%' };

  return (
    <div className={`relative mx-auto w-full max-w-[440px] ${className}`}>
      {/* Soft color wash behind the pictures, cheap radial blurs instead of a canvas glow */}
      <div className="pointer-events-none absolute -top-10 right-0 h-64 w-64 rounded-full bg-jt-blue/20 blur-[70px] dark:bg-jt-blue/25" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-jt-mint/20 blur-[60px] dark:bg-jt-mint/15" />

      {/* The two overlap on a diagonal rather than sitting in equal columns:
          the hero's right-hand column is only ~360px wide, so side by side each
          picture came out barely bigger than a thumbnail. Overlapping lets each
          one take about two thirds of the width instead of half. Shorter on a
          phone, where this sits full-width beneath the hero text instead of
          alongside it in its own column. */}
      <div className="relative h-[300px] w-full sm:h-[360px] lg:h-[430px]">
        {([0, 1] as const).map((slot) => (
            <div
              key={slot}
              className={
                slot === 0
                  ? 'absolute left-0 top-0 z-10 flex h-[60%] w-[66%] items-center justify-start'
                  : 'absolute bottom-0 right-0 z-20 flex h-[60%] w-[66%] items-center justify-end'
              }
            >
              {frame.outgoing && (
                <motion.img
                  key={`out-${frame.lap}-${slot}`}
                  src={frame.outgoing[slot].src}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  initial={{ opacity: 1, x: '0%' }}
                  animate={slideOut}
                  transition={{
                    duration: SLIDE_MS / 1000,
                    ease: [0.22, 1, 0.36, 1],
                    delay: slot * 0.07,
                  }}
                  className="absolute max-h-full max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/15"
                />
              )}

              <motion.img
                key={`in-${frame.lap}-${slot}`}
                src={frame.pair[slot].src}
                alt={frame.pair[slot].alt}
                decoding="async"
                initial={frame.lap === 0 ? false : slideIn}
                animate={{ opacity: 1, x: '0%' }}
                transition={{
                  duration: SLIDE_MS / 1000,
                  ease: [0.22, 1, 0.36, 1],
                  delay: slot * 0.07,
                }}
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/15"
              />
            </div>
          ))}
      </div>
    </div>
  );
};
