import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Copy,
  CreditCard,
  Mail,
  MessageCircle,
  ShoppingBag,
  Truck,
  Store,
  ShieldCheck,
} from 'lucide-react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useAppContext } from '../../store/AppContext';
import { formatPrice } from '../../data';
import { ProductImage } from '../ui/ProductImage';
import { bankDetails, bankDetailsConfigured, branches, site, mailLink, waLink } from '../../config/site';

const fieldBase =
  'w-full rounded-xl border border-jt-ink/12 bg-white px-4 py-3 text-sm text-jt-ink outline-none transition-colors placeholder:text-jt-ink/35 focus:border-jt-blue focus:ring-2 focus:ring-jt-blue/20 dark:border-white/12 dark:bg-jt-ink/60 dark:text-white dark:placeholder:text-jt-steel/50';

const Label: React.FC<{ children: React.ReactNode; required?: boolean; htmlFor: string }> = ({
  children,
  required,
  htmlFor,
}) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-jt-ink/60 dark:text-jt-steel"
  >
    {children}
    {required && <span className="ml-0.5 text-jt-blue dark:text-jt-mint">*</span>}
  </label>
);

const CopyRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Insecure context or blocked clipboard
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-jt-steel">{label}</p>
        <p className={`truncate text-sm font-semibold text-white ${mono ? 'font-tech tracking-wide' : ''}`}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:border-jt-mint hover:text-jt-mint"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

