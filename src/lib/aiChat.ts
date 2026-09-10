
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product } from '../types';
import { formatPrice, getDisplayPrice, getMaxVariantPrice, hasVariants } from '../data';
import { branches, contacts, site } from '../config/site';

const branchLines = branches
  .map((b) => `${b.name}: ${b.street}, ${b.city}, ${b.state} (${b.hours})`)
  .join('. ');

/** A flat price for a plain listing, or a "from X to Y" range plus the
 *  option labels for a product with priced variants (e.g. storage sizes),
 *  so Cisco never quotes a single number for something that actually has
 *  several, or lists an option that's individually sold out as available. */
function priceLine(p: Product): string {
  if (!hasVariants(p)) return formatPrice(p.price);
  const low = getDisplayPrice(p);
  const high = getMaxVariantPrice(p);
  const options = p.variants!
    .map((v) => `${v.label} ${formatPrice(v.price)}${v.inStock === false ? ' [SOLD OUT]' : ''}`)
    .join(', ');
  return low === high ? formatPrice(low) : `from ${formatPrice(low)} to ${formatPrice(high)} (${options})`;
}

function buildSystemPrompt(products: Product[]): string {
  // This list is rebuilt from the live product state on every message, so it
  // always reflects whatever the admin dashboard currently has: new stock,
  // price changes, and in/out-of-stock status all show up here automatically.
  const productList = products.slice(0, 40).map(p =>
    `- ${p.name} (${p.category}): ${priceLine(p)}${p.description ? ' - ' + p.description : ''}${p.isNew ? ' [NEW]' : ''}${p.isTrending ? ' [TRENDING]' : ''}${p.inStock === false ? ' [OUT OF STOCK]' : ' [In stock]'}`
  ).join('\n');

  return `You are "Cisco", the shopping assistant for Joe Tech - a gadget retailer selling iPhones and iPads, Android phones, laptops and tablets, phone and laptop accessories, gaming monitors/chairs/tables, and solar power systems, with a repair and maintenance service.

The inventory list below is live, it reflects the store's current stock right now, including anything just added, re-priced, or marked out of stock by the team. Always answer availability and stock questions from this list, never from memory of an earlier conversation.

Branches and hours: ${branchLines}.

Your personality: professional, well-spoken and genuinely helpful, like a knowledgeable member of staff rather than a generic chatbot. Be warm without being flippant. Write in complete, well-formed sentences and give answers real substance, do not compress useful information down to a single throwaway line. Use at most one emoji per message, only when it genuinely adds warmth, never as a bullet-point decoration or a sign-off tic. Avoid slang and filler ("no wahala", exclamation-heavy phrasing); a light, natural Nigerian courtesy is fine ("you will love this") but the overall register should read as a trained customer service professional, not a chatty teenager.

How you respond: if a customer is describing a problem, frustration, or something broken (a cracked screen, a slow laptop, a delayed order, confusion about how something works), open with a brief, sincere line acknowledging the inconvenience before moving to the solution, then give the solution in full, not just the first step. Never launch straight into steps or information without first acknowledging how the customer feels. Be interactive: ask a clarifying follow-up question when it would help you serve them better, and invite them to keep chatting rather than giving one-and-done answers.

Your capabilities:
- Help customers find products by category, price range, or description
- Answer questions about the store (branches, hours, WhatsApp: 08133727813, Call lines: 08133727813 and 09071054193, email: ${site.email})
- Suggest trending/new arrival products
- Explain all the ways to get products from Joe Tech (see "Ways to get products" below)
- Explain repair and maintenance services and point customers to the booking form
- Recommend products based on customer needs or budget

Current store inventory:
${productList}

Ways to get products (mention the option that fits what the customer is asking, and offer the others when relevant):
1. Shop online: browse categories on the site, add to cart, go to Checkout, pay by bank transfer, then confirm the payment on WhatsApp with a receipt so the order can be arranged.
2. Order by WhatsApp/DM directly: message 08133727813 with the product name, and the team will sort out pricing, payment and delivery over chat, no need to use the cart at all.
3. Visit a branch in person: walk into Nsukka (Akuroad Market) or Ikeja, Lagos (Pepple Street) Monday to Saturday, 8am - 6pm, to see and buy products directly.
4. Nationwide delivery: after paying (online or via WhatsApp), items can be delivered anywhere in Nigeria, or picked up in-branch.

Repairs are booked through a separate form on the Repairs page (or by describing the issue here), which sends the request to WhatsApp or email.

Important rules:
- NEVER make up products not in the inventory above
- If asked about a product not in stock, say it's not currently available and suggest similar alternatives
- If the customer sounds upset, worried, or is reporting a problem, open with empathy before any solution
- Give complete answers. If a question has more than one part, or a natural next step the customer will need, cover it in the same reply rather than making them ask again
- Always end with a helpful follow-up question or suggestion when appropriate`;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function parsePriceQuery(message: string): { limit: number; type: 'under' | 'over' } | null {
  // Strip currency symbols and commas
  const cleanMsg = message.toLowerCase().replace(/[,₦]/g, '');

  // Match patterns like "50k", "50 k", "50000"
  const match = cleanMsg.match(/(\d+)\s*k\b|(\d+)/);
  if (!match) return null;

  let limit = 0;
  if (match[1]) {
    limit = parseInt(match[1]) * 1000;
  } else if (match[2]) {
    limit = parseInt(match[2]);
  }

  if (limit <= 0) return null;

  let type: 'under' | 'over' = 'under';

  if (cleanMsg.includes('under') ||
      cleanMsg.includes('below') ||
      cleanMsg.includes('less than') ||
      cleanMsg.includes('budget') ||
      cleanMsg.includes('max') ||
      cleanMsg.includes('cheap') ||
      cleanMsg.includes('within')) {
    type = 'under';
  } else if (cleanMsg.includes('more than') ||
             cleanMsg.includes('above') ||
             cleanMsg.includes('over') ||
             cleanMsg.includes('greater than') ||
             cleanMsg.includes('not lower') ||
             cleanMsg.includes('not below') ||
             cleanMsg.includes('min') ||
             cleanMsg.includes('higher') ||
             cleanMsg.includes('expensive') ||
             cleanMsg.includes('from')) {
    type = 'over';
  } else {
    // Context fallback: if asking for "best [price]" or "show me [price]"
    if (cleanMsg.includes('best') || cleanMsg.includes('show') || cleanMsg.includes('find')) {
      type = 'under';
    } else {
      return null; // Not a clear price constraint
    }
  }

  return { limit, type };
}

function getCategoryProducts(products: Product[], categoryNames: string[], limit = 4): string {
  const matches = products.filter(p =>
    categoryNames.some(cat => p.category?.toLowerCase().includes(cat.toLowerCase()))
  );
  if (matches.length === 0) return '';
  return matches.slice(0, limit).map(p =>
    `- **${p.name}** - ${priceLine(p)}${p.description ? ` _(${p.description.slice(0, 70)}...)_` : ''}`
  ).join('\n');
}

function findPredefinedAnswer(message: string, products: Product[]): string | null {
  const normalized = message.toLowerCase().trim();

  // 0. Price queries
  const priceQuery = parsePriceQuery(normalized);
  if (priceQuery) {
    const { limit, type } = priceQuery;
    // A variant product (e.g. a phone with 64/128/256GB options) qualifies
    // for "under X" if ANY option is cheap enough, and for "over X" if any
    // option is dear enough, not by its flat base price, which could be a
    // completely different number from what a customer would actually pay.
    let filtered = products.filter(p =>
      type === 'under' ? getDisplayPrice(p) <= limit : getMaxVariantPrice(p) >= limit,
    );
    if (type === 'under') {
      filtered.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    } else {
      filtered.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    }
    if (filtered.length > 0) {
      let reply = `Here are our best options **${type === 'under' ? 'under or up to' : 'starting from'} ${formatPrice(limit)}**:\n\n`;
      filtered.slice(0, 8).forEach(p => {
        reply += `- **${p.name}** (${p.category}) - **${priceLine(p)}**\n`;
        if (p.description) reply += `  _${p.description.slice(0, 80)}..._\n`;
      });
      reply += `\nWould you like help adding any of these to your cart?`;
      return reply;
    } else {
      return `We don't currently have items in that price range, but I'd be glad to point you toward the closest options if you tell me a bit more about what you need, or you're welcome to browse the full collection on the homepage.`;
    }
  }

  const containsAny = (...words: string[]) => words.some(word => normalized.includes(word));
  // Word-boundary version for short greeting words ("hi", "hey") that would
  // otherwise false-positive as substrings of ordinary words ("shipping",
  // "they").
  const containsWord = (...words: string[]) =>
    words.some((word) => new RegExp(`\\b${word}\\b`).test(normalized));

  // -1. Greetings and small talk. Checked first and answered instantly, with
  // no dependency on the Gemini connection, so "hello" never falls through to
  // a generic fallback line just because the API key is missing or rate
  // limited, the one thing customers notice most.
  if (containsAny('good morning', 'good afternoon', 'good evening', 'good day', 'goodmorning')) {
    return `Good day to you too! 👋 I'm Cisco, your Joe Tech assistant, doing well and ready to help. What are you shopping for today, phones, laptops, gaming gear, solar power, or a repair?`;
  }
  if (containsAny('how are you', 'how far', 'hows it going', "how's it going", 'how you dey', 'how you doing')) {
    return `I'm doing great, thanks for asking! 😊 What can I help you with, are you looking for something specific, or just browsing what's available?`;
  }
  // Guarded by length: a bare "hi"/"hello" is almost always short, while
  // "hi, how much is the iPhone 15" also contains "hi" but is a real
  // question that deserves a real answer, not just a greeting back.
  const isShortMessage = normalized.length <= 20;
  if (isShortMessage && (containsAny('hello', 'hello there', 'hiya') || containsWord('hi', 'hey', 'yo', 'howdy'))) {
    return `Hello! 👋 I'm Cisco, your Joe Tech assistant, and I'm well, thank you! I'm synced with our real stock, so ask me what we have today, prices, store locations, or how to book a free repair diagnosis. What can I do for you?`;
  }
  if (containsAny('thank you', 'thanks', 'thank u', 'thankyou', 'i appreciate', 'appreciate it')) {
    return `You're very welcome! Let me know if there's anything else, prices, availability, or how to place an order, I'm happy to help.`;
  }
  if (containsWord('bye', 'goodbye') || containsAny('see you', 'talk later')) {
    return `Take care! Come back anytime you have a question, or reach the team directly on WhatsApp at 08133727813 if it's urgent. 👋`;
  }

  // -0.5. Recently uploaded / "what's new today", genuinely sorted by real
  // upload time so the answer changes the moment something new goes live,
  // rather than depending on the admin remembering to tick "New"/"Trending".
  if (
    containsAny(
      'just added', 'just uploaded', 'newly added', 'new stock', 'just now',
      'uploaded', 'just dropped', 'just came in', 'newly arrived',
      'recently added', 'recently uploaded', 'added recently', 'uploaded recently',
      'recent upload', 'recent addition', 'latest upload', 'latest addition',
      'what do you have today', 'what do you have now', "what's new today",
      "what's on your product", 'whats on your product', "today's stock", 'todays stock',
    )
  ) {
    const recentlyUploaded = products
      .filter((p) => p.created_at)
      .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
      .slice(0, 6);
    if (recentlyUploaded.length > 0) {
      let reply = `Here's what we've added most recently:\n\n`;
      recentlyUploaded.forEach((p) => {
        reply += `- **${p.name}** (${p.category}) - **${priceLine(p)}**${p.inStock === false ? ' _(currently out of stock)_' : ''}\n`;
      });
      reply += `\nWant more detail on any of these, or is there something specific you're after?`;
      return reply;
    }
    // No timestamped uploads yet, fall through to the general answers below
    // rather than claiming a "recent" list that isn't real.
  }

  // Lowest / highest price
  if (containsAny('lowest price', 'cheapest', 'minimum price', 'least expensive', 'lowest')) {
    if (products.length > 0) {
      const p = [...products].sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b))[0];
      return `Our most affordable item right now is the **${p.name}** at **${priceLine(p)}** in the ${p.category} category!`;
    }
  }

  if (containsAny('highest price', 'most expensive', 'maximum price', 'priciest', 'highest')) {
    if (products.length > 0) {
      const p = [...products].sort((a, b) => getMaxVariantPrice(b) - getMaxVariantPrice(a))[0];
      return `Our top-of-the-line item right now is the **${p.name}** at **${priceLine(p)}** in the ${p.category} category!`;
    }
  }

  // 1. How to order
  if (containsAny('order', 'buy', 'purchase', 'checkout', 'how to shop', 'how do i shop', 'how can i shop', 'how do i buy', 'how to buy', 'ways to get', 'how to get')) {
    return `There are a few ways to order from Joe Tech, depending on what suits you best:

**Shop online:** browse a category, add items to your cart, go to Checkout & Pay by Transfer, then confirm your payment on WhatsApp with a receipt.
**Order by WhatsApp or DM:** message us the product name at 08133727813 and our team will handle pricing, payment and delivery directly in chat, no cart required.
**Visit a branch in person:** come to our Nsukka or Ikeja location, Monday to Saturday, 8am to 6pm, and shop in store.
**Delivery or pickup:** once payment is confirmed, we deliver nationwide, or you can collect from either branch.

Which of these would work best for you?`;
  }

  // 2. Location
  if (containsAny('located', 'location', 'address', 'where are you', 'where is', 'office', 'based', 'nigeria', 'lagos', 'nsukka', 'ikeja', 'headquarters', 'branch')) {
    return `We have two branches: **${branches[0].name}** at ${branches[0].street}, ${branches[0].city}, ${branches[0].state}, and **${branches[1].name}** at ${branches[1].street}, ${branches[1].city}, ${branches[1].state}. Both are open Monday to Saturday, 8am to 6pm, and we also deliver nationwide if you'd rather not visit in person.`;
  }

  // 3. Delivery
  if (containsAny('deliver', 'shipping', 'courier', 'send to', 'dispatch', 'transport')) {
    return `Yes, we deliver nationwide across Nigeria. Once you check out and confirm payment on WhatsApp, our team will confirm your delivery address and give you a timeline. If you'd rather not wait on delivery, you're also welcome to pick up from either branch after checkout.`;
  }

  // 4. Contact.
  // Bare 'phone' used to sit in this list and, confirmed live, hijacked
  // nearly every phone-related product question before it could reach the
  // iPhone/Android rules below: "iphone", "smartphone", and "android
  // phones" all contain it as a substring. 'call you'/'reach you' already
  // covered genuine "how do I contact you" intent without it.
  if (containsAny('contact', 'whatsapp', 'call you', 'reach you', 'support', 'email')) {
    return `You can reach our team directly by WhatsApp or call at 08133727813, by phone at 09071054193, or by email at ${site.email}. We're available Monday to Saturday, 8am to 6pm.`;
  }

  // 5. Trending / new arrivals, dynamic from real products.
  // 'hot' needs a word boundary: a plain substring check matched it inside
  // "photography", "hotel", "shot" and the like, confirmed live when a
  // completely unrelated gift-recommendation question got hijacked into a
  // trending-products list instead of ever reaching Gemini.
  if (containsAny('trending', 'trend', 'popular', 'new arrival', 'new arrivals', 'latest', 'what\'s new') || containsWord('hot')) {
    const trending = products.filter(p => p.isTrending || p.isNew).slice(0, 6);
    if (trending.length > 0) {
      let reply = `Here's what customers are asking for most right now:\n\n`;
      trending.forEach(p => {
        const badge = p.isNew ? ' (new arrival)' : p.isTrending ? ' (trending)' : '';
        reply += `- **${p.name}** (${p.category}) - **${priceLine(p)}**${badge}\n`;
      });
      reply += `\nWould you like more detail on any of these?`;
      return reply;
    }
    // fallback: show a selection across categories
    const sample = products.slice(0, 6);
    if (sample.length > 0) {
      let reply = `Here are some of our featured items right now:\n\n`;
      sample.forEach(p => {
        reply += `- **${p.name}** (${p.category}) - **${priceLine(p)}**\n`;
      });
      reply += `\nYou can see the full collection on the homepage.`;
      return reply;
    }
  }

  // 6. Repairs.
  // Bare 'screen' used to sit in this list and swallowed "screen protector"
  // questions (a phone-accessories purchase, not a repair) before that rule
  // ever got a turn. 'crack'/'broken' already cover "cracked/broken screen"
  // repair intent without it.
  if (containsAny('repair', 'fix', 'broken', 'crack', 'battery', 'not charging', 'water damage', 'service my', 'maintenance')) {
    return `Sorry to hear your device is giving you trouble, that's frustrating, but it's something we can sort out. We repair phones, laptops, tablets, gaming gear, inverters and solar systems. Diagnosis is always free, and most repairs are completed the same day. Head to the Repairs page (or tap the wrench icon below) for our price list and booking form, where you'll note the device, the fault, photos, your preferred branch, and whether you'd like to drop it off or have it picked up; it goes straight to WhatsApp or email from there. What device is it, and what's happening with it?`;
  }

  // 7–14. Category-specific, fully dynamic
  if (containsAny('iphone', 'ipad', 'apple')) {
    const items = getCategoryProducts(products, ['iphones-ipads']);
    if (items) return `Here's what we currently have in iPhones & iPads:\n\n${items}\n\nYou can see the full collection under the iPhones & iPads category on our homepage.`;
  }

  if (containsAny('android', 'samsung', 'pixel', 'tecno', 'infinix', 'xiaomi')) {
    const items = getCategoryProducts(products, ['android-phones']);
    if (items) return `Here are some Android phones currently in stock:\n\n${items}\n\nThe full collection is under the Android Phones category on our homepage.`;
  }

  if (containsAny('laptop', 'macbook', 'tablet', 'notebook', 'computer', 'pc ')) {
    const items = getCategoryProducts(products, ['laptops-tablets']);
    if (items) return `Here are some of our laptops and tablets:\n\n${items}\n\nYou'll find the full range under Laptops & Tablets on our homepage.`;
  }

  if (containsAny('phone accessor', 'charger', 'earbuds', 'airpods', 'power bank', 'phone case', 'screen protector')) {
    const items = getCategoryProducts(products, ['phone-accessories']);
    if (items) return `Here are some phone accessories we currently stock:\n\n${items}\n\nBrowse the full range under Phone Accessories on our homepage.`;
  }

  if (containsAny('laptop accessor', 'ssd', 'ram', 'docking', 'laptop bag', 'cooling pad')) {
    const items = getCategoryProducts(products, ['laptop-accessories']);
    if (items) return `Here are some laptop accessories in stock:\n\n${items}\n\nThe full range is under Laptop Accessories on our homepage.`;
  }

  if (containsAny('game', 'gaming', 'monitor', 'gaming chair', 'gaming desk', 'controller')) {
    const items = getCategoryProducts(products, ['gaming-setup']);
    if (items) return `Here's some of our gaming gear:\n\n${items}\n\nYou can view the full range under Gaming Monitors, Chairs & Table on our homepage.`;
  }

  if (containsAny('solar', 'inverter', 'battery', 'panel', 'power ')) {
    const items = getCategoryProducts(products, ['solar-power']);
    if (items) return `Here are some of our solar power options:\n\n${items}\n\nBrowse the full range under Solar Machines & Devices on our homepage.`;
  }

  // 15. General categories / inventory
  if (containsAny('sell', 'have', 'product', 'products', 'category', 'categories', 'item', 'items', 'inventory', 'stock', 'what do you do')) {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    const catList = cats.length > 0
      ? cats.map(c => `- **${c}**`).join('\n')
      : `- iPhones & iPads\n- Android Phones\n- Laptops & Tablets\n- Phone Accessories\n- Laptop Accessories\n- Gaming Monitors, Chairs & Table\n- Solar Machines & Devices\n- Repair & Maintenance Services`;
    return `Joe Tech carries these categories:\n\n${catList}\n\nYou're welcome to click into any of them from our homepage to see the full inventory.`;
  }

  // 16. Hours
  if (containsAny('hours', 'time', 'when are you open', 'opening', 'close', 'schedule', 'open days', 'saturday', 'monday', 'weekdays')) {
    return `Both branches are open Monday to Saturday, from 8am to 6pm. We're closed on Sundays.`;
  }

  return null;
}


