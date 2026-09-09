import React from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Wrench,
  X,
} from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { repairServices, formatPrice } from '../../data';
import { GadgetIcon } from '../ui/ProductImage';
import { branches, contacts, mailLink, site, waLink } from '../../config/site';

const DEVICE_TYPES = [
  'iPhone / iPad',
  'Android Phone',
  'Laptop',
  'Tablet',
  'Gaming Monitor / Console',
  'Inverter / Solar System',
  'Other',
];

const MAX_PHOTOS = 3;

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  deviceType: string;
  deviceModel: string;
  faultDescription: string;
  branch: string;
  serviceMode: 'drop-off' | 'pickup';
  preferredDate: string;
  urgency: 'standard' | 'express';
}

const EMPTY_FORM: FormState = {
  fullName: '',
  phone: '',
  email: '',
  deviceType: DEVICE_TYPES[0],
  deviceModel: '',
  faultDescription: '',
  branch: branches[0].name,
  serviceMode: 'drop-off',
  preferredDate: '',
  urgency: 'standard',
};

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

export const ServicesView: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = React.useState<'whatsapp' | 'email' | null>(null);

  // Object URLs must be revoked or they leak for the life of the page.
  React.useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [photos]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const incoming = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, room);
    setPhotos((p) => [...p, ...incoming]);
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = 'Please tell us your name';
    if (!form.phone.trim()) next.phone = 'We need a number to reach you on';
    else if (form.phone.replace(/\D/g, '').length < 10) next.phone = 'That number looks too short';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = 'That email address does not look right';
    if (!form.deviceModel.trim()) next.deviceModel = 'Which make and model is it?';
    if (!form.faultDescription.trim()) next.faultDescription = 'Describe the fault so we can quote';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /** Human-readable summary used for both the WhatsApp message and the email body. */
  const buildMessage = () =>
    [
      'REPAIR REQUEST, Joe Tech',
      '',
      `Name: ${form.fullName}`,
      `Phone: ${form.phone}`,
      form.email.trim() ? `Email: ${form.email}` : null,
      '',
      `Device: ${form.deviceType}, ${form.deviceModel}`,
      `Fault: ${form.faultDescription}`,
      '',
      `Branch: ${form.branch}`,
      `Service: ${form.serviceMode === 'pickup' ? 'Pickup requested' : 'I will drop it off'}`,
      form.preferredDate ? `Preferred date: ${form.preferredDate}` : null,
      `Urgency: ${form.urgency === 'express' ? 'Express / same-day' : 'Standard'}`,
      photos.length ? `\nI have ${photos.length} photo(s) of the fault to send.` : null,
    ]
      .filter(Boolean)
      .join('\n');

  const submitWhatsApp = () => {
    if (!validate()) return;
    const branch = branches.find((b) => b.name === form.branch) ?? branches[0];
    window.open(waLink(buildMessage(), branch.phone), '_blank', 'noopener');
    setSent('whatsapp');
  };

  const submitEmail = () => {
    if (!validate()) return;
    window.location.href = mailLink(
      `Repair request, ${form.deviceType} (${form.deviceModel})`,
      buildMessage(),
    );
    setSent('email');
  };

  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-jt-blue px-5 pb-20 pt-28 text-white sm:px-8 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 circuit-grid opacity-60" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full bg-jt-lime/25 blur-[120px]"
        />

        <div className="relative mx-auto max-w-7xl">
          <button
            onClick={() => {
              setCurrentView('home');
              window.scrollTo(0, 0);
            }}
            className="focus-ring mb-8 inline-flex items-center gap-2 text-sm text-jt-steel transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </button>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-jt-lime/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-jt-lime">
              <Wrench className="h-3.5 w-3.5" />
              Repair &amp; maintenance
              <span className="ml-1 inline-flex items-center gap-1.5 border-l border-jt-lime/25 pl-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jt-lime opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-jt-lime" />
                </span>
                Online 24/7
              </span>
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Bring it in broken.
              <br />
              <span className="text-gradient-lime">Leave with it working.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-jt-steel sm:text-lg">
              Phones, laptops, tablets, gaming gear, inverters and solar systems. Diagnosis is always
              free, you get a firm quote before we open anything.
            </p>
          </motion.div>

          {/* Contact strip */}
          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={`tel:${contacts.primary}`}
              className="focus-ring flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-colors hover:border-jt-mint/40 hover:bg-jt-mint/10"
            >
              <Phone className="h-5 w-5 shrink-0 text-jt-mint" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-jt-steel">Call / WhatsApp</p>
                <p className="truncate text-sm font-semibold">{contacts.primary}</p>
              </div>
            </a>
            <a
              href={`tel:${contacts.secondary}`}
              className="focus-ring flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-colors hover:border-jt-mint/40 hover:bg-jt-mint/10"
            >
              <Phone className="h-5 w-5 shrink-0 text-jt-mint" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-jt-steel">Call Line</p>
                <p className="truncate text-sm font-semibold">{contacts.secondary}</p>
              </div>
            </a>
            <a
              href={`mailto:${site.email}`}
              className="focus-ring flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-colors hover:border-jt-mint/40 hover:bg-jt-mint/10"
            >
              <Mail className="h-5 w-5 shrink-0 text-jt-mint" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-jt-steel">Email</p>
                <p className="truncate text-sm font-semibold">{site.email}</p>
              </div>
            </a>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <Clock className="h-5 w-5 shrink-0 text-jt-mint" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-jt-steel">Opening hours</p>
                <p className="truncate text-sm font-semibold">Mon–Sat, 8am–6pm</p>
              </div>
            </div>
          </div>

          {/* Branch addresses */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {branches.map((b) => (
              <div
                key={b.id}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-jt-lime" />
                <div>
                  <p className="text-sm font-semibold">{b.name}</p>
                  <p className="text-sm text-jt-steel">
                    {b.street}, {b.city}, {b.state}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service list ───────────────────────────────────────────────── */}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-semibold text-jt-ink dark:text-white sm:text-3xl">
            What we fix, and what it costs
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-jt-ink/60 dark:text-jt-steel">
            Prices start from the figures below. The final quote depends on the parts your device
            needs, and we tell you before we start.
          </p>

          <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {repairServices.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="rounded-2xl border border-jt-ink/8 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-jt-blue/30 hover:shadow-lg dark:border-white/10 dark:bg-jt-ink-soft/50"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-jt-blue/10 text-jt-blue dark:bg-jt-blue/20 dark:text-jt-mint">
                  <GadgetIcon name={svc.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-jt-ink dark:text-white">{svc.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-jt-ink/60 dark:text-jt-steel">
                  {svc.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-jt-ink/8 pt-3 dark:border-white/10">
                  <span className="font-tech text-sm font-bold text-jt-blue dark:text-jt-mint">
                    from {formatPrice(svc.fromPrice)}
                    {'priceNote' in svc && svc.priceNote ? ` ${svc.priceNote}` : ''}
                  </span>
                  <span className="text-[11px] text-jt-ink/45 dark:text-jt-steel">
                    {svc.turnaround}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking form ───────────────────────────────────────────────── */}
      <section id="book" className="bg-white px-5 py-16 dark:bg-jt-ink-soft/30 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-2xl font-semibold text-jt-ink dark:text-white sm:text-3xl">
              Book a repair
            </h2>
            <p className="mt-2 text-sm text-jt-ink/60 dark:text-jt-steel">
              Fill this in and send it straight to our WhatsApp, or email it to us. We reply the same
              day.
            </p>
          </div>

          {sent && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex items-start gap-3 rounded-2xl border border-jt-mint/40 bg-jt-mint/10 p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-jt-olive dark:text-jt-mint" />
              <div className="text-sm">
                <p className="font-semibold text-jt-ink dark:text-white">
                  {sent === 'whatsapp' ? 'WhatsApp is opening…' : 'Your email app is opening…'}
                </p>
                <p className="mt-1 text-jt-ink/70 dark:text-jt-steel">
                  {photos.length > 0
                    ? `Please attach your ${photos.length} photo(s) in the ${
                        sent === 'whatsapp' ? 'chat' : 'email'
                      } before sending, attachments cannot be added automatically.`
                    : 'Send the message and we will get straight back to you.'}
                </p>
              </div>
            </motion.div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitWhatsApp();
            }}
            className="mt-8 space-y-5 rounded-3xl border border-jt-ink/8 bg-jt-paper p-6 shadow-sm dark:border-white/10 dark:bg-jt-ink/50 sm:p-8"
          >
            {/* Name + phone */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName" required>
                  Your name
                </Label>
                <input
                  id="fullName"
                  className={fieldBase}
                  placeholder="e.g. Chidi Okonkwo"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                />
                {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
              </div>
              <div>
                <Label htmlFor="phone" required>
                  Phone / WhatsApp
                </Label>
                <input
                  id="phone"
                  type="tel"
                  className={fieldBase}
                  placeholder="e.g. 0813 372 7813"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
                {errors.phone && <FieldError>{errors.phone}</FieldError>}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <input
                id="email"
                type="email"
                className={fieldBase}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </div>

            {/* Device */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="deviceType" required>
                  Device type
                </Label>
                <select
                  id="deviceType"
                  className={fieldBase}
                  value={form.deviceType}
                  onChange={(e) => set('deviceType', e.target.value)}
                >
                  {DEVICE_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="deviceModel" required>
                  Make &amp; model
                </Label>
                <input
                  id="deviceModel"
                  className={fieldBase}
                  placeholder="e.g. iPhone 13 Pro, HP EliteBook 840"
                  value={form.deviceModel}
                  onChange={(e) => set('deviceModel', e.target.value)}
                />
                {errors.deviceModel && <FieldError>{errors.deviceModel}</FieldError>}
              </div>
            </div>

            <div>
              <Label htmlFor="fault" required>
                What is wrong with it?
              </Label>
              <textarea
                id="fault"
                rows={4}
                className={`${fieldBase} resize-y`}
                placeholder="e.g. Screen cracked after a fall. Touch still works but there are black patches at the bottom."
                value={form.faultDescription}
                onChange={(e) => set('faultDescription', e.target.value)}
              />
              {errors.faultDescription && <FieldError>{errors.faultDescription}</FieldError>}
            </div>

            {/* Photos */}
            <div>
              <Label htmlFor="photos">Photos of the fault (up to {MAX_PHOTOS})</Label>
              <div className="flex flex-wrap gap-3">
                {previews.map((url, i) => (
                  <div
                    key={url}
                    className="relative h-20 w-20 overflow-hidden rounded-xl border border-jt-ink/12 dark:border-white/12"
                  >
                    <img src={url} alt={`Fault photo ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      aria-label={`Remove photo ${i + 1}`}
                      className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-jt-ink/80 text-white transition-colors hover:bg-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {photos.length < MAX_PHOTOS && (
                  <label
                    htmlFor="photos"
                    className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-jt-ink/18 text-jt-ink/45 transition-colors hover:border-jt-blue hover:text-jt-blue dark:border-white/18 dark:text-jt-steel dark:hover:border-jt-mint dark:hover:text-jt-mint"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="text-[10px] font-semibold">Add</span>
                  </label>
                )}
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addPhotos(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-jt-ink/50 dark:text-jt-steel">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Photos are previewed here, then attached by you in the WhatsApp chat or email that
                opens, messaging apps do not accept attachments from a web link.
              </p>
            </div>

            {/* Branch + mode */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="branch" required>
                  Which branch?
                </Label>
                <select
                  id="branch"
                  className={fieldBase}
                  value={form.branch}
                  onChange={(e) => set('branch', e.target.value)}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}, {b.street}, {b.city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="serviceMode" required>
                  Drop-off or pickup?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['drop-off', 'pickup'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => set('serviceMode', mode)}
                      className={`focus-ring rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition-all ${
                        form.serviceMode === mode
                          ? 'border-jt-blue bg-jt-blue text-white shadow-md shadow-jt-blue/25'
                          : 'border-jt-ink/12 bg-white text-jt-ink hover:border-jt-blue/40 dark:border-white/12 dark:bg-jt-ink/60 dark:text-white'
                      }`}
                    >
                      {mode === 'drop-off' ? 'I will drop off' : 'Please collect'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date + urgency */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="date">Preferred date</Label>
                <input
                  id="date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={fieldBase}
                  value={form.preferredDate}
                  onChange={(e) => set('preferredDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="urgency">How urgent?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['standard', 'express'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => set('urgency', u)}
                      className={`focus-ring rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition-all ${
                        form.urgency === u
                          ? 'border-jt-lime bg-jt-lime text-jt-ink shadow-md shadow-jt-lime/25'
                          : 'border-jt-ink/12 bg-white text-jt-ink hover:border-jt-lime/50 dark:border-white/12 dark:bg-jt-ink/60 dark:text-white'
                      }`}
                    >
                      {u === 'express' ? 'Express' : 'Standard'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-3 border-t border-jt-ink/8 pt-6 dark:border-white/10 sm:flex-row">
              <button
                type="submit"
                className="focus-ring group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-jt-blue px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-jt-blue/25 transition-all hover:-translate-y-0.5 hover:bg-jt-blue-soft"
              >
                <MessageCircle className="h-4 w-4" />
                Send on WhatsApp
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={submitEmail}
                className="focus-ring inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-jt-ink/15 bg-white px-7 py-3.5 text-sm font-semibold text-jt-ink transition-all hover:-translate-y-0.5 hover:border-jt-blue hover:text-jt-blue dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:border-jt-mint dark:hover:text-jt-mint"
              >
                <Mail className="h-4 w-4" />
                Send as email
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

const FieldError: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500">
    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
    {children}
  </p>
);
