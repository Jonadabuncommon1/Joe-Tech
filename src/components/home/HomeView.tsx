import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  RefreshCw,
  Search,
  Star,
  Sun,
  Wrench,
  Flame,
} from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { marketplaceCategories, formatPrice } from '../../data';
import { GadgetIcon, ProductImage } from '../ui/ProductImage';
import { HeroVisual } from './HeroVisual';
import { branches, contacts, site, waLink } from '../../config/site';
import { Product } from '../../types';

/**
 * Customer testimonials. Written for the actual catalogue rather than
 * generic praise, each one names a real product from data.ts so it reads as
 * specific and checkable, not stock marketing copy.
 */
const testimonials: { name: string; location: string; rating: number; product: string; quote: string }[] = [
  {
    name: 'Chidinma O.',
    location: 'Nsukka',
    rating: 5,
    product: 'MacBook Pro 14" M3',
    quote:
      "I was scared to buy a used MacBook online, but they let me test it fully in the shop before I paid, battery, keyboard, everything. Almost two months now and it still runs like new. This one is worth it.",
  },
  {
    name: 'Emeka A.',
    location: 'Lagos',
    rating: 5,
    product: 'Ergonomic Gaming Chair with RGB',
    quote:
      "My back used to hurt after long gaming sessions, this chair changed everything. Delivery to Ikeja was fast too, and it came exactly as pictured. No regret at all.",
  },
  {
    name: 'Blessing U.',
    location: 'Nsukka',
    rating: 5,
    product: 'Gaming Desk with RGB Surface (140cm)',
    quote:
      "The desk is solid, not the shaky type you see everywhere. It even matched the chair I bought from them the month before. My setup looks like something from YouTube now.",
  },
  {
    name: 'Tobenna K.',
    location: 'Lagos',
    rating: 5,
    product: 'iPhone 15 Pro Max 256GB',
    quote:
      "Clean IMEI, iCloud free, exactly as they said. I compared prices at three other places before coming here, Joe Tech was still the most straightforward about the phone's condition.",
  },
  {
    name: 'Ngozi F.',
    location: 'Nsukka',
    rating: 5,
    product: 'Complete 3KVA Solar Kit (Installed)',
    quote:
      "NEPA wahala in my area was too much, so I finally did the solar installation. Their engineers came, assessed my load properly, and were honest that I didn't need the bigger package I first asked for. Saved me money.",
  },
  {
    name: 'Ifeanyi C.',
    location: 'Lagos',
    rating: 4,
    product: 'Laptop Screen Replacement',
    quote:
      "Cracked my laptop screen the night before a deadline. They diagnosed it free, quoted me before touching it, and had it fixed the next day. Only reason it's not five stars is I wish they had same-day service for screens too.",
  },
  {
    name: 'Amara N.',
    location: 'Nsukka',
    rating: 5,
    product: 'Samsung Galaxy S24 Ultra 256GB',
    quote:
      "I bought this for my mum as a gift and paid by transfer since I wasn't in Nsukka at the time. They confirmed everything on WhatsApp and had it delivered to her before the weekend. Very reliable people.",
  },
];

/**
 * Testimonials as a swipeable card stack rather than a static grid: one
 * quote sharp and up front, the next couple peeking blurred behind it. A
 * decisive swipe (or drag) in either direction discards the front card for
 * good and brings the next one forward, looping back to the start after the
 * last, so it reads as a deck you flip through rather than a page of text.
 */