export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  products: Product[],
): Promise<string> {
  // 1. Try local FAQ matcher first to give instant, bulletproof replies even if offline/blocked
  const faqAnswer = findPredefinedAnswer(message, products);
  if (faqAnswer) {
    return faqAnswer;
  }

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY || API_KEY.trim() === '') {
    return "I'm Cisco, here to help you find what you need. Feel free to browse our categories, add items to your cart and check out, or reach our team directly on WhatsApp if you'd rather speak with someone.";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY.trim());
    // Google retires dated model snapshots on a rolling basis - gemini-1.5-flash
    // and its direct successor gemini-2.5-flash are both gone already, each
    // confirmed by the API's own 404 when this was diagnosed. "-latest" is an
    // alias Google keeps pointed at whatever their current fast model is (in
    // production testing this resolved to gemini-3.8-flash), so this stops
    // going stale every time they ship a new generation.
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const systemMsg = buildSystemPrompt(products);

    // Format the entire history as a single text prompt to completely bypass Gemini's strict history validation rules
    let promptString = `[SYSTEM INSTRUCTIONS]\n${systemMsg}\n\n[CONVERSATION HISTORY]\n`;

    for (const msg of history) {
      const speaker = msg.role === 'assistant' ? 'Cisco' : 'User';
      promptString += `${speaker}: ${msg.content}\n\n`;
    }

    // Add the final prompt for the assistant to reply
    promptString += `Cisco: `;

    const result = await model.generateContent(promptString);
    const text = result.response.text();
    return text || "I couldn't generate a response. Please try asking again!";

  } catch (error: any) {
    console.error('Gemini API error:', error);
    const msg = error?.message || '';

    if (msg.includes('API_KEY') || msg.includes('api key') || msg.includes('API key')) {
      return "I'm Cisco, here to help you find what you need. Feel free to browse our categories, add items to your cart and check out, or reach our team directly on WhatsApp if you'd rather speak with someone.";
    }
    if (msg.includes('quota') || msg.includes('QUOTA')) {
      return "I've reached my usage limit for the moment. Please try again in a few minutes, or reach our team directly on WhatsApp in the meantime.";
    }
    // Google's model genuinely being overloaded (HTTP 503, occasionally 429)
    // used to fall into the network/adblocker branch below purely because the
    // SDK's error is a TypeError, which told customers to disable Brave
    // Shields or switch off their VPN for a problem that had nothing to do
    // with their connection at all, confirmed live against the real API.
    if (error?.status === 503 || error?.status === 429 || msg.includes('overloaded') || msg.includes('UNAVAILABLE') || msg.includes('try again later')) {
      return "Our AI assistant is a little overloaded right now, that's on our end, not your connection. Please try again in a moment, or message our team directly on WhatsApp at 08133727813 if it's urgent.";
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch') || error instanceof TypeError) {
      return `I'm having trouble connecting right now. This is usually caused by an adblocker (such as Brave Shields or uBlock Origin) blocking the connection, or a VPN or restrictive network. If you're on Brave, try turning off Shields for this site; otherwise, an incognito window or mobile data connection usually resolves it.

In the meantime, here's what you likely need:
- **How to buy:** add items to your cart, go to Checkout, pay by transfer, then confirm on WhatsApp.
- **Location:** Nsukka (Akuroad Market) and Ikeja, Lagos (Pepple Street). We also deliver nationwide.
- **Repairs:** diagnosis is free and most repairs are completed the same day, book on the Repairs page.

You're also welcome to browse the collection directly, or message our team on WhatsApp from any product or the cart.`;
    }
    // Return the actual error to help debugging
    return `Error: ${msg || 'Unknown error. Check browser console for details.'}`;
  }
}
