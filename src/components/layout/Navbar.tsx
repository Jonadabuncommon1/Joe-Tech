import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Menu, X, Search, LogOut, LogIn, ArrowLeft, User, Wrench, Grid, Layers, ShieldCheck, Mail } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { useAppContext } from '../../store/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogoLockup } from '../brand/Logo';
import toast from 'react-hot-toast';

const getInitials = (u: FirebaseUser) => {
  const source = u.displayName?.trim() || u.email || '';
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
};

const UserAvatar = ({ user, size = 32 }: { user: FirebaseUser; size?: number }) => (
  user.photoURL ? (
    <img
      src={user.photoURL}
      alt={user.displayName || 'Your profile picture'}
      referrerPolicy="no-referrer"
      className="rounded-full object-cover border border-white/40 dark:border-white/20 flex-shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="rounded-full bg-gradient-to-br from-jt-blue to-jt-mint flex items-center justify-center font-bold flex-shrink-0 text-white shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {getInitials(user)}
    </span>
  )
);

export const Navbar = () => {
  const { cart, wishlist, currentView, setCurrentView, setCartOpen, submitSearch, user, goBack } = useAppContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleNavClick = (view: any) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo(0, 0);
  };

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (auth) {
      await signOut(auth);
      toast.success('Successfully signed out');
    }
  };

  return (
    <>
      <nav
        // The pill floats `fixed` near the very top on every page, so on home
        // — where UrgentWhatsAppBanner occupies that space instead — its top
        // offset needs the banner's exact height (h-9 = 2.25rem) added, or
        // the two sit on top of each other regardless of scroll position.
        className={`fixed left-0 right-0 mx-auto z-50 transition-all duration-300 bg-jt-paper/90 dark:bg-jt-ink/90 backdrop-blur-xl border border-jt-ink/10 dark:border-white/10 rounded-2xl sm:rounded-full ${
          isScrolled
            ? `${currentView === 'home' ? 'top-[2.75rem] sm:top-[3.25rem]' : 'top-2 sm:top-4'} shadow-xl py-2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-7xl`
            : `${currentView === 'home' ? 'top-12 sm:top-[3.75rem]' : 'top-3 sm:top-6'} shadow-lg py-2.5 sm:py-3.5 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-7xl`
        }`}
      >
        <div className="w-full px-3.5 sm:px-6 flex justify-between items-center max-w-full">
          {/* Left: Back Button & Logo Brand */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {currentView !== 'home' && (
              <button 
                type="button"
                onClick={() => {
                  goBack();
                  window.scrollTo(0, 0);
                }} 
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-700"
                title="Go Back"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div 
              className="flex items-center cursor-pointer group relative" 
              onClick={() => handleNavClick('home')}
            >
              <LogoLockup className="h-8 transition-transform duration-300 group-hover:scale-105 sm:h-9 md:h-10" />
            </div>
          </div>

          {/* Middle: Links & Search */}
          <div className="hidden lg:flex items-center justify-center flex-1 space-x-6 px-8">
            {[
              { label: 'Home', view: 'home' as const },
              { label: 'Product Categories', view: 'categories' as const },
              { label: 'Repairs', view: 'services' as const },
              { label: 'About', view: 'about' as const },
              {
                label: `Wishlist${wishlist.length > 0 ? ` (${wishlist.length})` : ''}`,
                view: 'wishlist' as const,
              },
              { label: 'Support', view: 'contact' as const },
            ].map(({ label, view }) => (
              <button
                type="button"
                key={view}
                onClick={() => handleNavClick(view)}
                className={`focus-ring group relative text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  currentView === view
                    ? 'text-jt-blue dark:text-jt-mint'
                    : 'text-jt-ink/80 hover:text-jt-blue dark:text-gray-300 dark:hover:text-jt-mint'
                }`}
              >
                {label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-[2px] bg-gradient-to-r from-jt-blue to-jt-mint transition-all duration-300 ${
                    currentView === view ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            ))}

            {/* Search Input */}
            <form onSubmit={(e) => { e.preventDefault(); if (navSearch.trim()) submitSearch(navSearch); }} className="relative flex items-center ml-2">
              <input 
                type="text" 
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search..." 
                className="w-28 xl:w-32 h-6 pl-6 pr-2 text-[10px] bg-gray-100 dark:bg-gray-800 rounded-full outline-none focus:ring-1 focus:ring-jt-blue transition-all"
              />
              <Search size={10} className="absolute left-2 text-gray-400 dark:text-white/60" />
            </form>
          </div>

          {/* Right: Cart, User Profile & Mobile Drawer */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative group flex items-center justify-center hover:scale-[1.05] transition-transform duration-200 p-1"
              title="Your Cart"
            >
              <ShoppingBag size={20} strokeWidth={2.25} className="text-gray-700 dark:text-gray-300 group-hover:text-jt-blue dark:group-hover:text-jt-mint transition-colors" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E5484D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Desktop User Avatar / Dropdown */}
            <div className="hidden lg:block relative" ref={dropdownRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((v) => !v)}
                  className="focus-ring flex items-center gap-2 rounded-full p-0.5 transition-transform hover:scale-105"
                  title="Account Menu"
                >
                  <UserAvatar user={user} size={32} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentView('auth')}
                  className="btn-primary px-4 py-2 flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-md"
                >
                  <User size={15} strokeWidth={2.5} />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 rounded-2xl border border-jt-ink/10 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-jt-ink-soft/95"
                  >
                    {/* User Header */}
                    <div className="flex items-center gap-3 border-b border-jt-ink/8 pb-3 px-2 dark:border-white/8">
                      <UserAvatar user={user} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-jt-ink dark:text-white">
                          {user.displayName || 'Joe Tech Member'}
                        </p>
                        <p className="truncate text-[11px] text-jt-ink/55 dark:text-jt-steel">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Menu Navigation Items */}
                    <div className="mt-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => handleNavClick('home')}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-jt-ink/80 transition-colors hover:bg-jt-blue/10 hover:text-jt-blue dark:text-jt-steel dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <Layers size={14} />
                        <span>Home</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('categories')}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-jt-ink/80 transition-colors hover:bg-jt-blue/10 hover:text-jt-blue dark:text-jt-steel dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <Grid size={14} />
                        <span>Categories</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('services')}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-jt-ink/80 transition-colors hover:bg-jt-blue/10 hover:text-jt-blue dark:text-jt-steel dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <Wrench size={14} />
                        <span>Repairs &amp; Maintenance</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavClick('wishlist')}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-jt-ink/80 transition-colors hover:bg-jt-blue/10 hover:text-jt-blue dark:text-jt-steel dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <Heart size={14} />
                        <span>Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ''}</span>
                      </button>
                    </div>

                    {/* Sign Out Action */}
                    <div className="mt-2 border-t border-jt-ink/8 pt-2 dark:border-white/8">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-gray-900 dark:text-white p-1 flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              <Menu size={24} className="text-jt-blue dark:text-jt-mint" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 border-b border-jt-ink/10 bg-jt-paper/98 backdrop-blur-2xl dark:border-white/10 dark:bg-jt-ink/98 max-w-full overflow-hidden"
          >
            <div className="p-5 flex flex-col h-full text-gray-900 dark:text-gray-100 max-w-full">
              {/* Drawer Top */}
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleNavClick('home')}
                >
                  <LogoLockup className="h-8 md:h-9" />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                  aria-label="Close Menu"
                >
                  <X size={24} className="text-jt-blue dark:text-jt-mint" strokeWidth={2.5} />
                </button>
              </div>

              {/* User info banner inside mobile drawer */}
              {user ? (
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-jt-blue/5 dark:bg-white/5 p-3.5 border border-jt-blue/10 dark:border-white/10">
                  <UserAvatar user={user} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-jt-ink dark:text-white">
                      {user.displayName || 'Joe Tech Member'}
                    </p>
                    <p className="truncate text-[11px] text-jt-ink/55 dark:text-jt-steel">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('auth');
                  }}
                  className="mt-4 w-full rounded-2xl bg-jt-blue p-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-md"
                >
                  Sign In / Create Account
                </button>
              )}
              
              {/* Navigation links list */}
              <div className="flex flex-col space-y-4 mt-6 flex-grow justify-start items-start px-2 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => handleNavClick('home')}
                  className="text-left text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-jt-blue dark:hover:text-jt-mint transition-colors py-1.5 w-full"
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('categories')}
                  className="text-left text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-jt-blue dark:hover:text-jt-mint transition-colors py-1.5 w-full"
                >
                  Product Categories
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('services')}
                  className="text-left text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-jt-blue dark:hover:text-jt-mint transition-colors py-1.5 w-full"
                >
                  Repairs &amp; Maintenance
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCartOpen(true);
                  }}
                  className="text-left text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-jt-blue dark:hover:text-jt-mint transition-colors py-1.5 w-full"
                >
                  Your Cart {cartItemsCount > 0 ? `(${cartItemsCount})` : ''}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('wishlist')}
                  className="text-left text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-jt-blue dark:hover:text-jt-mint transition-colors py-1.5 w-full"
                >
                  Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ''}
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('about')}
                  className="text-left text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-jt-blue dark:hover:text-jt-mint transition-colors py-1.5 w-full"
                >
                  About Joe Tech
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('contact')}
                  className="text-left text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:text-jt-blue dark:hover:text-jt-mint transition-colors py-1.5 w-full"
                >
                  Support &amp; Contact
                </button>
              </div>

              {/* Sign out button at bottom of mobile drawer */}
              {user && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 pb-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/20"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};