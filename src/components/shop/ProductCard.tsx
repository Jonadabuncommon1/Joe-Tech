import React from 'react';
import { Product } from '../../types';
import { formatPrice, getDisplayPrice, hasVariants } from '../../data';
import { motion } from 'motion/react';
import { Ban, ShoppingBag, Zap, MessageCircle, ListFilter } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { ProductImage } from '../ui/ProductImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setActiveProductId, setCurrentView, addToCart } = useAppContext();

  // Rows created before the stock toggle existed have no `inStock` value at
  // all, so treat only an explicit `false` as unavailable, everything else
  // (true or unset) reads as in stock.
  const outOfStock = product.inStock === false;
  const variantProduct = hasVariants(product);

  const handleView = () => {
    setActiveProductId(product.id);
    setCurrentView('product');
    window.scrollTo(0, 0);
  };

  // A card can't know which storage/variant the shopper wants, so quick-add
  // only ever adds a plain product straight to cart. A variant product opens
  // the detail page instead, same as tapping the card itself, so the price
  // shown always matches the option they actually pick.
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    if (variantProduct) {
      handleView();
      return;
    }
    addToCart({
      product,
      quantity: 1,
      selectedSize: product.sizes?.[0] || '',
      selectedColor: product.colors?.[0] || '',
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between overflow-hidden cursor-pointer rounded-2xl border border-jt-ink/10 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-jt-blue/40 hover:shadow-xl hover:shadow-jt-blue/10 dark:border-white/10 dark:bg-jt-ink/50"
      onClick={handleView}
    >
      <div>
        {/* Product Media Box */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
          {/* Status Badges, stacked top-left so Out of Stock always wins the corner */}
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5">
            {outOfStock && (
              <span className="inline-flex items-center gap-1 rounded-full bg-jt-ink/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm dark:bg-black/80">
                <Ban className="h-3 w-3" /> Out of Stock
              </span>
            )}
            {product.isNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-jt-blue px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Zap className="h-3 w-3 fill-current" /> New
              </span>
            )}
          </div>

          {product.badge && (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-jt-lime px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              {product.badge}
            </span>
          )}

          {/* Product Image */}
          <div className="h-full w-full transform transition-transform duration-500 group-hover:scale-105">
            <ProductImage
              src={product.images?.[0]}
              alt={product.name}
              icon={product.icon}
              seed={product.id}
              className="h-full w-full object-contain p-4"
              iconClassName="h-12 w-12 text-jt-blue/40 dark:text-jt-mint/40"
            />
          </div>

          {/* Hover Quick Action Strip */}
          <div className="absolute inset-x-2 bottom-2 z-20 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
            {outOfStock ? (
              <span
                className="flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-gray-300 px-3 py-2.5 text-xs font-bold text-gray-600 shadow-lg dark:bg-white/20 dark:text-white/60"
                title="Out of stock"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Out of Stock</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleQuickAdd}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-jt-ink px-3 py-2.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-jt-blue dark:bg-white dark:text-jt-ink dark:hover:bg-jt-mint"
                title={variantProduct ? 'Choose an option' : 'Add to cart'}
              >
                {variantProduct ? (
                  <>
                    <ListFilter className="h-3.5 w-3.5" />
                    <span>Select Options</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`https://wa.me/2348133727813?text=${encodeURIComponent(
                outOfStock
                  ? `Hello Joe Tech, is ${product.name} back in stock?`
                  : `Hello Joe Tech, I want to inquire about ${product.name}`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#1ebd5a]"
              title="Ask on WhatsApp"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
            </a>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-3 px-1">
          {product.category && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-jt-ink/50 dark:text-jt-steel">
              {product.category}
            </p>
          )}

          <h3 className="line-clamp-2 text-sm font-bold text-jt-ink transition-colors group-hover:text-jt-blue dark:text-white dark:group-hover:text-jt-mint">
            {product.name}
          </h3>

          {product.specs && (
            <p className="mt-1 line-clamp-1 text-xs text-jt-ink/60 dark:text-jt-steel">
              {product.specs}
            </p>
          )}
        </div>
      </div>

      {/* Pricing & Stock Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-jt-ink/5 px-1 pt-2.5 dark:border-white/5">
        {/* min-w-0 lets this shrink/wrap instead of forcing the row wider than
            the card, which used to push "In Stock" out past the right edge
            whenever a discounted price made the pair too wide for one line. */}
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          {variantProduct ? (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-jt-ink/40 dark:text-jt-steel/70">
                From
              </span>
              <span className="font-tech text-base font-bold text-jt-blue dark:text-jt-mint">
                {formatPrice(getDisplayPrice(product))}
              </span>
            </>
          ) : (
            <>
              <span className="font-tech text-base font-bold text-jt-blue dark:text-jt-mint">
                {formatPrice(product.price)}
              </span>
              {!!product.originalPrice && product.originalPrice > product.price && (
                <span className="font-tech text-[11px] text-jt-ink/40 line-through dark:text-jt-steel/70">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </>
          )}
        </p>

        {outOfStock ? (
          <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-red-600 dark:text-red-400">
            Out of Stock
          </span>
        ) : (
          <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            In Stock
          </span>
        )}
      </div>
    </motion.div>
  );
};
