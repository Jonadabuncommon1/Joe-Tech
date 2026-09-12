import React from 'react';
import { Truck } from 'lucide-react';

/**
 * A slim announcement strip, stacked directly above UrgentWhatsAppBanner by
 * App.tsx (both sit inside one shared `sticky top-0` wrapper there, rather
 * than each being sticky on its own, so they scroll as a single pinned
 * unit). Home page only, matching where that banner lives.
 *
 * Same fixed `h-9` sizing rule applies here as on that banner: Navbar.tsx's
 * home-only top offset is hand-tuned to sit just below both of these
 * stacked strips, so if this banner's height ever changes, that offset
 * needs to change with it too.
 */
export const FreeDeliveryBanner: React.FC = () => (
  <div className="flex h-9 w-full items-center justify-center gap-x-2 bg-jt-blue px-3 text-white">
    <Truck className="h-3.5 w-3.5 shrink-0" />
    <span className="text-[11px] font-bold uppercase tracking-wide sm:text-sm sm:tracking-wider">
      Free delivery at your location
    </span>
  </div>
);
