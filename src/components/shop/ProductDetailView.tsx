import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../store/AppContext';
import { formatPrice } from '../../data';
import { site } from '../../config/site';
import { Ban, Heart, ChevronRight, MessageCircle, Share2, Star, ShoppingBag, ShieldCheck, Truck, Minus, Plus, ArrowLeft } from 'lucide-react';

export const ProductDetailView = () => {
  const { activeProductId, setCurrentView, goBack, addToCart, wishlist, toggleWishlist, getProductById, user } = useAppContext();
  const product = activeProductId ? getProductById(activeProductId) : undefined;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || '');
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="pt-32 pb-24 text-center min-h-[60vh] flex flex-col justify-center items-center bg-white text-gray-900 dark:text-gray-800 dark:text-white transition-colors duration-500">
        <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
        <button 
          onClick={() => setCurrentView('category')}
          className="border-b-2 border-[#3626a7] pb-1 uppercase tracking-widest text-xs font-bold hover:brand-text transition-colors"
        >
          Return to Shop Categories
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  // Rows created before the stock toggle existed have no `inStock` value,
  // so only an explicit `false` reads as unavailable.
  const outOfStock = product.inStock === false;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart({
      product,
      quantity,
      selectedSize,
      selectedColor,
    });
  };

  const handleDirectWhatsApp = () => {
    if (!user) {
      setCurrentView('auth');
      return;
    }

    let message = "🌟 *Joe Tech* 🌟\n";
    message += "===========================================\n";
    message += "Hello! I would like to inquire about this item:\n\n";
    message += `🛍️ *Product*: *${product.name}*\n`;
    if (selectedSize) message += `📏 *Size*: ${selectedSize}\n`;
    if (selectedColor) message += `🎨 *Color*: ${selectedColor}\n`;
    message += `🔢 *Quantity*: ${quantity}\n`;
    message += `💰 *Total Price*: *${formatPrice(product.price * quantity)}*\n\n`;
    message += outOfStock
      ? "This item shows as out of stock, please let me know when it is back. Thank you!"
      : "Please let me know if this item is currently available. Thank you!";

    const url = `https://wa.me/2348133727813?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    const shareUrl = `${site.url}/product?id=${product.id}`;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on Joe Tech — ${formatPrice(product.price)}`,
      url: shareUrl,
    };

    // navigator.share is mobile-only in most browsers, so desktop falls back
    // to putting the link on the clipboard instead.
    if (navigator.share && navigator.canShare?.(shareData) !== false) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // AbortError just means the user closed the share sheet, not a failure.
        if ((err as Error)?.name !== 'AbortError') {
          toast.error('Could not open the share sheet. Try again.');
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied — paste it anywhere to share this product.');
    } catch {
      toast.error('Could not copy the link. Copy it from the address bar instead.');
    }
  };

  return (
    <div className="pt-24 pb-24 min-h-screen bg-transparent text-gray-900 dark:text-gray-100 relative transition-colors duration-500">

      {/* Breadcrumbs & Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-800 dark:text-white font-bold">
          <button onClick={() => setCurrentView('home')} className="hover:brand-text transition-colors">Home</button>
          <ChevronRight size={12} />
          <button onClick={() => setCurrentView('category')} className="hover:brand-text transition-colors">Shop Categories</button>
          <ChevronRight size={12} />
          <span className="brand-text">{product.name}</span>
        </div>
        <button 
          onClick={() => {
            goBack();
            window.scrollTo(0, 0);
          }} 
          className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-800 dark:text-white hover:brand-text transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 flex-shrink-0 no-scrollbar">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-xl bg-[#ece9fa]/50 border transition-all duration-300 ${selectedImage === idx ? 'border-[#3626a7] opacity-100' : 'border-gray-200 opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 bg-[#ece9fa]/50 aspect-[4/5] md:aspect-[3/4] relative overflow-hidden rounded-2xl glass-card border border-gray-200">
              {outOfStock && (
                <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-jt-ink/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm dark:bg-black/80">
                  <Ban className="h-3.5 w-3.5" /> Out of Stock
                </span>
              )}
              <AnimatePresence mode="wait">
                <motion.img 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  key={selectedImage}
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover opacity-90"
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full lg:w-1/2 lg:py-8 flex flex-col">
            <div className="mb-2 flex items-center space-x-3">
               <span className="text-xs tracking-widest uppercase font-bold brand-text">{product.category}</span>
               {product.isNew && <span className="text-[10px] uppercase font-bold bg-[#3626a7]/20 brand-text px-2 py-1 rounded border brand-border shadow-[0_0_10px_rgba(168,85,247,0.2)]">New Arrival</span>}
               {product.badge && <span className="text-[10px] uppercase font-bold bg-jt-lime text-white px-2 py-1 rounded shadow-sm">{product.badge}</span>}
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-serif text-[#281c7d] mb-4 font-bold tracking-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-baseline gap-2.5">
                <p className="text-3xl font-bold text-[#000000]">{formatPrice(product.price)}</p>
                {!!product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-lg font-medium text-gray-400 line-through dark:text-gray-600">
                    {formatPrice(product.originalPrice)}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-1 border-l border-white/20 pl-4">
                 <Star size={14} className="text-yellow-500 fill-current" />
                 <Star size={14} className="text-yellow-500 fill-current" />
                 <Star size={14} className="text-yellow-500 fill-current" />
                 <Star size={14} className="text-yellow-500 fill-current" />
                 <Star size={14} className="text-yellow-500 fill-current" />
                 <span className="text-xs text-gray-400 dark:text-gray-800 dark:text-white font-medium ml-1">(24)</span>
              </div>
            </div>

            {/* Was text-gray-300, nearly unreadable against the white card,
                the opposite of the bold, high-contrast spec text every
                other marketplace (Jumia, Temu) uses on its product page. */}
            <div className="prose prose-sm text-jt-ink mb-10 leading-relaxed max-w-none font-medium">
              <p>{product.description}</p>
              
              {(product.location || product.year || product.mileage) && (
                <ul className="mt-6 mb-4 space-y-3 border-t border-gray-200 pt-6">
                  {product.location && (
                    <li className="flex items-center justify-between glass p-3 rounded-lg shadow-none">
                      <span className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-800 dark:text-white">Location</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-800 dark:text-white">{product.location}</span>
                    </li>
                  )}
                  {product.year && (
                    <li className="flex items-center justify-between glass p-3 rounded-lg shadow-none">
                      <span className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-800 dark:text-white">Model Year</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-800 dark:text-white">{product.year}</span>
                    </li>
                  )}
                  {product.mileage && (
                    <li className="flex items-center justify-between glass p-3 rounded-lg shadow-none">
                      <span className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-800 dark:text-white">Mileage</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-800 dark:text-white">{product.mileage}</span>
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="space-y-8 mb-10">
              {/* Colors */}
              {product.colors && product.colors.length > 0 && (() => {
                const getColorCode = (colorName: string) => {
                  const name = colorName.toLowerCase();
                  if (name.includes('black')) return '#1a1a1a';
                  if (name.includes('white')) return '#f8f9fa';
                  if (name.includes('red')) return '#ef4444';
                  if (name.includes('blue')) return '#3b82f6';
                  if (name.includes('green')) return '#10b981';
                  if (name.includes('yellow')) return '#f59e0b';
                  if (name.includes('purple')) return '#8b5cf6';
                  if (name.includes('pink')) return '#ec4899';
                  if (name.includes('orange')) return '#f97316';
                  if (name.includes('gray') || name.includes('grey') || name.includes('silver')) return '#9ca3af';
                  if (name.includes('gold')) return '#d4af37';
                  if (name.includes('brown')) return '#8b4513';
                  if (name.includes('navy')) return '#1e3a8a';
                  if (name.includes('coral')) return '#ff7f50';
                  return name;
                };

                return (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-gray-900 dark:text-gray-800 dark:text-white mb-4">Color: <span className="text-gray-400 dark:text-gray-800 dark:text-white">{selectedColor}</span></h3>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-2 text-sm border rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                            selectedColor === color ? 'border-[#3626a7] bg-[#3626a7]/10 text-gray-900 dark:text-gray-800 dark:text-white shadow-[0_0_15px_rgba(16,145,33,0.2)]' : 'border-gray-200 text-gray-400 dark:text-gray-800 dark:text-white hover:border-[#3626a7]/50 hover:brand-text'
                          }`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: getColorCode(color) }}
                          />
                          <span>{color}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-900 dark:text-gray-800 dark:text-white">Size: <span className="text-gray-400 dark:text-gray-800 dark:text-white">{selectedSize}</span></h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] h-12 flex items-center justify-center text-sm border font-semibold rounded-lg transition-all duration-300 px-3 ${
                        selectedSize === size ? 'border-[#3626a7] bg-[#3626a7]/10 text-gray-800 dark:text-white shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'border-gray-200 text-gray-400 dark:text-gray-800 dark:text-white hover:border-[#3626a7]/50 hover:brand-text'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-gray-900 dark:text-gray-800 dark:text-white mb-4">Quantity</h3>
                <div className={`flex items-center space-x-6 glass border border-white/5 p-2 rounded-xl inline-flex shadow-none ${outOfStock ? 'opacity-50' : ''}`}>
                  <button 
                    disabled={outOfStock}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#ece9fa] transition-colors text-gray-900 dark:text-gray-800 dark:text-white disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center text-gray-900 dark:text-gray-800 dark:text-white">{quantity}</span>
                  <button 
                    disabled={outOfStock}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#ece9fa] transition-colors text-gray-900 dark:text-gray-800 dark:text-white disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-4 mb-10">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="flex-1 bg-[#3626a7] text-white py-4 px-8 rounded-xl flex items-center justify-center space-x-2 uppercase text-sm tracking-widest font-bold hover:bg-[#281c7d] transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:bg-gray-300 dark:disabled:bg-white/10"
                >
                  {outOfStock ? <Ban size={18} /> : <ShoppingBag size={18} />}
                  <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`h-14 w-full sm:w-16 rounded-xl border flex items-center justify-center transition-colors ${
                    isWishlisted ? 'border-[#3626a7] brand-text bg-[#3626a7]/10 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'border-gray-200 text-gray-400 dark:text-gray-800 dark:text-white hover:border-[#3626a7]/50 hover:brand-text glass'
                  }`}
                >
                  <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                </button>
                <button
                  onClick={handleShare}
                  title="Share this product"
                  aria-label="Share this product"
                  className="h-14 w-full sm:w-16 rounded-xl border border-gray-200 text-gray-400 dark:text-gray-800 dark:text-white hover:border-[#3626a7]/50 hover:brand-text glass flex items-center justify-center transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
              
              <button 
                onClick={handleDirectWhatsApp}
                className="w-full bg-[#25D366] text-gray-800 dark:text-white py-4 rounded-xl flex justify-center items-center space-x-3 uppercase text-sm tracking-widest font-bold hover:bg-[#128C7E] transition-colors shadow-[0_0_20px_rgba(37,211,102,0.2)]"
              >
                <MessageCircle size={20} />
                <span>Order on WhatsApp</span>
              </button>
            </div>

            {/* Guarantees Accordion Info */}
            <div className="mt-auto border-t border-gray-200 pt-8 grid grid-cols-2 gap-4">
               <div className="flex items-center space-x-3 glass border border-white/5 p-4 rounded-xl shadow-none">
                 <ShieldCheck size={24} className="brand-text" />
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-800 dark:text-white">Genuine Quality</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-800 dark:text-white">100% Authenticity</p>
                 </div>
              </div>
              <div className="flex items-center space-x-3 glass border border-white/5 p-4 rounded-xl shadow-none">
                 <Truck size={24} className="brand-text" />
                 <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-800 dark:text-white">Fast Delivery</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-800 dark:text-white">Secure shipping</p>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
