import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product, CartItem, ViewState } from '../types';
import { fetchProductsFromDB, getInitialProductsFromStorage, addProductToDB, updateProductInDB, deleteProductFromDB, createProductId } from './productStorage';
import { supabase } from '../lib/supabase';
import { searchProducts } from '../utils/searchProducts';
import { auth, firebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AppContextProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  goBack: () => void;
  activeProductId: string | null;
  setActiveProductId: (id: string | null) => void;
  activeCategory: string | null;
  setActiveCategory: (val: string | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchSubmitted: boolean;
  submitSearch: (query: string) => void;
  clearSearch: () => void;
  searchProductsGlobally: (query: string) => Product[];
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  openAdminPortal: () => void;
  user: User | null;
  loadingAuth: boolean;
  loadingProducts: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const CART_KEY = 'joetech_cart';
const WISHLIST_KEY = 'joetech_wishlist';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or full, the app still works, it just will not persist.
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const getInitialView = (): ViewState => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    const validViews: ViewState[] = ['home', 'shop', 'categories', 'category', 'product', 'cart', 'checkout', 'wishlist', 'about', 'contact', 'services', 'admin', 'terms', 'privacy', 'auth'];
    if (validViews.includes(path as ViewState)) {
      return path as ViewState;
    }
    return 'home';
  };

  const [currentView, _setCurrentView] = useState<ViewState>(getInitialView);
  const [viewHistory, setViewHistory] = useState<ViewState[]>([]);

  const setCurrentView = useCallback((view: ViewState) => {
    _setCurrentView((prev) => {
      if (prev !== view) {
        setViewHistory((h) => [...h, prev]);
      }
      return view;
    });
    // Push state to browser history to sync URL
    const url = view === 'home' ? '/' : `/${view}`;
    const finalUrl = view === 'admin' ? `${url}${window.location.hash}` : url;
    window.history.pushState({ view }, '', finalUrl);
  }, []);

  const goBack = useCallback(() => {
    setViewHistory((h) => {
      if (h.length === 0) {
        _setCurrentView('home');
        return [];
      }
      const newHistory = [...h];
      const prevView = newHistory.pop();
      if (prevView) {
        _setCurrentView(prevView);
        const url = prevView === 'home' ? '/' : `/${prevView}`;
        window.history.pushState({ view: prevView }, '', url);
      }
      return newHistory;
    });
  }, []);

  useEffect(() => {
    // Listen for browser/hardware back button
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        _setCurrentView(event.state.view);
        // A shared product link carries its id as ?id=, which lives outside
        // history.state, so restore it here too or Back/Forward between two
        // shared links would keep showing whichever product loaded first.
        if (event.state.view === 'product') {
          setActiveProductId(new URLSearchParams(window.location.search).get('id'));
        }
        setViewHistory((h) => {
          if (h.length > 0) {
            const newHistory = [...h];
            newHistory.pop();
            return newHistory;
          }
          return h;
        });
      } else {
        // Fallback based on URL path
        const path = window.location.pathname.replace('/', '') as ViewState;
        const validViews: ViewState[] = ['home', 'shop', 'categories', 'category', 'product', 'cart', 'checkout', 'wishlist', 'about', 'contact', 'services', 'admin', 'terms', 'privacy', 'auth'];
        const view = validViews.includes(path) ? path : 'home';
        _setCurrentView(view);
        if (view === 'product') {
          setActiveProductId(new URLSearchParams(window.location.search).get('id'));
        }
        setViewHistory([]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // A shared product link is `/product?id=<id>`, so a fresh, cold load needs
  // to pick the id up from the query string before the first paint.
  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    if (typeof window === 'undefined' || getInitialView() !== 'product') return null;
    return new URLSearchParams(window.location.search).get('id');
  });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Keep `?id=` in the address bar in sync with whatever product is open, so
  // the link in the bar (or copied via Share) always reopens the same one.
  // A separate effect rather than threading activeProductId through
  // setCurrentView, since the two are set independently at the call sites
  // (e.g. ProductCard sets the id, then navigates). replaceState, not
  // pushState: the navigation to 'product' already added its own history
  // entry, this only fills in the id on that same entry.
  useEffect(() => {
    if (currentView !== 'product') return;
    const url = activeProductId ? `/product?id=${activeProductId}` : '/product';
    if (window.location.pathname + window.location.search !== url) {
      window.history.replaceState({ view: 'product' }, '', url);
    }
  }, [currentView, activeProductId]);
  // Cart and wishlist survive a refresh, losing a full cart to an accidental
  // reload is the fastest way to lose a sale.
  const [cart, setCart] = useState<CartItem[]>(() => readStored<CartItem[]>(CART_KEY, []));
  const [wishlist, setWishlist] = useState<string[]>(() => readStored<string[]>(WISHLIST_KEY, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(getInitialProductsFromStorage());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    // Check initial Supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdminAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminAuthenticated(!!session);
    });

    // Firebase may not be configured yet (e.g. mid-migration between
    // projects) — degrade to "signed out" rather than hanging on a loading
    // spinner forever or, worse, crashing the whole app.
    if (!firebaseConfigured || !auth) {
      setLoadingAuth(false);
      return () => subscription.unsubscribe();
    }

    /* The same reasoning applies when Firebase *is* configured but cannot be
       reached: on a cold load with no cached credentials, onAuthStateChanged
       never fires its first callback, and the whole app is gated behind
       `loadingAuth`, so the visitor gets a blank page with a spinner and no
       way out. A shopper on a flaky mobile connection must still be able to
       browse the catalogue, so give Firebase a short head start and then fall
       back to signed out. If it reports in later the listener still runs and
       signs the user in. */
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      setLoadingAuth(false);
    };
    const timeout = window.setTimeout(settle, 3000);

    const unsubscribeFirebase = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        settle();
      },
      (error) => {
        // Network failure, bad config, disabled provider — none of these
        // should keep the storefront hidden.
        console.error('Firebase auth state error:', error);
        settle();
      },
    );

    return () => {
      window.clearTimeout(timeout);
      subscription.unsubscribe();
      unsubscribeFirebase();
    };
  }, []);

  useEffect(() => {
    fetchProductsFromDB().then((data) => {
      setProducts(data);
      setLoadingProducts(false);
    });
  }, []);

  useEffect(() => writeStored(CART_KEY, cart), [cart]);
  useEffect(() => writeStored(WISHLIST_KEY, wishlist), [wishlist]);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash.startsWith('#admin')) {
        // Only set to admin if we're not already on the admin path
        if (window.location.pathname !== '/admin') {
          setCurrentView('admin');
        }
      }
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [setCurrentView]);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const created: Product = { 
      ...product, 
      id: createProductId(),
      created_at: new Date().toISOString()
    };
    await addProductToDB(created);
    setProducts((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    let previous: Product | undefined;
    setProducts((prev) => {
      previous = prev.find((p) => p.id === id);
      return prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
    });
    try {
      await updateProductInDB(id, updates);
    } catch (error) {
      // The save didn't actually happen, undo the optimistic change so the
      // screen doesn't show something a refresh would immediately erase.
      if (previous) {
        const restored = previous;
        setProducts((prev) => prev.map((p) => (p.id === id ? restored : p)));
      }
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    let removed: Product | undefined;
    let removedIndex = -1;
    setProducts((prev) => {
      removedIndex = prev.findIndex((p) => p.id === id);
      removed = prev[removedIndex];
      return prev.filter((p) => p.id !== id);
    });
    setCart((prev) => prev.filter((i) => i.product.id !== id));
    setWishlist((prev) => prev.filter((pid) => pid !== id));
    try {
      await deleteProductFromDB(id);
    } catch (error) {
      if (removed) {
        const restored = removed;
        const insertAt = removedIndex;
        setProducts((prev) => {
          const next = [...prev];
          next.splice(Math.min(insertAt, next.length), 0, restored);
          return next;
        });
      }
      throw error;
    }
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const submitSearch = useCallback((query: string) => {
    const q = query.trim().toLowerCase();
    
    // Keyword Navigation Routing
    if (q === 'home') {
      setCurrentView('home');
      window.scrollTo(0, 0);
      return;
    }
    if (q === 'support' || q === 'contact' || q === 'contact us') {
      setCurrentView('contact');
      window.scrollTo(0, 0);
      return;
    }
    if (q === 'product categories' || q === 'categories' || q === 'all 10 categories' || q === 'all categories') {
      setCurrentView('categories');
      window.scrollTo(0, 0);
      return;
    }
    if (q === 'wishlist' || q === 'wish list') {
      setCurrentView('wishlist');
      window.scrollTo(0, 0);
      return;
    }
    if (q === 'shop' || q === 'store' || q === 'all products') {
      setSearchQuery('');
      setSearchSubmitted(false);
      setActiveCategory(null);
      setCurrentView('shop');
      window.scrollTo(0, 0);
      return;
    }
    if (q === 'about' || q === 'about us') {
      setCurrentView('about');
      window.scrollTo(0, 0);
      return;
    }
    if (q === 'repair' || q === 'repairs' || q === 'services' || q === 'repair services') {
      setCurrentView('services');
      window.scrollTo(0, 0);
      return;
    }
    if (q === 'checkout' || q === 'pay' || q === 'payment') {
      setCurrentView('checkout');
      window.scrollTo(0, 0);
      return;
    }
    if (q === 'cart' || q === 'shopping cart') {
      setCurrentView('cart');
      window.scrollTo(0, 0);
      return;
    }

    setSearchQuery(query.trim());
    setSearchSubmitted(!!query.trim());
    setActiveCategory(null);
    setCurrentView('shop');
    window.scrollTo(0, 0);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchSubmitted(false);
  }, []);

  const searchProductsGlobally = useCallback(
    (query: string) => searchProducts(products, query),
    [products]
  );

  const loginAdmin = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    
    if (error) {
      return { ok: false, error: error.message };
    }
    
    setIsAdminAuthenticated(true);
    return { ok: true };
  }, []);

  const logoutAdmin = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setCurrentView('home');
    window.location.hash = '';
  }, []);

  const openAdminPortal = useCallback(() => {
    window.location.hash = 'admin';
    setCurrentView('admin');
  }, []);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          i.product.id === item.product.id &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor === item.selectedColor &&
          i.selectedVariant?.label === item.selectedVariant?.label
      );
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        goBack,
        activeProductId,
        setActiveProductId,
        activeCategory,
        setActiveCategory,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        cartOpen,
        setCartOpen,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        searchQuery,
        setSearchQuery,
        searchSubmitted,
        submitSearch,
        clearSearch,
        searchProductsGlobally,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        openAdminPortal,
        user,
        loadingAuth,
        loadingProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