export const CheckoutView: React.FC = () => {
  const { cart, setCurrentView, clearCart, user } = useAppContext();

  const [fullName, setFullName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [fulfilment, setFulfilment] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [branch, setBranch] = useState<string>(branches[0].name);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMode, setPaymentMode] = useState<'flutterwave' | 'whatsapp'>('flutterwave');
  const [confirmed, setConfirmed] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  const orderRef = useMemo(
    () => `JT-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    [],
  );

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Please enter your name';
    if (!phone.trim()) next.phone = 'We need a phone number to confirm your order';
    else if (phone.replace(/\D/g, '').length < 10) next.phone = 'That phone number looks too short';
    if (paymentMode === 'flutterwave' && !email.trim())
      next.email = 'Email is required for Flutterwave payment receipts';
    if (fulfilment === 'delivery' && !address.trim())
      next.address = 'Where should we deliver it?';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const flwConfig = {
    public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOXDEMOKEY',
    tx_ref: orderRef,
    amount: subtotal,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd,account',
    customer: {
      email: email.trim() || 'orders@joetech.shop',
      phone_number: phone,
      name: fullName,
    },
    customizations: {
      title: 'Joe Tech Store',
      description: `Payment for Order ${orderRef}`,
      logo: 'https://joetech.shop/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(flwConfig);

  const handlePayOnline = () => {
    if (!validate()) return;

    handleFlutterPayment({
      callback: (response) => {
        closePaymentModal();
        if (response.status === 'successful' || response.status === 'completed') {
          setPaymentSuccessData(response);
          setConfirmed(true);
          clearCart();
        } else {
          alert('Payment was not completed. Please try again.');
        }
      },
      onClose: () => {},
    });
  };

  const buildOrderMessage = () =>
    [
      `ORDER ${orderRef}, Joe Tech`,
      '',
      ...cart.map(
        (i) => `• ${i.product.name} x${i.quantity}, ${formatPrice(i.product.price * i.quantity)}`,
      ),
      '',
      `TOTAL: ${formatPrice(subtotal)}`,
      '',
      `Name: ${fullName}`,
      `Phone: ${phone}`,
      email.trim() ? `Email: ${email}` : null,
      fulfilment === 'delivery' ? `Deliver to: ${address}` : `Pickup at: ${branch}`,
      notes.trim() ? `Notes: ${notes}` : null,
      '',
      'I am sending my transfer receipt now.',
    ]
      .filter(Boolean)
      .join('\n');

  const confirmOnWhatsApp = () => {
    if (!validate()) return;
    const target = branches.find((b) => b.name === branch) ?? branches[0];
    window.open(waLink(buildOrderMessage(), target.phone), '_blank', 'noopener');
    setConfirmed(true);
    clearCart();
  };

  // Same order details as the WhatsApp receipt, sent as an email instead for
  // customers who would rather not open WhatsApp. Neither a wa.me link nor a
  // mailto: link can attach a file (that's a browser restriction, not
  // something either channel can be made to do), so both ask the customer to
  // attach the transfer receipt themselves once their email/chat app opens.
  const confirmByEmail = () => {
    if (!validate()) return;
    window.open(
      mailLink(`Payment receipt, order ${orderRef}`, `${buildOrderMessage()}\n\n(Attach your transfer receipt to this email before sending.)`),
      '_blank',
    );
    setConfirmed(true);
    clearCart();
  };

  if (cart.length === 0 && !confirmed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-32 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-jt-blue/10 text-jt-blue dark:bg-jt-blue/20 dark:text-jt-mint">
          <ShoppingBag className="h-9 w-9" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-semibold text-jt-ink dark:text-white">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-sm text-sm text-jt-ink/60 dark:text-jt-steel">
          Add a few items and come back, we will have your checkout ready.
        </p>
        <button
          onClick={() => {
            setCurrentView('categories');
            window.scrollTo(0, 0);
          }}
          className="focus-ring mt-7 rounded-full bg-jt-blue px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-jt-blue/25 transition-all hover:-translate-y-0.5 hover:bg-jt-blue-soft"
        >
          Browse the shop
        </button>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-32 text-center">
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid h-20 w-20 place-items-center rounded-full bg-jt-mint/20 text-jt-olive dark:text-jt-mint"
        >
          <Check className="h-10 w-10" strokeWidth={2.5} />
        </motion.span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-jt-ink dark:text-white">
          Order {orderRef} {paymentSuccessData ? 'Paid & Confirmed' : 'is with us'}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-jt-ink/65 dark:text-jt-steel">
          {paymentSuccessData ? (
            <>
              Thank you! Your payment of <strong>{formatPrice(subtotal)}</strong> via Flutterwave was verified. Transaction ID: <span className="font-tech text-jt-blue dark:text-jt-mint font-bold">{paymentSuccessData.transaction_id || paymentSuccessData.tx_ref}</span>. We are processing your order!
            </>
          ) : (
            <>
              Send your transfer receipt in the WhatsApp chat that just opened, quoting{' '}
              <strong className="text-jt-blue dark:text-jt-mint">{orderRef}</strong>. We confirm payment
              and dispatch immediately.
            </>
          )}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
            className="focus-ring rounded-full bg-jt-blue px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-jt-blue/25 transition-all hover:-translate-y-0.5 hover:bg-jt-blue-soft"
          >
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => {
            setCurrentView('shop');
            window.scrollTo(0, 0);
          }}
          className="focus-ring mb-7 inline-flex items-center gap-2 text-sm text-jt-ink/60 transition-colors hover:text-jt-blue dark:text-jt-steel dark:hover:text-jt-mint"
        >
          <ArrowLeft className="h-4 w-4" />
          Keep shopping
        </button>

        <h1 className="font-display text-3xl font-semibold text-jt-ink dark:text-white sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-jt-ink/60 dark:text-jt-steel">
          Order reference{' '}
          <span className="font-tech font-bold text-jt-blue dark:text-jt-mint">{orderRef}</span>
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-jt-ink/8 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-jt-ink-soft/50 sm:p-7">
              <h2 className="font-display text-lg font-semibold text-jt-ink dark:text-white">
                1. Customer Details
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" required>
                    Full name
                  </Label>
                  <input
                    id="name"
                    className={fieldBase}
                    placeholder="e.g. Chidi Okonkwo"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setErrors((x) => ({ ...x, fullName: '' }));
                    }}
                  />
                  {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
                </div>
                <div>
                  <Label htmlFor="ph" required>
                    Phone / WhatsApp
                  </Label>
                  <input
                    id="ph"
                    type="tel"
                    className={fieldBase}
                    placeholder="e.g. 0813 372 7813"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((x) => ({ ...x, phone: '' }));
                    }}
                  />
                  {errors.phone && <FieldError>{errors.phone}</FieldError>}
                </div>
              </div>

              <div className="mt-5">
                <Label htmlFor="em" required={paymentMode === 'flutterwave'}>
                  Email {paymentMode === 'flutterwave' ? '(Required for receipt)' : '(Optional)'}
                </Label>
                <input
                  id="em"
                  type="email"
                  className={fieldBase}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((x) => ({ ...x, email: '' }));
                  }}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </div>
            </div>

            <div className="rounded-3xl border border-jt-ink/8 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-jt-ink-soft/50 sm:p-7">
              <h2 className="font-display text-lg font-semibold text-jt-ink dark:text-white">
                2. Fulfilment Option
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {(
                  [
                    { key: 'delivery', label: 'Deliver to me', icon: Truck },
                    { key: 'pickup', label: 'Pick up in store', icon: Store },
                  ] as const
                ).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFulfilment(key)}
                    className={`focus-ring flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-semibold transition-all ${
                      fulfilment === key
                        ? 'border-jt-blue bg-jt-blue text-white shadow-md shadow-jt-blue/25'
                        : 'border-jt-ink/12 bg-white text-jt-ink hover:border-jt-blue/40 dark:border-white/12 dark:bg-jt-ink/60 dark:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>

              {fulfilment === 'delivery' ? (
                <div className="mt-5">
                  <Label htmlFor="addr" required>
                    Delivery address
                  </Label>
                  <textarea
                    id="addr"
                    rows={3}
                    className={`${fieldBase} resize-y`}
                    placeholder="Street, area, city and state, plus a landmark if it helps"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors((x) => ({ ...x, address: '' }));
                    }}
                  />
                  {errors.address && <FieldError>{errors.address}</FieldError>}
                </div>
              ) : (
                <div className="mt-5">
                  <Label htmlFor="br" required>
                    Pick up branch
                  </Label>
                  <select
                    id="br"
                    className={fieldBase}
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}, {b.street}, {b.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-5">
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <textarea
                  id="notes"
                  rows={2}
                  className={`${fieldBase} resize-y`}
                  placeholder="e.g. Please call when arriving"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-jt-ink/8 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-jt-ink-soft/50">
              <h2 className="font-display text-lg font-semibold text-jt-ink dark:text-white">
                Order Summary
              </h2>

              <ul className="mt-5 space-y-4">
                {cart.map((item) => (
                  <li key={item.product.id} className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <ProductImage
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        icon={item.product.icon}
                        seed={item.product.id}
                        iconClassName="h-7 w-7"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-jt-ink dark:text-white">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-jt-ink/55 dark:text-jt-steel">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-tech text-sm font-bold text-jt-ink dark:text-white">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-jt-ink/8 pt-4 dark:border-white/10">
                <span className="font-semibold text-jt-ink dark:text-white">Total</span>
                <span className="font-tech text-xl font-bold text-jt-blue dark:text-jt-mint">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-jt-ink/8 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-jt-ink-soft/50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-jt-ink dark:text-white mb-4">
                Select Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMode('flutterwave')}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left ${
                    paymentMode === 'flutterwave'
                      ? 'border-jt-blue bg-jt-blue/5 dark:bg-jt-blue/10 dark:border-jt-mint'
                      : 'border-jt-ink/10 dark:border-white/10'
                  }`}
                >
                  <CreditCard className={`h-5 w-5 mb-2 ${paymentMode === 'flutterwave' ? 'text-jt-blue dark:text-jt-mint' : 'text-gray-400'}`} />
                  <p className="font-bold text-sm text-jt-ink dark:text-white">Pay Online</p>
                  <p className="text-[11px] text-jt-ink/50 dark:text-jt-steel">Card, Transfer, USSD (Flutterwave)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('whatsapp')}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left ${
                    paymentMode === 'whatsapp'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-jt-ink/10 dark:border-white/10'
                  }`}
                >
                  <MessageCircle className={`h-5 w-5 mb-2 ${paymentMode === 'whatsapp' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <p className="font-bold text-sm text-jt-ink dark:text-white">Bank / WhatsApp</p>
                  <p className="text-[11px] text-jt-ink/50 dark:text-jt-steel">Manual Transfer & Chat Receipt</p>
                </button>
              </div>

              {paymentMode === 'flutterwave' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Secured 256-bit payment encrypted by Flutterwave</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePayOnline}
                    className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-full bg-jt-blue px-6 py-4 text-sm font-bold text-white shadow-lg shadow-jt-blue/25 transition-all hover:-translate-y-0.5 hover:bg-jt-blue-soft"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay {formatPrice(subtotal)} Now
                  </button>
                </div>
              )}

              {paymentMode === 'whatsapp' && (
                <div className="overflow-hidden rounded-2xl bg-jt-blue p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-jt-lime" />
                    <h4 className="text-sm font-semibold">Manual Bank Transfer</h4>
                  </div>

                  {!bankDetailsConfigured && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-2.5 text-xs text-amber-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Set bank account details in <code>src/config/site.ts</code></span>
                    </div>
                  )}

                  <CopyRow label="Bank" value={bankDetails.bankName} />
                  <CopyRow label="Account Name" value={bankDetails.accountName} />
                  <CopyRow label="Account Number" value={bankDetails.accountNumber} mono />
                  <CopyRow label="Narration / Ref" value={orderRef} mono />

                  <button
                    type="button"
                    onClick={confirmOnWhatsApp}
                    className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-jt-lime px-6 py-3.5 text-sm font-bold text-jt-ink transition-all hover:-translate-y-0.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Receipt on WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={confirmByEmail}
                    className="focus-ring mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    <Mail className="h-4 w-4" />
                    Send Receipt by Email
                  </button>
                  <p className="mt-2 text-center text-[11px] text-white/60">
                    Opens your email app addressed to {site.email}, attach your transfer receipt before sending.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldError: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
    {children}
  </p>
);