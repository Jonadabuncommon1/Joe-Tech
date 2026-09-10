import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHome } from './DashboardHome';
import { ProductsManager } from './ProductsManager';
import { CategoriesManager } from './CategoriesManager';
import { MediaManager } from './MediaManager';
import { Settings } from './Settings';
import { Menu, X } from 'lucide-react';
import { LogoLockup } from '../brand/Logo';

export type AdminView = 'dashboard' | 'products' | 'categories' | 'media' | 'settings';

export const AdminLayout = () => {
  const [currentView, setCurrentView] = useState<AdminView>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#admin/')) {
      return hash.replace('#admin/', '') as AdminView;
    }
    return 'dashboard';
  });
  
  // On a phone the sidebar is an overlay, so starting it open buried the page
  // under it on every visit. Desktop keeps it open, since there it pushes the
  // content aside rather than covering it.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 768px)').matches,
  );

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#admin/')) {
        setCurrentView(hash.replace('#admin/', '') as AdminView);
      } else if (hash === '#admin') {
        setCurrentView('dashboard');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = useCallback((view: AdminView) => {
    window.location.hash = `#admin/${view}`;
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'products':
        return <ProductsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'media':
        return <MediaManager />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
      default:
        return <DashboardHome onChangeView={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#000000] text-gray-900 dark:text-gray-100 flex font-sans z-50 transition-colors duration-500">
      {/* Desktop reopen button. On phones the sticky bar below carries it, so
          this one would only float over the content. */}
      {!sidebarOpen && (
        <button
          className="fixed top-6 left-4 z-50 hidden p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg shadow-sm text-gray-700 dark:text-gray-300 hover:brand-text transition-colors md:block"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Tapping outside closes the sidebar on phones, where it sits over the
          page rather than beside it. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 max-w-[82vw] bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/10 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar currentView={currentView} onChangeView={navigateTo} closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className={`min-w-0 flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        {/* Phone header: gives the menu a permanent home instead of a button
            floating over whatever heading happens to be underneath it. */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden dark:border-white/10 dark:bg-[#0a0a0a]/95">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="-ml-1 p-1.5 text-gray-700 dark:text-gray-300"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <LogoLockup className="h-6" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
            Admin
          </span>
        </div>

        <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen relative">
          {renderView()}
        </div>
      </div>
    </div>
  );
};
