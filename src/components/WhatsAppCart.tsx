import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, CreditCard } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { formatPrice, getCartItemPrice } from '../data';
import { waLink } from '../config/site';
import { ProductImage } from './ui/ProductImage';
import toast from 'react-hot-toast';

export const WhatsAppCart = () => {
  const { cart, removeFromCart, updateQuantity, cartOpen, setCartOpen, user, setCurrentView } = useAppContext();

  const totalAmount = cart.reduce((acc, item) => acc + getCartItemPrice(item) * item.quantity, 0);

  const generateWhatsAppMessage = () => {
    let message = "🌟 *Joe Tech* 🌟\n";
    message += "===========================================\n";
    message += "Hello! I would like to place an order for the following items:\n\n";

    cart.forEach((item, idx) => {
      message += `${idx + 1}. 🛍️ *${item.product.name}* (Qty: ${item.quantity})\n`;
      if (item.selectedVariant) message += `   💾 Option: ${item.selectedVariant.label}\n`;
      if (item.selectedSize) message += `   📏 Size: ${item.selectedSize}\n`;
      if (item.selectedColor) message += `   🎨 Color: ${item.selectedColor}\n`;
      message += `   💰 Price: ${formatPrice(getCartItemPrice(item) * item.quantity)}\n\n`;
    });

    message += "-------------------------------------------\n";
    message += `💰 *Total Order Value*: *${formatPrice(totalAmount)}*\n`;
    message += "-------------------------------------------\n\n";
    message += "Please confirm availability and provide the next steps for payment and delivery. Thank you!";

    return waLink(message);
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-jt-ink/50 backdrop-blur-sm pointer-events-auto"
            onClick={() => setCartOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col pointer-events-auto bg-jt-paper text-jt-ink shadow-2xl dark:bg-jt-ink dark:text-white md:w-[450px]"
          >
            {/* Header */}
            <div className="relative flex shrink-0 items-center justify-between overflow-hidden border-b border-jt-ink/8 bg-white p-6 dark:border-white/10 dark:bg-jt-ink-soft/40">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-jt-blue/10 blur-2xl dark:bg-jt-blue/20" />
              <div className="relative z-10 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-jt-blue/10 text-jt-blue dark:bg-jt-blue/20 dark:text-jt-mint">
                  <ShoppingBag size={18} />
                </span>
                <h2 className="font-display text-xl font-semibold text-jt-ink dark:text-white">Your Cart</h2>
                <span className="rounded-full bg-jt-blue px-2 py-0.5 text-xs font-bold text-white">{cart.length}</span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="focus-ring relative z-10 rounded-full p-2 text-jt-ink/50 transition-colors hover:bg-jt-ink/5 hover:text-jt-ink dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-jt-blue/10 text-jt-blue dark:bg-jt-blue/15 dark:text-jt-mint">
                    <ShoppingBag size={32} />
                  </span>
                  <p className="font-display text-lg text-jt-ink dark:text-white">Your cart is empty.</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="focus-ring text-xs font-bold uppercase tracking-widest text-jt-blue transition-colors hover:text-jt-blue-soft dark:text-jt-mint"
                  >
                    Continue Exploring
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${item.selectedVariant?.label}`}
                      className="flex gap-4 rounded-2xl border border-jt-ink/8 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-jt-ink-soft/40"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                        <ProductImage
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          icon={item.product.icon}
                          seed={item.product.id}
                          iconClassName="h-8 w-8"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="line-clamp-1 text-sm font-semibold text-jt-ink dark:text-white">
                              {item.product.name}
                            </h3>
                            {(item.selectedVariant || item.selectedColor || item.selectedSize) && (
                              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-jt-ink/50 dark:text-jt-steel">
                                {[item.selectedVariant?.label, item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            aria-label={`Remove ${item.product.name}`}
                            className="focus-ring shrink-0 rounded-lg p-1.5 text-jt-ink/35 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-white/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="mt-auto flex items-end justify-between">
                          <div className="flex items-center gap-3 rounded-lg border border-jt-ink/10 bg-jt-paper px-2 py-1 dark:border-white/10 dark:bg-jt-ink/60">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="focus-ring text-jt-ink/70 transition-colors hover:text-jt-blue dark:text-white/70 dark:hover:text-jt-mint"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-4 text-center text-xs font-bold text-jt-ink dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="focus-ring text-jt-ink/70 transition-colors hover:text-jt-blue dark:text-white/70 dark:hover:text-jt-mint"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-tech text-sm font-bold tracking-wide text-jt-blue dark:text-jt-mint">
                            {formatPrice(getCartItemPrice(item) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="shrink-0 border-t border-jt-ink/8 bg-white p-6 dark:border-white/10 dark:bg-jt-ink-soft/40">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-widest text-jt-ink/60 dark:text-jt-steel">
                    Subtotal
                  </span>
                  <span className="font-display text-xl font-bold text-jt-ink dark:text-white">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCurrentView('checkout');
                    window.scrollTo(0, 0);
                  }}
                  className="focus-ring flex w-full items-center justify-center gap-3 rounded-xl bg-jt-blue py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-jt-blue/25 transition-all hover:bg-jt-blue-soft active:scale-95"
                >
                  <CreditCard size={20} />
                  <span>Checkout &amp; pay by transfer</span>
                </button>

                <button
                  onClick={() => window.open(generateWhatsAppMessage(), '_blank', 'noopener')}
                  className="focus-ring mt-3 flex w-full items-center justify-center gap-3 rounded-xl border border-jt-ink/15 py-3.5 text-sm font-bold uppercase tracking-widest text-jt-ink transition-all hover:border-jt-lime hover:bg-jt-lime/10 active:scale-95 dark:border-white/20 dark:text-white"
                >
                  <MessageCircle size={18} />
                  <span>Or order on WhatsApp</span>
                </button>

                {user && (
                  <div className="mt-5 rounded-lg border border-jt-blue/15 bg-jt-blue/5 p-3 text-center dark:border-jt-mint/20 dark:bg-jt-mint/5">
                    <p className="mb-1.5 text-xs font-medium text-jt-ink/70 dark:text-jt-steel">
                      Love Joe Tech? Invite friends and earn rewards!
                    </p>
                    <button
                      onClick={() => {
                        const referralUrl = `${window.location.origin}/?ref=${user.uid}`;
                        navigator.clipboard.writeText(referralUrl);
                        toast.success('Referral link copied to clipboard!');
                      }}
                      className="focus-ring text-xs font-extrabold uppercase tracking-widest text-jt-blue underline transition-colors hover:text-jt-blue-soft dark:text-jt-mint"
                    >
                      Copy My Referral Link
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
