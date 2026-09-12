import React from 'react';
import { MessageCircle } from 'lucide-react';
import { contacts, waLink } from '../../config/site';

/** '08133727813' -> '0813 372 7813', so it reads easily at a glance. */
const formatPhone = (digits: string) =>
  digits.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');

/**
 * A slim, always-visible strip above the Navbar so an urgent visitor sees the
 * WhatsApp option before anything else on the page, with the number spelled
 * out for anyone who'd rather dial than tap a link. Homepage only, matching
 * where the other WhatsApp entry points (FloatingWhatsApp, ChatWidget)
 * already live.
 *
 * App.tsx renders this directly under FreeDeliveryBanner, both inside one
 * shared `sticky top-0 z-40` wrapper (not sticky on its own here), so the
 * two scroll together as a single pinned unit.
 *
 * The Navbar pill is always `fixed` a few pixels from the top, on every page,
 * scrolled or not — a banner in normal document flow does not push it down.
 * So this has a single fixed height (`h-9`, never a responsive one) rather
 * than letting its content wrap, and Navbar.tsx adds exactly that height,
 * plus FreeDeliveryBanner's, to its own top offset whenever
 * `currentView === 'home'`. If either banner's height ever changes, that
 * offset needs to change with it.
 */
export const UrgentWhatsAppBanner: React.FC = () => (
  <div className="flex h-9 w-full items-center justify-center gap-x-2 overflow-x-auto whitespace-nowrap bg-jt-ink px-3 text-white sm:gap-x-3">
    <MessageCircle className="h-3.5 w-3.5 shrink-0 fill-[#25D366] text-jt-ink" />
    <span className="text-[11px] font-semibold sm:text-sm">
      <span className="hidden sm:inline">Need something urgently? </span>Chat us on WhatsApp
    </span>
    <a
      href={waLink('Hello Joe Tech, I need urgent help.')}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 rounded-full bg-[#25D366] px-3 py-1 text-[11px] font-bold text-jt-ink transition-colors hover:bg-[#1ebd5a] sm:text-sm"
    >
      Chat Now
    </a>
    <a
      href={`tel:+234${contacts.primary.slice(1)}`}
      className="shrink-0 text-[11px] text-white/70 underline-offset-2 hover:text-white hover:underline sm:text-sm"
    >
      {formatPhone(contacts.primary)}
    </a>
  </div>
);
