import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useAppContext } from './store/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppCart } from './components/WhatsAppCart';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { UrgentWhatsAppBanner } from './components/home/UrgentWhatsAppBanner';
import { Toaster } from 'react-hot-toast';
import { SplashScreen } from './components/SplashScreen';

const HomeView = React.lazy(() => import('./components/home/HomeView').then((module) => ({ default: module.HomeView })));
const ProductDetailView = React.lazy(() => import('./components/shop/ProductDetailView').then((module) => ({ default: module.ProductDetailView })));
const WishlistView = React.lazy(() => import('./components/shop/WishlistView').then((module) => ({ default: module.WishlistView })));
const AboutView = React.lazy(() => import('./components/home/AboutView').then((module) => ({ default: module.AboutView })));
const ContactView = React.lazy(() => import('./components/home/ContactView').then((module) => ({ default: module.ContactView })));
const TermsView = React.lazy(() => import('./components/home/TermsView').then((module) => ({ default: module.TermsView })));
const PrivacyView = React.lazy(() => import('./components/home/PrivacyView').then((module) => ({ default: module.PrivacyView })));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin').then((module) => ({ default: module.AdminLogin })));
const CategoriesView = React.lazy(() => import('./components/shop/CategoriesView').then((module) => ({ default: module.CategoriesView })));
const CategoryView = React.lazy(() => import('./components/shop/CategoryView').then((module) => ({ default: module.CategoryView })));
const AuthView = React.lazy(() => import('./components/auth/AuthView').then((module) => ({ default: module.AuthView })));
const ChatWidget = React.lazy(() => import('./components/chat/ChatModal').then((module) => ({ default: module.ChatWidget })));
const ServicesView = React.lazy(() => import('./components/home/ServicesView').then((module) => ({ default: module.ServicesView })));
const CheckoutView = React.lazy(() => import('./components/shop/CheckoutView').then((module) => ({ default: module.CheckoutView })));

const LoadingView = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3626a7]" />
  </div>
);

function AppContent() {
  const { currentView, isAdminAuthenticated, loadingAuth } = useAppContext();

  // One row per visit, fired once on mount regardless of how currentView
  // changes afterwards, not once per in-app navigation, this is a "did
  // someone land on the site" log, not a full pageview-by-pageview
  // tracker. Reaches api/track-visit.ts, a real server, since that's the
  // only place a visitor's actual IP address can be read from at all, no
  // client-side script can see it. Fire-and-forget, deliberately not
  // awaited: a slow or failed request here must never delay or break the
  // page for a real visitor.
  React.useEffect(() => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: currentView, referrer: document.referrer }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (currentView === 'admin') {
    if (loadingAuth) return <LoadingView />;
    return (
      <React.Suspense fallback={<LoadingView />}>
        {isAdminAuthenticated ? <AdminLayout /> : <AdminLogin />}
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-transparent dark:bg-black overflow-x-hidden selection:bg-[#3626a7]/10 transition-colors duration-500 relative">
      {currentView === 'home' && <UrgentWhatsAppBanner />}
      {currentView !== 'auth' && <Navbar />}
      <main className="flex-grow w-full">
        <React.Suspense fallback={<LoadingView />}>
          {currentView === 'home' && <HomeView />}
          {currentView === 'shop' && <CategoryView />}
          {currentView === 'categories' && <CategoriesView />}
          {currentView === 'category' && <CategoryView />}
          {currentView === 'product' && <ProductDetailView />}
          {currentView === 'wishlist' && <WishlistView />}
          {currentView === 'about' && <AboutView />}
          {currentView === 'contact' && <ContactView />}
          {currentView === 'services' && <ServicesView />}
          {currentView === 'checkout' && <CheckoutView />}
          {currentView === 'terms' && <TermsView />}
          {currentView === 'privacy' && <PrivacyView />}
          {currentView === 'auth' && <AuthView />}
        </React.Suspense>
      </main>
      {currentView === 'home' && <Footer />}
      {currentView !== 'auth' && <WhatsAppCart />}
      {currentView === 'home' && (
        <>
          <FloatingWhatsApp />
          <React.Suspense fallback={null}><ChatWidget /></React.Suspense>
        </>
      )}
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = React.useState(true);
  const hideSplash = React.useCallback(() => setShowSplash(false), []);

  return (
    <AppProvider>
      {showSplash && <SplashScreen onComplete={hideSplash} />}
      <AppContent />
      <Toaster position="top-right" />
      <Analytics />
    </AppProvider>
  );
}

export { App };
export default App;