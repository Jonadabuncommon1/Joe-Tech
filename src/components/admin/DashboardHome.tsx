import React, { useMemo, useEffect, useState, useRef } from 'react';
import { ShoppingBag, Package, TrendingUp, Layers, Bell, BellOff, Users } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { formatPrice, getDisplayPrice, hasVariants } from '../../data';
import { AdminView } from './AdminLayout';
import { subscribeToVisitors, requestNotificationPermission, VisitorLog } from '../../lib/visitorTracking';
import toast from 'react-hot-toast';
import { auth } from '../../lib/firebase';
import { signInAnonymously } from 'firebase/auth';

export const DashboardHome = ({ onChangeView }: { onChangeView: (view: AdminView) => void }) => {
  const { products } = useAppContext();
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isNewVisitor, setIsNewVisitor] = useState(false);
  const initializedRef = useRef(false);
  const prevCountRef = useRef(0);

  // Sign admin in anonymously to Firebase so Firestore rules allow reading visitor logs
  useEffect(() => {
    if (auth && !auth.currentUser) {
      signInAnonymously(auth).catch(() => {/* silent */});
    }
  }, []);

  // Subscribe to live visitor feed from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToVisitors((incoming) => {
      if (!initializedRef.current) {
        // First snapshot, set data without toasting (these are existing records)
        initializedRef.current = true;
        prevCountRef.current = incoming.length;
        setVisitors(incoming);
        return;
      }
      // Subsequent updates, new visitor just signed in
      if (incoming.length > prevCountRef.current) {
        const newest = incoming[0];
        toast(`🛍️ ${newest.name} just signed in!`, {
          icon: '👤',
          duration: 5000,
          style: { background: '#3626a7', color: '#fff', fontWeight: 'bold' },
        });
        setIsNewVisitor(true);
        setTimeout(() => setIsNewVisitor(false), 3000);
      }
      prevCountRef.current = incoming.length;
      setVisitors(incoming);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const enableNotifications = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        setNotificationsEnabled(true);
      }
    };
    // Automatically try to enable notifications without requiring a button click
    enableNotifications();
  }, []);

  const overview = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const categories = new Set(products.map((p) => p.category));
    const trending = products.filter((p) => p.isTrending).length;
    const newItems = products.filter((p) => p.isNew).length;
    return { totalValue, categories: categories.size, trending, newItems };
  }, [products]);

  const stats = [
    { title: 'Active Products', value: String(products.length), icon: ShoppingBag, sub: 'Live catalog count' },
    { title: 'Catalog Value', value: formatPrice(overview.totalValue), icon: TrendingUp, sub: 'Sum of listed prices' },
    { title: 'Categories', value: String(overview.categories), icon: Layers, sub: 'Unique product categories' },
    { title: 'New Listings', value: String(overview.newItems), icon: Package, sub: `${overview.trending} trending` },
  ];

  const recent = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Platform Overview</h1>
        <p className="text-gray-600 dark:text-gray-300">Analytics update instantly when products are added, edited, or removed.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#0a0a0a] p-4 sm:p-6 rounded-2xl border dark:border-white/10 shadow-sm transition-colors duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#ece9fa] dark:bg-[#3626a7]/20 rounded-xl">
                <stat.icon size={20} className="brand-text" />
              </div>
            </div>
            <h3 className="text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-[#000000] dark:text-gray-800 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-800 dark:text-white mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── LIVE VISITOR FEED ── */}
      <div className={`bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border shadow-sm transition-all duration-500 ${isNewVisitor ? 'border-[#3626a7] shadow-[#3626a7]/20 shadow-lg' : 'dark:border-white/10'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Users size={22} className="brand-text" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Live Visitors
                <span className="text-[10px] font-black uppercase tracking-widest bg-green-500 text-gray-800 dark:text-white px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{visitors.length} sign-in{visitors.length !== 1 ? 's' : ''} recorded</p>
            </div>
          </div>
        </div>

        {visitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500 dark:text-gray-400">
            <Users size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Waiting for visitors...</p>
            <p className="text-xs mt-1">When a customer signs in, they will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-700 dark:text-gray-300 border-b dark:border-white/10">
                <tr>
                  <th className="py-3 pr-4">Visitor</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Signed In</th>
                  <th className="hidden py-3 pr-4 sm:table-cell">Device</th>
                  <th className="hidden py-3 lg:table-cell">Browser</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`border-b dark:border-white/10 last:border-0 transition-colors ${
                      i === 0 && isNewVisitor
                        ? 'bg-green-50 dark:bg-green-900/10'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3 pr-4 font-bold brand-text">
                      {i === 0 && (
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                      )}
                      {v.name}
                    </td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{v.email}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                      {v.signedInAt
                        ? new Date((v.signedInAt as any).toDate()).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
                        : 'Just now'}
                    </td>
                    <td className="hidden py-3 pr-4 text-gray-600 dark:text-gray-400 sm:table-cell">{v.device}</td>
                    <td className="hidden py-3 text-gray-600 dark:text-gray-400 lg:table-cell">{v.browser}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── UPLOAD HISTORY ── */}
      <div className="bg-white dark:bg-[#0a0a0a] p-4 sm:p-6 rounded-2xl border dark:border-white/10 shadow-sm transition-colors duration-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Upload History</h2>
          <button
            type="button"
            onClick={() => onChangeView('products')}
            className="text-sm font-semibold brand-text hover:text-[#281c7d]"
          >
            Manage products →
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-sm">No products yet. Add your first listing from Products.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-700 dark:text-gray-200 border-b dark:border-white/10">
                <tr>
                  <th className="py-3 pr-4">Product</th>
                  <th className="hidden py-3 pr-4 sm:table-cell">Category</th>
                  <th className="hidden py-3 pr-4 lg:table-cell">Upload Date &amp; Time</th>
                  <th className="py-3 pr-4">Price</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id} className="border-b dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 font-bold text-[#281c7d]">{p.name}</td>
                    <td className="hidden py-3 pr-4 text-gray-800 dark:text-gray-200 sm:table-cell">{p.category}</td>
                    <td className="hidden py-3 pr-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap lg:table-cell">
                      {p.created_at ? new Date(p.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Legacy Upload'}
                    </td>
                    <td className="py-3 pr-4 font-bold text-[#000000] dark:text-gray-800 dark:text-white">
                      {hasVariants(p) && <span className="mr-1 text-[10px] font-semibold uppercase text-gray-400">From</span>}
                      {formatPrice(getDisplayPrice(p))}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${
                          p.inStock === false
                            ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800/30'
                            : 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/30'
                        }`}
                      >
                        {p.inStock === false ? 'Out of Stock' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
