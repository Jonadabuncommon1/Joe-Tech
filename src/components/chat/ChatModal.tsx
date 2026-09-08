import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Mic,
  Paperclip,
  Send,
  X,
} from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { branches, contacts, site, mailLink, waLink } from '../../config/site';
import { formatPrice } from '../../data';
import { Product } from '../../types';
import { sendChatMessage, ChatMessage, ChatImage } from '../../lib/aiChat';

interface Message {
  id: string;
  sender: 'user' | 'cisco';
  text: string;
  timestamp: string;
  imageUrl?: string;
  quickActions?: { label: string; action: () => void }[];
}

/** Reads a File as base64 without the "data:...;base64," prefix Gemini doesn't want. */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ChatWidget: React.FC = () => {
  const { products, setCurrentView, setActiveCategory, setActiveProductId } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice input via the browser's built-in speech recognition, not every
  // browser has it (notably Firefox), so the mic button only renders when
  // it's actually available rather than showing a control that does nothing.
  const SpeechRecognitionCtor =
    typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-NG';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript;
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets picking the same file twice fire onChange again
    if (!file || !file.type.startsWith('image/')) return;
    if (attachedImage) URL.revokeObjectURL(attachedImage.previewUrl);
    setAttachedImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const removeAttachedImage = () => {
    if (attachedImage) URL.revokeObjectURL(attachedImage.previewUrl);
    setAttachedImage(null);
  };

  // The phone/browser back button used to close the whole site (or leave it
  // entirely) while the chat sat open on top, since isOpen had nothing to do
  // with browser history at all. Opening the chat now pushes a dedicated
  // history entry, so the first back-press just pops that entry and closes
  // the chat, the underlying page never moves. This is the same pattern any
  // mobile menu or dialog uses to make back close itself instead of the app.
  useEffect(() => {
    if (!isOpen) return;
    // Guarded rather than unconditional: React 19 StrictMode runs this
    // effect twice in dev (mount, cleanup, mount again), and the cleanup
    // only drops the popstate listener, it doesn't undo the pushState. An
    // unconditional push would land two history entries per open in dev, so
    // one back-press would pop the spare entry and leave the chat sitting
    // open, needing a second press. Skipping the push when we're already
    // sitting on a chatOpen entry keeps it to exactly one either way.
    if (!(window.history.state as { chatOpen?: boolean } | null)?.chatOpen) {
      window.history.pushState({ chatOpen: true }, '');
    }
    const onPopState = () => setIsOpen(false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isOpen]);

  // Closing via the X (or the launcher button while open) goes through here
  // instead of calling setIsOpen(false) directly, so the history entry
  // pushed above gets popped straight away rather than left behind, which
  // would otherwise need an extra, confusing back-press later to skip past.
  const closeChat = () => {
    if (window.history.state?.chatOpen) {
      window.history.back();
    } else {
      setIsOpen(false);
    }
  };

  // Derive latest uploads from live context, sorted explicitly by real
  // upload time rather than trusting the array's incoming order. It used to
  // be `[...products].reverse()`, which silently returned the 4 OLDEST
  // products: `products` already arrives newest-first from Supabase, so
  // reversing it put the oldest at the front, exactly backwards for a
  // "recent uploads" answer.
  const recentProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.created_at)
      .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
      .slice(0, 4);
  }, [products]);

  const openCategory = (id: string) => {
    setActiveCategory(id);
    setCurrentView('category');
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  const goToRepairs = () => {
    setCurrentView('services');
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  // Returns null when nothing local matches, rather than a canned "I'm
  // listening!" line every time, so the caller can escalate to a real,
  // conversational answer instead of repeating the same fallback forever.
  const generateCiscoResponse = (userText: string): { reply: string; quickActions?: { label: string; action: () => void }[] } | null => {
    const q = userText.toLowerCase().trim();

    // 1. Recent Uploads / What's New / Latest Arrivals
    if (
      q.includes('latest') ||
      q.includes('recent') ||
      q.includes('new arrival') ||
      q.includes('new product') ||
      q.includes('new upload') ||
      q.includes('what is new') ||
      q.includes("what's new") ||
      q.includes('fresh stock') ||
      q.includes('on your product') ||
      q.includes('what do you have today') ||
      q.includes('what do you have now') ||
      q.includes('just added') ||
      q.includes('just uploaded') ||
      q.includes('just dropped')
    ) {
      if (recentProducts.length === 0) {
        return {
          reply: "Our shelves are currently being updated! Check back shortly or browse our main store sections.",
          quickActions: [{ label: 'Browse Shop', action: () => openCategory('iphones') }],
        };
      }

      const listStr = recentProducts
        .map((p: Product) => `• ${p.name} — ${formatPrice(p.price)} (${p.condition || 'Stock Available'})`)
        .join('\n');

      return {
        reply: `Here are our latest arrivals & recent uploads directly from our shelves:\n\n${listStr}\n\nTap any item below to see specs or add it to your cart:`,
        quickActions: recentProducts.map((p: Product) => ({
          label: `${p.name.slice(0, 18)}...`,
          action: () => {
            setActiveProductId(p.id);
            setCurrentView('product');
            setIsOpen(false);
            window.scrollTo(0, 0);
          },
        })),
      };
    }

    // 2. Budget Queries
    const priceMatch = q.match(/under\s*(\d+)/) || q.match(/below\s*(\d+)/);
    if (priceMatch) {
      let limit = parseInt(priceMatch[1], 10);
      if (limit < 1000) limit = limit * 1000;
      const budgetItems = products.filter((p: Product) => p.price <= limit).slice(0, 4);

      if (budgetItems.length > 0) {
        const itemsList = budgetItems
          .map((p: Product) => `• ${p.name} — ${formatPrice(p.price)}`)
          .join('\n');
        return {
          reply: `Here is what we have in stock within your budget (under ${formatPrice(limit)}):\n\n${itemsList}`,
          quickActions: budgetItems.map((p: Product) => ({
            label: p.name.slice(0, 20),
            action: () => {
              setActiveProductId(p.id);
              setCurrentView('product');
              setIsOpen(false);
            },
          })),
        };
      }
    }

    // 3. Casual Greetings & Identity
    if (q.includes('how are you') || q.includes('how far') || q.includes('how r u')) {
      return {
        reply: "I'm running smoothly and up-to-date with all our latest stock! 🚀 What kind of gadget or service are you looking for today?",
      };
    }

    if (q.includes('who are you') || q.includes('your name') || q.includes('cisco')) {
      return {
        reply: "I'm Cisco, Joe Tech's automated tech advisor! I stay synced with all new product arrivals, test reports, pricing, and repair bookings across our Nsukka and Lagos branches.",
      };
    }

    // Loosened from exact-equality: that meant "hello there" or "hi Cisco!"
    // fell all the way through to the generic fallback instead of getting a
    // greeting back. Guarded to short messages so "hi, how much is the
    // iPhone 15" still gets treated as the real question it is.
    const isGreeting =
      q.length <= 20 &&
      /\b(hello|hi|hey|good day|good morning|good afternoon|good evening|howdy|yo)\b/.test(q);
    if (isGreeting) {
      const greetings = [
        "Hello! Great to have you at Joe Tech. Looking for a new phone, laptop, solar gear, or repair assistance?",
        "Hey! Cisco here. We have fresh tech stock on the shelves today. How can I help?",
        "Welcome! What can I help you find or check pricing for today?",
      ];
      return {
        reply: greetings[Math.floor(Math.random() * greetings.length)],
        quickActions: [
          { label: '✨ Recent Uploads', action: () => handleSend("What are the latest products uploaded?") },
          { label: '📱 View iPhones', action: () => openCategory('iphones') },
          { label: '💻 Laptops', action: () => openCategory('laptops') },
        ],
      };
    }

    // 4. Apple / iPhones / iPads
    if (q.includes('iphone') || q.includes('ipad') || q.includes('apple') || q.includes('airpods')) {
      const appleList = products.filter(
        (p: Product) =>
          p.name.toLowerCase().includes('iphone') ||
          p.name.toLowerCase().includes('ipad') ||
          p.category?.toLowerCase().includes('iphone')
      ).slice(0, 4);

      const itemsStr = appleList.map((p: Product) => `• ${p.name} — ${formatPrice(p.price)}`).join('\n');

      return {
        reply: `Here are our top Apple devices in stock (battery health tested, clean IMEI & iCloud free):\n\n${itemsStr || 'Full lineup available in store.'}`,
        quickActions: [
          { label: 'Browse All Apple Gear', action: () => openCategory('iphones') },
        ],
      };
    }

    // 5. Android / Samsung / Pixel / Tecno / Infinix
    if (q.includes('android') || q.includes('samsung') || q.includes('pixel') || q.includes('tecno') || q.includes('infinix') || q.includes('redmi')) {
      const androidList = products.filter(
        (p: Product) =>
          p.name.toLowerCase().includes('samsung') ||
          p.name.toLowerCase().includes('pixel') ||
          p.name.toLowerCase().includes('tecno') ||
          p.name.toLowerCase().includes('infinix') ||
          p.category?.toLowerCase().includes('android')
      ).slice(0, 4);

      const itemsStr = androidList.map((p: Product) => `• ${p.name} — ${formatPrice(p.price)}`).join('\n');

      return {
        reply: `Here are popular Android smartphones in stock:\n\n${itemsStr || 'Wide range from flagship to budget friendly.'}`,
        quickActions: [
          { label: 'Browse Androids', action: () => openCategory('android') },
        ],
      };
    }

    // 6. Laptops & Computers
    if (q.includes('laptop') || q.includes('macbook') || q.includes('dell') || q.includes('hp') || q.includes('lenovo') || q.includes('computer')) {
      const laptopList = products.filter(
        (p: Product) =>
          p.name.toLowerCase().includes('macbook') ||
          p.name.toLowerCase().includes('laptop') ||
          p.name.toLowerCase().includes('dell') ||
          p.name.toLowerCase().includes('hp') ||
          p.category?.toLowerCase().includes('laptop')
      ).slice(0, 4);

      const itemsStr = laptopList.map((p: Product) => `• ${p.name} — ${formatPrice(p.price)}`).join('\n');

      return {
        reply: `Here are our available laptops & MacBooks, pre-configured and tested:\n\n${itemsStr || 'Check our catalog for all specs.'}`,
        quickActions: [
          { label: 'Browse Laptops', action: () => openCategory('laptops') },
        ],
      };
    }

    // 7. Solar & Inverters
    if (q.includes('solar') || q.includes('inverter') || q.includes('battery') || q.includes('panel') || q.includes('tubular') || q.includes('lithium')) {
      return {
        reply: "We stock pure sine-wave hybrid inverters, long-lasting lithium & tubular batteries, and high-yield mono solar panels. We also handle site sizing and installations.",
        quickActions: [
          { label: 'Explore Solar Solutions', action: () => openCategory('solar') },
          { label: '💬 WhatsApp Solar Tech', action: () => window.open(waLink('Hello Joe Tech, I need an inverter/solar setup quote.'), '_blank') },
        ],
      };
    }

    // 8. Repairs & Diagnosis.
    // Bare 'screen' used to sit here and caught "screen protector" (a phone
    // accessory purchase) before it ever reached a real answer, confirmed
    // live: it returned "sorry your device is broken" for a shopping
    // question. 'broken screen'/'cracked screen'/'crack' below still catch
    // genuine repair intent without the bare word.
    if (q.includes('repair') || q.includes('fix') || q.includes('crack') || q.includes('broken screen') || q.includes('battery issue') || q.includes('fault') || q.includes('charge port')) {
      return {
        reply: "We provide 100% Free Diagnosis on every phone, laptop, and inverter! We diagnose the exact problem and quote you before any work starts. Most common repairs are finished same day with a 2-week warranty.",
        quickActions: [
          { label: '🛠️ Book Free Diagnosis', action: () => goToRepairs() },
          { label: '💬 Chat With Technician', action: () => window.open(waLink('Hello Joe Tech, I would like to book a repair.'), '_blank') },
        ],
      };
    }

    // 9. Store Locations & Contact
    if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('branch') || q.includes('lagos') || q.includes('nsukka')) {
      return {
        reply: `Visit us to test devices in person:\n\n📍 Nsukka Branch: ${branches[0]?.street || 'University Road'}, ${branches[0]?.city || 'Nsukka'}\n📍 Lagos Branch: ${branches[1]?.street || 'Computer Village'}, ${branches[1]?.city || 'Ikeja'}\n\n🕒 Mon - Sat: 8:00 AM – 7:00 PM`,
        quickActions: [
          { label: '📞 Call Support', action: () => window.open(`tel:${contacts.primary}`) },
        ],
      };
    }

    // 10. Direct Name Match in Current Inventory
    const directMatches = products.filter(
      (p: Product) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 3);

    if (directMatches.length > 0) {
      const list = directMatches.map((p: Product) => `• ${p.name} — ${formatPrice(p.price)}`).join('\n');
      return {
        reply: `I found these matching items in our live stock:\n\n${list}\n\nTap below to view details:`,
        quickActions: directMatches.map((p: Product) => ({
          label: p.name.slice(0, 20),
          action: () => {
            setActiveProductId(p.id);
            setCurrentView('product');
            setIsOpen(false);
          },
        })),
      };
    }

    // No local rule matched, nothing to return here, handleSend escalates
    // this to a real conversational answer instead of a repeated canned line.
    return null;
  };

  // Generic quick actions offered alongside a Gemini-generated reply, since
  // that path only produces text, not the category/product jump buttons the
  // local rules attach.
  const fallbackQuickActions = (userText: string) => [
    { label: '✨ What’s New?', action: () => handleSend("What are the latest products uploaded?") },
    { label: '🛍️ Browse Store', action: () => { setCurrentView('categories'); setIsOpen(false); } },
    { label: '💬 Talk to Agent', action: () => window.open(waLink(`Hello Joe Tech, I am asking about: ${userText}`), '_blank') },
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    const pendingImage = attachedImage;
    if (!query && !pendingImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query || 'Is this available?',
      imageUrl: pendingImage?.previewUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const history: ChatMessage[] = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedImage(null);
    setIsTyping(true);

    // A photo needs a real look, so it always goes to Gemini rather than the
    // instant local rules, which can only match keywords, not pixels. Either
    // way, offer a direct line to a human since neither channel can guarantee
    // certainty the way actually checking the shelf can.
    let response: { reply: string; quickActions?: { label: string; action: () => void }[] };
    if (pendingImage) {
      const base64 = await fileToBase64(pendingImage.file);
      const image: ChatImage = { base64, mimeType: pendingImage.file.type };
      const reply = await sendChatMessage(userMessage.text, history, products, image);
      const humanNote = `Hello Joe Tech, I have a photo of an item I'd like to ask about: ${userMessage.text}\n\n(Attach the photo to this ${'{channel}'} before sending.)`;
      response = {
        reply,
        quickActions: [
          {
            label: '💬 Send Photo on WhatsApp',
            action: () => window.open(waLink(humanNote.replace('{channel}', 'chat')), '_blank'),
          },
          {
            label: '✉️ Send Photo by Email',
            action: () => window.open(mailLink('Is this item available?', humanNote.replace('{channel}', 'email')), '_blank'),
          },
        ],
      };
    } else {
      // A local rule answers instantly with no network round trip; only a
      // message nothing local recognizes pays the cost of a real AI call.
      const local = generateCiscoResponse(query);
      response = local ?? {
        reply: await sendChatMessage(query, history, products),
        quickActions: fallbackQuickActions(query),
      };
    }

    const ciscoMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'cisco',
      text: response.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: response.quickActions,
    };
    setMessages((prev) => [...prev, ciscoMessage]);
    setIsTyping(false);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'cisco',
      text: "Hey there! 👋 I'm Cisco, your Joe Tech assistant. I'm synced with our latest inventory and pricing in real time!\n\nAsk me about our new arrivals, prices, store locations, or book a free diagnosis.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '✨ Latest Uploads', action: () => handleSend("What are the latest products uploaded?") },
        { label: '📱 Browse iPhones', action: () => openCategory('iphones') },
        { label: '💻 Laptops & MacBooks', action: () => openCategory('laptops') },
        { label: '🛠️ Free Repair Quote', action: () => goToRepairs() },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  return (
    <>
      {/* Floating Launcher with Glowing Cisco AI Avatar */}
      <div className="fixed bottom-5 right-5 z-50">
        <motion.button
          type="button"
          onClick={() => (isOpen ? closeChat() : setIsOpen(true))}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-jt-blue to-jt-blue-soft text-white shadow-[0_8px_25px_rgba(54,38,167,0.45)] border border-jt-mint/30"
          aria-label="Open Cisco AI Chat"
        >
          <span className="absolute -inset-1 animate-pulse rounded-full bg-jt-mint/25 blur-sm" />
          <span className="relative flex h-full w-full items-center justify-center">
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <div className="relative">
                <Bot className="h-7 w-7 text-jt-mint" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jt-lime opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-jt-lime" />
                </span>
              </div>
            )}
          </span>
        </motion.button>
      </div>

      {/* Chat Modal Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-22 right-4 z-50 flex h-[540px] max-h-[82vh] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-jt-blue/20 bg-white shadow-2xl dark:border-white/15 dark:bg-[#121620]"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between bg-gradient-to-r from-jt-blue via-jt-blue-deep to-jt-ink px-4 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-jt-mint/40 bg-jt-mint/15 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <Bot className="h-5 w-5 text-jt-mint" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-jt-lime ring-2 ring-jt-blue" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-display text-sm font-bold text-white">Cisco</p>
                    <span className="rounded-full bg-jt-mint/20 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-jt-mint">
                      AI Assistant
                    </span>
                  </div>
                  <p className="text-[11px] text-jt-steel">Live Inventory Synced · Ready to help</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeChat}
                className="rounded-full p-1.5 text-jt-steel hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-jt-paper/60 dark:bg-[#0D1017]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[88%]">
                    {m.sender === 'cisco' && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jt-blue/15 text-jt-blue dark:bg-jt-mint/15 dark:text-jt-mint">
                        <Bot size={13} />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'rounded-br-none bg-jt-blue text-white shadow-sm'
                          : 'rounded-bl-none border border-jt-ink/8 bg-white text-jt-ink shadow-sm dark:border-white/10 dark:bg-jt-ink-soft dark:text-white'
                      }`}
                    >
                      {m.imageUrl && (
                        <img
                          src={m.imageUrl}
                          alt="Attached"
                          className="mb-2 max-h-40 w-full rounded-xl object-cover"
                        />
                      )}
                      <p className="whitespace-pre-line">
                        {m.text.replace(/\*\*/g, '').split(/(Cisco)/gi).map((part, index) =>
                          part.toLowerCase() === 'cisco' ? (
                            <strong key={index} className="font-bold text-jt-blue dark:text-jt-mint">
                              {part}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  {m.quickActions && m.quickActions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-8">
                      {m.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={qa.action}
                          className="rounded-full border border-jt-blue/25 bg-white px-2.5 py-1 text-[11px] font-semibold text-jt-blue shadow-xs transition-all hover:bg-jt-blue hover:text-white dark:border-jt-mint/30 dark:bg-jt-ink-soft dark:text-jt-mint dark:hover:bg-jt-mint dark:hover:text-jt-ink"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="mt-1 text-[9px] text-jt-steel px-8">{m.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 pl-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-jt-blue/15 text-jt-blue dark:bg-jt-mint/15 dark:text-jt-mint">
                    <Bot size={13} />
                  </div>
                  <div className="rounded-2xl rounded-bl-none border border-jt-ink/8 bg-white px-3 py-2 text-xs text-jt-steel dark:border-white/10 dark:bg-jt-ink-soft">
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jt-blue dark:bg-jt-mint" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jt-blue dark:bg-jt-mint" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-jt-blue dark:bg-jt-mint" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached image preview, shown above the input while it waits to send */}
            {attachedImage && (
              <div className="flex items-center gap-2 border-t border-jt-ink/10 bg-white px-2.5 pt-2.5 dark:border-white/10 dark:bg-jt-ink-soft">
                <img src={attachedImage.previewUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <p className="flex-1 text-[11px] text-jt-steel">Photo attached, add a note or just send.</p>
                <button
                  type="button"
                  onClick={removeAttachedImage}
                  className="rounded-full p-1 text-jt-steel hover:bg-jt-ink/5 dark:hover:bg-white/10"
                  aria-label="Remove attached photo"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className={`flex items-center gap-1.5 bg-white p-2.5 dark:bg-jt-ink-soft ${
                attachedImage ? '' : 'border-t border-jt-ink/10 dark:border-white/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleAttachClick}
                title="Attach a photo of a product"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-jt-steel transition-colors hover:bg-jt-ink/5 hover:text-jt-ink dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Paperclip size={16} />
              </button>
              {SpeechRecognitionCtor && (
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop listening' : 'Speak your question'}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isListening
                      ? 'animate-pulse bg-red-500 text-white'
                      : 'text-jt-steel hover:bg-jt-ink/5 hover:text-jt-ink dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  <Mic size={16} />
                </button>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Ask about new arrivals, specs, repairs...'}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-jt-ink placeholder:text-jt-steel focus:outline-none dark:text-white"
              />
              <button
                type="submit"
                disabled={!input.trim() && !attachedImage}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-jt-blue text-white transition-opacity disabled:opacity-40 hover:bg-jt-blue-soft dark:bg-jt-mint dark:text-jt-ink"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};