const TestimonialCarousel: React.FC<{ items: typeof testimonials }> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const STACK_SIZE = Math.min(3, items.length);

  const advance = useCallback(() => {
    setActiveIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const retreat = useCallback(() => {
    setActiveIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  return (
    <div className="mx-auto mt-8 flex max-w-lg flex-col items-center">
      <div className="relative h-[400px] w-full sm:h-[320px]">
        <AnimatePresence initial={false}>
          {Array.from({ length: STACK_SIZE }).map((_, offset) => {
            const idx = (activeIndex + offset) % items.length;
            const t = items[idx];
            const isTop = offset === 0;
            return (
              <motion.div
                key={idx}
                drag={isTop ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={(_e, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -400) advance();
                  else if (info.offset.x > 80 || info.velocity.x > 400) retreat();
                }}
                initial={{ opacity: 0, scale: 1 - (STACK_SIZE - 1) * 0.05, y: (STACK_SIZE - 1) * 26 }}
                animate={{
                  opacity: offset === 0 ? 1 : 0.95 - offset * 0.12,
                  scale: 1 - offset * 0.05,
                  y: offset * 26,
                  x: 0,
                  filter: offset === 0 ? 'blur(0px)' : `blur(${1 + offset * 2.5}px)`,
                }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.22 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                style={{ zIndex: STACK_SIZE - offset }}
                className={`absolute inset-x-0 top-0 flex h-full flex-col rounded-2xl border p-5 shadow-lg ${
                  isTop
                    ? 'cursor-grab touch-pan-y border-jt-ink/8 bg-jt-paper active:cursor-grabbing dark:border-white/10 dark:bg-jt-ink/50'
                    : 'pointer-events-none border-jt-blue/15 bg-jt-blue/[0.04] dark:border-jt-mint/15 dark:bg-jt-mint/[0.05]'
                }`}
              >
                <Quote className="h-5 w-5 shrink-0 text-jt-blue/30 dark:text-jt-mint/30" />
                <p className="mt-2 flex-1 overflow-y-auto text-sm leading-relaxed text-jt-ink/80 [scrollbar-width:none] dark:text-jt-steel [&::-webkit-scrollbar]:hidden">
                  "{t.quote}"
                </p>
                <div className="mt-4 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      className={`h-3.5 w-3.5 ${
                        starIdx < t.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-jt-ink/10 text-jt-ink/10 dark:fill-white/10 dark:text-white/10'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-2 border-t border-jt-ink/8 pt-3 dark:border-white/10">
                  <p className="text-sm font-bold text-jt-ink dark:text-white">
                    {t.name} <span className="font-normal text-jt-ink/50 dark:text-jt-steel">· {t.location}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-jt-blue dark:text-jt-mint">
                    Bought: {t.product}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={retreat}
          aria-label="Previous testimonial"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-jt-ink/10 text-jt-ink/60 transition-colors hover:border-jt-blue hover:text-jt-blue dark:border-white/15 dark:text-jt-steel dark:hover:border-jt-mint dark:hover:text-jt-mint"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? 'w-5 bg-jt-blue dark:bg-jt-mint' : 'w-1.5 bg-jt-ink/15 dark:bg-white/15'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={advance}
          aria-label="Next testimonial"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-jt-ink/10 text-jt-ink/60 transition-colors hover:border-jt-blue hover:text-jt-blue dark:border-white/15 dark:text-jt-steel dark:hover:border-jt-mint dark:hover:text-jt-mint"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/** One real product photo the showcase can slide to. */
interface ShowcaseShot {
  src: string;
  alt: string;
}

/** Fisher-Yates over a copy, same helper HeroVisual uses. */
function shuffleShots<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const CATEGORY_HOLD_MS = 1800;
const CATEGORY_SLIDE_MS = 500;

/**
 * The image half of the homepage "Shop by category" banner: a single real
 * product shot at a time, auto-advancing and swipeable. Deliberately draws
 * from the actual catalogue (whatever is uploaded and in stock in the admin
 * panel right now), not the header's curated marketing stills, Joe was
 * explicit that this section should only ever show real, currently-listed
 * products, never a generic promo photo. Kept as its own element (not
 * nested inside the banner's clickable text button) so the drag gesture
 * here never fights a parent onClick for the same tap the way the
 * testimonial cards briefly did earlier, dragging a photo to peek at the
 * next one should never also fire a page navigation.
 */
const CategoryShowcase: React.FC<{ items: ShowcaseShot[] }> = ({ items }) => {
  const reduceMotion = useReducedMotion();
  const queueRef = React.useRef<ShowcaseShot[]>([]);

  const [frame, setFrame] = useState<{ shot: ShowcaseShot | null; lap: number }>(() => {
    if (items.length === 0) return { shot: null, lap: 0 };
    const deck = shuffleShots(items);
    const shot = deck.shift() as ShowcaseShot;
    queueRef.current = deck;
    return { shot, lap: 0 };
  });

  const advance = useCallback(() => {
    if (items.length === 0) return;
    setFrame((f) => {
      let deck = queueRef.current;
      if (deck.length === 0) deck = shuffleShots(items);
      const [shot, ...rest] = deck;
      queueRef.current = rest;
      return { shot, lap: f.lap + 1 };
    });
  }, [items]);

  useEffect(() => {
    if (items.length === 0) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      advance();
    }, CATEGORY_HOLD_MS);
    return () => window.clearInterval(id);
  }, [advance, items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const upcoming = queueRef.current[0] ?? items[0];
    const img = new Image();
    img.src = upcoming.src;
  }, [frame.lap, items]);

  const slideIn = reduceMotion ? { opacity: 0 } : { opacity: 0, x: '100%' };
  const slideOut = reduceMotion ? { opacity: 0 } : { opacity: 0, x: '-100%' };

  if (!frame.shot) {
    // No uploaded product has a photo yet, extremely unlikely on a live
    // store, but a plain empty panel beats a broken image or, worse,
    // quietly falling back to a stock photo Joe specifically didn't want
    // here.
    return (
      <div className="flex h-[220px] items-center justify-center bg-jt-blue/5 text-xs text-jt-ink/40 dark:bg-jt-mint/5 dark:text-jt-steel sm:h-[300px] lg:h-full lg:min-h-[360px]">
        New arrivals coming soon
      </div>
    );
  }

  return (
    // object-contain plus a white mat, not object-cover: product photos
    // come in whatever aspect ratio they were uploaded in, cover would crop
    // some of them oddly.
    <div className="relative h-[220px] overflow-hidden bg-white sm:h-[300px] lg:h-full lg:min-h-[360px]">
      <AnimatePresence initial={false}>
        <motion.img
          key={frame.lap}
          src={frame.shot.src}
          alt={frame.shot.alt}
          decoding="async"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_e, info) => {
            if (info.offset.x < -60 || info.velocity.x < -400) advance();
            else if (info.offset.x > 60 || info.velocity.x > 400) advance();
          }}
          initial={frame.lap === 0 ? false : slideIn}
          animate={{ opacity: 1, x: '0%' }}
          exit={slideOut}
          transition={{ duration: CATEGORY_SLIDE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full cursor-grab touch-pan-y object-contain p-4 active:cursor-grabbing sm:p-6"
        />
      </AnimatePresence>
    </div>
  );
};

import { ProductCard } from '../shop/ProductCard';

/* ────────────────────────────────────────────────────────────────────────── */
/* Shared motion helpers                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Animated CTA icons                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

const ShoppingArrow: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => {
  const still = useReducedMotion();
  return (
    <motion.span
      className="relative inline-flex"
      animate={still ? undefined : { x: [0, 4, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
    >
      <ArrowRight className={className} />
    </motion.span>
  );
};

const TurningWrench: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => {
  const still = useReducedMotion();
  return (
    <motion.span
      className="relative inline-flex origin-center"
      animate={still ? undefined : { rotate: [0, -20, 12, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.1 }}
    >
      <Wrench className={className} />
    </motion.span>
  );
};

const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ children, className = '', id }) => (
  <motion.section
    id={id}
    variants={stagger}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-40px' }}
    className={`w-full max-w-full overflow-hidden ${className}`}
  >
    {children}
  </motion.section>
);

const SectionHeading: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
}> = ({ eyebrow, title, subtitle, center = false }) => (
  <motion.div variants={fadeUp} className={`mb-6 w-full ${center ? 'text-center' : ''}`}>
    <span className="inline-flex items-center rounded-full bg-jt-blue/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-jt-blue dark:bg-jt-blue/20 dark:text-jt-mint">
      {eyebrow}
    </span>
    <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-jt-ink dark:text-white sm:text-3xl md:text-4xl">
      {title}
    </h2>
    {subtitle && (
      <p
        className={`mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-jt-ink/65 dark:text-jt-steel ${
          center ? 'mx-auto' : ''
        }`}
      >
        {subtitle}
      </p>
    )}
  </motion.div>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* 3D Flip Card for Hot Deals. Purely presentational, the parent Hero owns    */
/* the shared rotation index so every slot advances together and the dot     */
/* indicators below the grid mean something.                                 */
/* ────────────────────────────────────────────────────────────────────────── */

const FlipDealCard = memo<{
  product: Product | undefined;
  onOpen: (p: Product) => void;
}>(({ product, onOpen }) => {
  if (!product) return null;

  return (
    <div className="relative h-[180px] w-full [perspective:1000px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.button
          key={product.id}
          type="button"
          onClick={() => onOpen(product)}
          initial={{ rotateY: -90, opacity: 0, scale: 0.95 }}
          animate={{ rotateY: 0, opacity: 1, scale: 1 }}
          exit={{ rotateY: 90, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="focus-ring group absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-2xl border border-jt-ink/10 bg-white text-left shadow-sm transition-colors hover:border-jt-blue/40 dark:border-white/10 dark:bg-jt-ink-soft/80"
          style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        >
          <div className="relative aspect-square w-full flex-1 overflow-hidden bg-jt-paper/60 dark:bg-white/5">
            <ProductImage
              src={product.images?.[0]}
              alt={product.name}
              icon={product.icon}
              seed={product.id}
              iconClassName="h-9 w-9 transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur">
              <Flame size={10} className="fill-white" />
              HOT
            </span>
          </div>
          <div className="p-2.5">
            <p className="line-clamp-1 text-[11px] font-semibold text-jt-ink dark:text-white">
              {product.name}
            </p>
            <p className="mt-0.5 font-tech text-xs font-bold text-jt-blue dark:text-jt-mint">
              {formatPrice(product.price)}
            </p>
          </div>
        </motion.button>
      </AnimatePresence>
    </div>
  );
});

/* ────────────────────────────────────────────────────────────────────────── */
/* Hero                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

const HERO_ROTATION = [
  'iPhones & iPads',
  'Android Phones',
  'Laptops & Tablets',
  'Gaming Setups',
  'Solar Power',
  'Expert Repairs',
];

const PROMOS = [
  {
    icon: Wrench,
    title: 'Free repair diagnosis',
    detail: 'Bring it in, we tell you the fault and the cost before any work starts.',
  },
  {
    icon: RefreshCw,
    title: 'Trade in your old device',
    detail: 'Get it valued against a new phone or laptop at either branch.',
  },
  {
    icon: Sun,
    title: 'Solar bundle deals',
    detail: 'Inverter, battery and panels, sized and installed together.',
  },
];

const Hero: React.FC<{
  onShop: () => void;
  onRepairs: () => void;
  onSearch: (q: string) => void;
  onCategory: (id: string, isService?: boolean) => void;
  categoryCounts: { id: string; name: string; shortName: string; icon: string; isService?: boolean; count: number }[];
  hotDeals: Product[];
  onOpenProduct: (p: Product) => void;
}> = ({ onShop, onRepairs, onSearch, onCategory, categoryCounts, hotDeals, onOpenProduct }) => {
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_ROTATION.length), 2400);
    return () => clearInterval(id);
  }, []);

  // Hot Deals: a shared "page" index so all 4 slots flip together and the
  // dots below them mean something, instead of four independent timers
  // drifting out of sync with nothing showing overall progress.
  const DEAL_PAGE_SIZE = 4;
  const dealPageCount = Math.max(1, Math.ceil(hotDeals.length / DEAL_PAGE_SIZE));
  const [dealPage, setDealPage] = useState(0);
  const [dealsPaused, setDealsPaused] = useState(false);

  useEffect(() => {
    if (dealPageCount <= 1 || reduceMotion || dealsPaused) return;
    const id = setInterval(() => setDealPage((p) => (p + 1) % dealPageCount), 4000);
    return () => clearInterval(id);
  }, [dealPageCount, reduceMotion, dealsPaused]);

  return (
    // pt-29/sm:pt-35 = the old pt-20/sm:pt-26 plus UrgentWhatsAppBanner's
    // height (h-9), which now pushes the fixed Navbar down by the same
    // amount on this page — see the comment on Navbar's top offsets.
    <section className="relative w-full max-w-full overflow-hidden bg-jt-paper pb-8 pt-29 text-jt-ink dark:bg-jt-ink dark:text-white sm:pb-14 sm:pt-35">
      <div className="relative mx-auto w-full max-w-7xl px-3.5 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
          {/* Main Column */}
          <div className="w-full space-y-4">
            {/* Banner Box */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-jt-blue via-jt-blue to-jt-blue-soft p-5 sm:p-8 text-white"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-jt-blue/30 blur-[90px]" />

              <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
                <div className="w-full">
                  <motion.span
                    variants={fadeUp}
                    className="inline-flex items-center gap-1.5 rounded-full border border-jt-mint/30 bg-jt-mint/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-jt-mint"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jt-mint opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-jt-mint" />
                    </span>
                    Online
                  </motion.span>

                  <motion.h1
                    variants={fadeUp}
                    className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
                  >
                    Tired of "as good as new" that isn't? So are we.{' '}
                    <span className="text-shine-invert">Your next device shouldn't be a gamble.</span>
                  </motion.h1>

                  <motion.div variants={fadeUp} className="mt-3 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                    <span className="text-jt-steel">Shop</span>
                    <span className="relative inline-flex h-6 min-w-[130px] sm:min-w-[160px] items-center overflow-hidden">
                      {HERO_ROTATION.map((word, i) => (
                        <motion.span
                          key={word}
                          initial={false}
                          animate={{ opacity: i === index ? 1 : 0, y: i === index ? 0 : 18 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="text-shine-invert absolute font-display font-semibold truncate"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </span>
                  </motion.div>

                  <motion.p variants={fadeUp} className="mt-3 text-sm sm:text-base leading-relaxed text-jt-steel">
                    {site.shortDescription}
                  </motion.p>

                  {/* Search Bar */}
                  <motion.form
                    variants={fadeUp}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (query.trim()) onSearch(query.trim());
                    }}
                    className="mt-4 flex w-full max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] p-1 pl-3 backdrop-blur focus-within:border-jt-mint/50"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-jt-mint" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search iPhone, laptop, inverter…"
                      aria-label="Search products"
                      className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="focus-ring shrink-0 rounded-full bg-jt-mint px-3.5 py-1.5 text-[11px] font-bold text-jt-ink transition-all hover:bg-white"
                    >
                      Search
                    </button>
                  </motion.form>

                  {/* CTA Buttons */}
                  <motion.div variants={fadeUp} className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={onShop}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-jt-blue shadow-md transition-all hover:bg-jt-mint hover:text-jt-ink"
                    >
                      Start shopping
                      <ShoppingArrow />
                    </button>
                    <button
                      type="button"
                      onClick={onRepairs}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Book a repair
                    </button>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                  className="mt-8 lg:mt-0"
                >
                  <HeroVisual />
                </motion.div>
              </div>
            </motion.div>

            {/* Categories Strip */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="w-full rounded-3xl border border-jt-ink/8 bg-white p-4 dark:border-white/10 dark:bg-jt-ink-soft/60"
            >
              <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-jt-ink/45 dark:text-jt-steel">
                All categories
              </p>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-3">
                {categoryCounts.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => onCategory(cat.id, cat.isService)}
                    className="focus-ring group flex flex-col items-center gap-1.5 p-1 text-center"
                  >
                    <span className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl bg-jt-blue/10 text-jt-blue transition-colors group-hover:bg-jt-blue group-hover:text-white dark:bg-jt-mint/10 dark:text-jt-mint dark:group-hover:bg-jt-mint dark:group-hover:text-jt-ink">
                      <GadgetIcon name={cat.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                    </span>
                    <span className="truncate w-full text-[10px] sm:text-[11px] font-semibold text-jt-ink dark:text-white">
                      {cat.shortName}
                    </span>
                    <span className="hidden sm:block text-[9px] text-jt-ink/45 dark:text-jt-steel">
                      {cat.isService ? 'Book' : `${cat.count} in stock`}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* 3 Promos Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PROMOS.map(({ icon: Icon, title, detail }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  className="rounded-2xl border border-jt-ink/8 bg-white p-4 dark:border-white/10 dark:bg-jt-ink-soft/60"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-jt-blue/10 text-jt-blue dark:bg-jt-mint/10 dark:text-jt-mint">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-2 font-display text-xs font-bold text-jt-ink dark:text-white">{title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-jt-ink/60 dark:text-jt-steel">{detail}</p>
                </motion.div>
              ))}
            </div>

            {/* Sale Band Banner */}
            <motion.button
              type="button"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              onClick={onShop}
              className="focus-ring group flex w-full flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl bg-gradient-to-br from-jt-blue to-jt-blue-deep p-5 text-left text-white"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Selling out this week</p>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold">The gear everyone's rushing for</h2>
                <p className="mt-1 text-xs text-white/75">
                  Stock moves fast on these. Grab yours before the next customer does.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-jt-blue transition-transform group-hover:translate-x-1">
                Grab the deals
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </motion.button>
          </div>

          {/* Sidebar: Hot Deals */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            onMouseEnter={() => setDealsPaused(true)}
            onMouseLeave={() => setDealsPaused(false)}
            className="w-full rounded-3xl border border-jt-ink/8 bg-white p-4 dark:border-white/10 dark:bg-jt-ink-soft/60 lg:sticky lg:top-24"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-jt-blue dark:text-jt-mint">
                <Flame className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                Hot deals
              </span>
            </div>

            {/* 4 Interactive 3D Flip Deal Slots, all flipping to the same page */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {[0, 1, 2, 3].map((slot) => (
                <FlipDealCard
                  key={slot}
                  product={hotDeals[dealPage * DEAL_PAGE_SIZE + slot]}
                  onOpen={onOpenProduct}
                />
              ))}
            </div>

            {dealPageCount > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {Array.from({ length: dealPageCount }).map((_, page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setDealPage(page)}
                    aria-label={`Show hot deals page ${page + 1}`}
                    aria-current={page === dealPage}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      page === dealPage
                        ? 'w-5 bg-jt-blue dark:bg-jt-mint'
                        : 'w-1.5 bg-jt-ink/15 hover:bg-jt-ink/30 dark:bg-white/15 dark:hover:bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onShop}
              className="focus-ring mt-3 w-full rounded-full border border-jt-ink/15 py-2 text-[11px] font-bold uppercase tracking-wider text-jt-ink transition-colors hover:border-jt-blue hover:text-jt-blue dark:border-white/15 dark:text-white dark:hover:border-jt-mint dark:hover:text-jt-mint"
            >
              See all
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */
/* Main view                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

export const HomeView: React.FC = () => {
  const { products, setCurrentView, setActiveCategory, setActiveProductId, submitSearch } =
    useAppContext();

  const openProduct = useCallback(
    (p: Product) => {
      setActiveProductId(p.id);
      setCurrentView('product');
      window.scrollTo(0, 0);
    },
    [setActiveProductId, setCurrentView],
  );

  const openCategory = useCallback(
    (id: string, isService?: boolean) => {
      if (isService) {
        setCurrentView('services');
      } else {
        setActiveCategory(id);
        setCurrentView('category');
      }
      window.scrollTo(0, 0);
    },
    [setActiveCategory, setCurrentView],
  );

  const { available, featured, hiddenTrendingCount, categoryCounts, hotDeals, productShots } = useMemo(() => {
    // The homepage's auto-rotating promo rails (Hot Deals, Trending, the
    // category "N in stock" counts) all draw from what a shopper can
    // actually buy right now, an item marked out of stock is left out
    // rather than advertised somewhere it can't be checked out from.
    const available = products.filter((p) => p.inStock !== false);
    const trending = available.filter((p) => p.isTrending);
    const hot = available.filter((p) => p.isHot);
    // Prefer a curated set once there is enough of it to fill both dot
    // pages, otherwise fall back a step so the rail is never sparse.
    const dealsPool = hot.length >= 4 ? hot : trending.length >= 4 ? trending : available;
    const counts = marketplaceCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      shortName: cat.shortName,
      icon: cat.icon,
      isService: cat.isService,
      count: products.filter((p) => p.category === cat.name && p.inStock !== false).length,
    }));
    return {
      available,
      featured: (trending.length > 0 ? trending : available).slice(0, 8),
      hiddenTrendingCount: Math.max(available.length - 8, 0),
      categoryCounts: counts,
      // Capped at 8, two dot-pages of four, rather than the whole catalog.
      hotDeals: dealsPool.slice(0, 8),
      // The "Shop by category" banner's sliding photo, real uploads only,
      // one per product so the same item doesn't get two turns before
      // everything else has had one.
      productShots: available
        .filter((p) => p.images && p.images.length > 0)
        .map((p) => ({ src: p.images[0], alt: p.name })),
    };
  }, [products]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Hero
        onShop={() => {
          setCurrentView('categories');
          window.scrollTo(0, 0);
        }}
        onRepairs={() => {
          setCurrentView('services');
          window.scrollTo(0, 0);
        }}
        onSearch={submitSearch}
        onCategory={openCategory}
        categoryCounts={categoryCounts}
        hotDeals={hotDeals}
        onOpenProduct={openProduct}
      />

      {/* ── Shop by Category banner ──
          One big framed banner rather than eight small tiles: a sliding,
          swipeable product photo on one side (same picture pool and slide
          mechanics as the header art) and the pitch on the other, so it
          reads as a single confident statement instead of a wall of
          near-identical little cards. The image half and the text half are
          deliberately separate elements (not one nested inside the other),
          so a drag on the photo can never also fire the button's page
          navigation. */}
      <Section className="bg-white py-8 dark:bg-jt-ink-soft/30 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-3.5 sm:px-6">
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 overflow-hidden rounded-3xl border border-jt-ink/8 bg-jt-paper shadow-sm dark:border-white/10 dark:bg-jt-ink-soft/60 lg:grid-cols-2"
          >
            <CategoryShowcase items={productShots} />

            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setCurrentView('categories');
                window.scrollTo(0, 0);
              }}
              className="focus-ring group relative flex flex-col justify-center p-6 text-left sm:p-10"
            >
              <span className="inline-flex w-fit items-center rounded-full bg-jt-blue/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-jt-blue dark:bg-jt-blue/20 dark:text-jt-mint">
                8 departments, 1 store
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-jt-ink dark:text-white sm:text-3xl md:text-4xl">
                Shop by <span className="text-shine">category</span>
              </h2>
              <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-jt-ink/65 dark:text-jt-steel">
                Whatever you're after, it's in here somewhere. Every item tested, every purchase backed by
                warranty.
              </p>
              <p className="mt-2 max-w-md font-display text-sm sm:text-base font-bold text-jt-blue dark:text-jt-mint">
                New stock lands weekly. Come see what just came in.
              </p>

              <span className="mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-jt-blue text-white shadow-md transition-transform group-hover:translate-x-1 dark:bg-jt-mint dark:text-jt-ink">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </motion.div>
        </div>
      </Section>

      {/* ── Trending Products ── */}
      {featured.length > 0 && (
        <Section className="py-8 sm:py-14">
          <div className="mx-auto w-full max-w-7xl px-3.5 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <SectionHeading
                eyebrow="Trending"
                title={
                  <>
                    What everyone is <span className="text-shine">asking for</span>
                  </>
                }
                subtitle="The flagship phones and laptops customers keep coming back to buy again."
              />
              <motion.button
                type="button"
                variants={fadeUp}
                onClick={() => {
                  setActiveCategory(null);
                  setCurrentView('categories');
                  window.scrollTo(0, 0);
                }}
                className="focus-ring mb-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-jt-blue hover:underline dark:text-jt-mint"
              >
                View all products
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}

              {hiddenTrendingCount > 0 && (
                <motion.button
                  type="button"
                  variants={fadeUp}
                  onClick={() => {
                    setActiveCategory(null);
                    setCurrentView('categories');
                    window.scrollTo(0, 0);
                  }}
                  className="focus-ring group flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-jt-blue/25 bg-jt-blue/5 p-4 text-center transition-all hover:bg-jt-blue/10 dark:border-jt-mint/25 dark:bg-jt-mint/5"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-jt-blue/10 text-jt-blue dark:bg-jt-mint/15 dark:text-jt-mint">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  <span className="font-display text-xs sm:text-sm font-bold text-jt-ink dark:text-white">
                    See {hiddenTrendingCount} more
                  </span>
                </motion.button>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ── Repairs Section ── */}
      <Section className="px-3.5 pb-8 sm:px-6 sm:pb-14">
        <motion.div
          variants={fadeUp}
          className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-jt-blue p-6 text-white sm:p-10"
        >
          <div className="pointer-events-none absolute inset-0 circuit-grid opacity-40" />

          <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <motion.span
                className="inline-flex items-center gap-1.5 rounded-full bg-jt-lime/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-jt-lime"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(216, 255, 56, 0)',
                    '0 0 0 4px rgba(216, 255, 56, 0.2)',
                    '0 0 0 0 rgba(216, 255, 56, 0)',
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="relative inline-flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D8FF38]/60" />
                  <Wrench className="relative h-3 w-3 animate-pulse" />
                </span>
                Repairs &amp; maintenance
              </motion.span>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
                Cracked screen? Dead battery?
                <br />
                <span className="text-gradient-lime">We diagnose it free.</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-jt-steel">
                Phones, laptops, tablets, inverters and solar systems. Tell us what is wrong, and we will quote you before we touch anything.
              </p>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView('services');
                    window.scrollTo(0, 0);
                  }}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-jt-lime px-5 py-2.5 text-xs font-bold text-jt-ink transition-all hover:bg-white"
                >
                  <TurningWrench />
                  Book a repair
                </button>
                <a
                  href={waLink('Hello Joe Tech, I need a repair.')}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/10"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="grid gap-2">
              {[
                { label: 'Free diagnosis', value: 'Always' },
                { label: 'Most repairs', value: 'Same day' },
                { label: 'Repair warranty', value: '2 weeks' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs backdrop-blur"
                >
                  <span className="text-jt-steel">{row.label}</span>
                  <span className="font-display font-bold text-jt-lime">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── Branches ── */}
      <Section className="bg-white py-8 dark:bg-jt-ink-soft/30 sm:py-14">
        <div className="mx-auto w-full max-w-7xl px-3.5 sm:px-6">
          <SectionHeading
            center
            eyebrow="Visit us"
            title={
              <>
                Two branches, <span className="text-shine">real people</span>
              </>
            }
            subtitle="Come and test the device before you pay. Or call ahead and we will have it ready."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {branches.map((branch) => (
              <motion.div
                key={branch.id}
                variants={fadeUp}
                className="rounded-2xl border border-jt-ink/8 bg-jt-paper p-5 transition-all dark:border-white/10 dark:bg-jt-ink/50"
              >
                <div className="flex items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-jt-blue text-white shadow-md">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-bold text-jt-ink dark:text-white">
                      {branch.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-jt-ink/65 dark:text-jt-steel">
                      {branch.street}, {branch.city}, {branch.state}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-jt-ink/55 dark:text-jt-steel">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {branch.hours}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`tel:${branch.phone}`}
                        className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-jt-blue px-3.5 py-1.5 text-[11px] font-semibold text-white hover:bg-jt-blue-soft"
                      >
                        <Phone className="h-3 w-3" />
                        {branch.phone}
                      </a>
                      <a
                        href={waLink(
                          `Hello Joe Tech, I would like to ask about the ${branch.city} branch.`,
                          branch.phone,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-jt-ink/12 px-3.5 py-1.5 text-[11px] font-semibold text-jt-ink hover:bg-jt-lime/10 dark:border-white/15 dark:text-white"
                      >
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-center text-xs text-jt-ink/55 dark:text-jt-steel"
          >
            Prefer email?{' '}
            <a
              href={`mailto:${site.email}`}
              className="font-bold text-jt-blue hover:underline dark:text-jt-mint"
            >
              {site.email}
            </a>{' '}
            · Call{' '}
            <a href={`tel:${contacts.primary}`} className="font-bold hover:underline">
              {contacts.primary}
            </a>
          </motion.p>
        </div>
      </Section>

      {/* ── Testimonials ── */}
      <Section className="bg-white py-8 dark:bg-jt-ink-soft/30 sm:py-14 sm:pb-20">
        <div className="mx-auto w-full max-w-7xl px-3.5 sm:px-6">
          <SectionHeading
            center
            eyebrow="Real customers"
            title={
              <>
                What people are <span className="text-shine">saying</span>
              </>
            }
            subtitle="Real buyers, real products, unedited beyond fixing typos. Swipe through."
          />

          <TestimonialCarousel items={testimonials} />
        </div>
      </Section>

    </div>
  );
};