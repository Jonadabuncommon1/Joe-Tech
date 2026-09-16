import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { marketplaceCategories } from '../../data';
import { ProductCard } from './ProductCard';
import { CategoryStage } from './CategoryStage';
import { useAppContext } from '../../store/AppContext';
import { searchProducts } from '../../utils/searchProducts';
import { Search, SlidersHorizontal, ChevronDown, ArrowLeft, ChevronRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const CategoryView = () => {
  const {
    products,
    activeCategory,
    setCurrentView,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    searchSubmitted,
    submitSearch,
    clearSearch,
    searchProductsGlobally,
    goBack,
    loadingProducts,
  } = useAppContext();

  const [sortMode, setSortMode] = useState<string>('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  let effectiveCategory = activeCategory;
  if (searchSubmitted && searchQuery.trim().length > 0 && !activeCategory) {
    const q = searchQuery.toLowerCase().trim();
    if (q.includes('iphone') || q.includes('ipad') || q.includes('apple')) effectiveCategory = 'iphones-ipads';
    else if (q.includes('android') || q.includes('samsung') || q.includes('pixel') || q.includes('tecno') || q.includes('infinix')) effectiveCategory = 'android-phones';
    else if (q.includes('laptop') || q.includes('macbook') || q.includes('tablet') || q.includes('notebook')) effectiveCategory = 'laptops-tablets';
    else if (q.includes('phone accessor') || q.includes('charger') || q.includes('earbuds') || q.includes('power bank')) effectiveCategory = 'phone-accessories';
    else if (q.includes('laptop accessor') || q.includes('ssd') || q.includes('ram') || q.includes('docking')) effectiveCategory = 'laptop-accessories';
    else if (q.includes('game') || q.includes('gaming') || q.includes('monitor') || q.includes('chair') || q.includes('desk')) effectiveCategory = 'gaming-setup';
    else if (q.includes('solar') || q.includes('inverter') || q.includes('battery') || q.includes('panel')) effectiveCategory = 'solar-power';
    else if (q.includes('repair') || q.includes('fix') || q.includes('broken')) effectiveCategory = 'repairs';
  }

  const categoryData = marketplaceCategories.find(
    c => c.id === activeCategory || c.name === activeCategory
  );

  // Photos for the banner slideshow, tied to the category itself rather
  // than the (possibly search-filtered) grid below it, in-stock preferred.
  const categoryImages = useMemo(() => {
    if (!categoryData) return [] as string[];
    const inCategory = products.filter((p) => p.category === categoryData.name && p.images?.length);
    const inStock = inCategory.filter((p) => p.inStock !== false);
    const pool = inStock.length > 0 ? inStock : inCategory;
    return pool.flatMap((p) => p.images).slice(0, 5);
  }, [products, categoryData]);
  const isGlobalSearch = searchSubmitted && searchQuery.trim().length > 0;
  const categoryName = isGlobalSearch
    ? `Search: "${searchQuery}"`
    : activeCategory === 'trending'
    ? 'Trending'
    : categoryData?.name || 'All Categories';

  let categoryProducts = products;
  if (isGlobalSearch) {
    categoryProducts = searchProductsGlobally(searchQuery);
  } else if (activeCategory === 'trending') {
    categoryProducts = products.filter((p) => p.isTrending);
  } else if (categoryData) {
    categoryProducts = products.filter((p) => p.category === categoryData.name);
  }

  // Only filter products when the user has actually submitted the search (pressed Enter).
  // While they are still typing, show the full unfiltered product list.
  if (searchQuery.trim() && !isGlobalSearch && searchSubmitted) {
    categoryProducts = searchProducts(categoryProducts, searchQuery);
  }

  let displayProducts = [...categoryProducts];

  if (sortMode === 'price-asc') {
    displayProducts.sort((a, b) => a.price - b.price);
  } else if (sortMode === 'price-desc') {
    displayProducts.sort((a, b) => b.price - a.price);
  } else if (sortMode === 'popularity') {
    displayProducts.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  } else if (sortMode === 'new') {
    displayProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-transparent text-gray-900 dark:text-gray-100 relative transition-colors duration-500">

      {/* Category hero, icon tile in the category's brand gradient, matching the
          category grid on the categories page (there are no per-category photos yet). */}
      <CategoryStage
        images={categoryImages}
        gradient={categoryData?.gradient || 'from-jt-blue to-jt-blue-deep'}
        icon={categoryData?.icon || 'Sparkles'}
        className="h-[32vh] md:h-[36vh] w-full mb-12"
        fallbackIconClassName="h-24 w-24 md:h-28 md:w-28"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80 w-full">
          <div className="flex items-center justify-between w-full md:w-auto md:flex-1 mr-4">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-800 dark:text-white">
              <button onClick={() => setCurrentView('home')} className="hover:brand-text transition-colors">Home</button>
              <ChevronRight size={10} />
              <button onClick={() => { setActiveCategory(null); setCurrentView('categories'); }} className="hover:brand-text transition-colors">Explore</button>
              <ChevronRight size={10} />
              <span className="brand-text font-bold">{categoryName}</span>
            </div>
            <button
              onClick={() => {
                goBack();
                window.scrollTo(0, 0);
              }}
              className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-800 dark:text-white hover:brand-text transition-colors mr-4 md:mr-0"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          </div>

          <div className="flex items-center w-full md:w-auto space-x-4">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitSearch(searchQuery);
                }}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-800 dark:text-white text-sm focus:outline-none focus:border-[#3626a7] rounded-xl shadow-none placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center justify-between space-x-2 px-4 py-2 rounded-xl text-sm uppercase tracking-widest font-semibold text-gray-600 dark:text-gray-800 dark:text-white hover:brand-text border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] hover:border-[#3626a7] transition-colors h-full">
                <span>{sortMode === 'default' ? 'Sort' : sortMode === 'price-asc' ? 'Low to High' : sortMode === 'price-desc' ? 'High to Low' : sortMode === 'popularity' ? 'Popularity' : 'New Arrivals'}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu. Was `glass-card`, a class that doesn't exist
                  anywhere in the CSS, so in light mode this panel had no
                  background at all and the product photos underneath showed
                  straight through it. Solid bg-white (matching the Sort
                  button and every other panel on this page) fixes that. */}
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl transition-all z-50 overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] shadow-lg ${isSortOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                <button onClick={() => { setSortMode('default'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm hover:bg-[#ece9fa] dark:hover:bg-[#3626a7]/20 ${sortMode === 'default' ? 'font-bold brand-text' : 'text-gray-600 dark:text-gray-800 dark:text-white'}`}>Default</button>
                <div className="h-px w-full bg-white/5" />
                <button onClick={() => { setSortMode('price-asc'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm hover:bg-[#ece9fa] dark:hover:bg-[#3626a7]/20 ${sortMode === 'price-asc' ? 'font-bold brand-text' : 'text-gray-600 dark:text-gray-800 dark:text-white'}`}>Price: Low to High</button>
                <div className="h-px w-full bg-white/5" />
                <button onClick={() => { setSortMode('price-desc'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm hover:bg-[#ece9fa] dark:hover:bg-[#3626a7]/20 ${sortMode === 'price-desc' ? 'font-bold brand-text' : 'text-gray-600 dark:text-gray-800 dark:text-white'}`}>Price: High to Low</button>
                <div className="h-px w-full bg-white/5" />
                <button onClick={() => { setSortMode('popularity'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm hover:bg-[#ece9fa] dark:hover:bg-[#3626a7]/20 ${sortMode === 'popularity' ? 'font-bold brand-text' : 'text-gray-600 dark:text-gray-800 dark:text-white'}`}>Popularity</button>
                <div className="h-px w-full bg-white/5" />
                <button onClick={() => { setSortMode('new'); setIsSortOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm hover:bg-[#ece9fa] dark:hover:bg-[#3626a7]/20 ${sortMode === 'new' ? 'font-bold brand-text' : 'text-gray-600 dark:text-gray-800 dark:text-white'}`}>New Arrivals</button>
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center space-x-2 p-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-[#3626a7] transition-colors md:hidden shadow-sm">
              <SlidersHorizontal size={18} className="text-gray-600 dark:text-gray-800 dark:text-white hover:brand-text" />
            </button>
          </div>
        </div>

        {/* Filters Sidebar and Main Content */}
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* Filters */}
          <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0 mb-6 md:mb-0`}>
            <h3 className="font-display text-2xl font-bold mb-6 text-gray-900 dark:text-gray-800 dark:text-white">Shop Categories</h3>

            <div className="space-y-8 p-6 rounded-2xl border border-gray-200 bg-[#ece9fa]/50 shadow-none">
              <div>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => setActiveCategory('trending')}
                      className={`text-sm tracking-wide transition-colors ${activeCategory === 'trending' ? 'brand-text font-bold' : 'text-gray-400 dark:text-gray-800 dark:text-white hover:brand-text'}`}
                    >
                      Trending
                    </button>
                  </li>
                  {marketplaceCategories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          if (cat.isService) {
                            setCurrentView('services');
                          } else {
                            setActiveCategory(cat.id);
                          }
                        }}
                        className={`whitespace-nowrap text-sm tracking-wide transition-colors ${activeCategory === cat.id ? 'brand-text font-bold' : 'text-gray-400 dark:text-gray-800 dark:text-white hover:brand-text'}`}
                        title={cat.name}
                      >
                        {cat.shortName}
                      </button>
                    </li>
                  ))}

                </ul>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-4 h-[380px] flex flex-col justify-between">
                    <div className="w-full h-[240px] bg-gray-200 dark:bg-white/5 rounded-2xl mb-4" />
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayProducts.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {displayProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-32 rounded-3xl border border-gray-200 bg-[#ece9fa]/40 shadow-none px-6">
                {searchQuery.trim() && searchSubmitted ? (
                  <>
                    <h3 className="text-2xl font-display text-gray-900 dark:text-gray-800 dark:text-white mb-2">Not available at this moment</h3>
                    <p className="text-gray-600 dark:text-gray-800 dark:text-white font-medium max-w-md mx-auto">
                      We could not find &ldquo;{searchQuery}&rdquo; in our catalog right now. Try another search or browse categories.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        clearSearch();
                        setActiveCategory(null);
                      }}
                      className="mt-6 text-sm font-bold uppercase tracking-widest brand-text hover:text-[#281c7d]"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-display text-gray-900 dark:text-gray-800 dark:text-white mb-2">No selections found.</h3>
                    <p className="text-gray-400 dark:text-gray-800 dark:text-white font-medium">Try adjusting your filters.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
