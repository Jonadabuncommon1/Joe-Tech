/**
 * Serves /product?id=<id> with that product's own photo, name and price in
 * the Open Graph tags, so a link shared to WhatsApp (or Facebook, Telegram,
 * iMessage, Twitter) previews the actual item instead of the Joe Tech logo.
 *
 * Why this has to run on the server: the storefront is a client-rendered
 * SPA, and every social crawler reads the raw HTML without executing any
 * JavaScript. Rewriting the meta tags from React after the page boots is
 * invisible to all of them, which is exactly why every shared product link
 * previewed with the same logo from index.html no matter what was shared.
 *
 * It returns the app's real index.html with only the meta tags swapped, so
 * a human following the link still lands on the normal SPA and the client
 * router picks the ?id= up as it always did. Any failure (no id, unknown
 * product, Supabase unreachable) falls through to the untouched HTML, so a
 * bad preview can never cost someone the actual page.
 *
 * Wired up by the /product rewrite in vercel.json. Does nothing under
 * `vite dev`, which doesn't run anything in /api.
 */

/** Escapes a value for use inside a double-quoted HTML attribute. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Replaces a meta tag's content, matching the tag however its attributes
 * happen to be ordered or wrapped across lines, and inserting it before
 * </head> if the document doesn't already carry one.
 */
function setMeta(html: string, attr: 'property' | 'name', key: string, value: string): string {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(value)}" />`;
  const existing = new RegExp(`<meta[^>]*\\s${attr}=["']${key.replace(':', '\\:')}["'][^>]*>`, 'i');
  if (existing.test(html)) return html.replace(existing, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

/** Only an absolute http(s) image can be an og:image; data: URIs can't. */
function usableImage(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  const found = images.find(
    (src) => typeof src === 'string' && /^https?:\/\//i.test(src),
  );
  return typeof found === 'string' ? found : null;
}

export default async function handler(req: any, res: any) {
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  const origin = `${proto}://${host}`;

  // The built SPA shell, fetched from this same deployment. /index.html is a
  // real file, so it's served straight off the filesystem without coming
  // back through the rewrite that sent us here.
  let html: string;
  try {
    const shell = await fetch(`${origin}/index.html`);
    html = await shell.text();
  } catch (err) {
    // Same-deployment static file, so this should not be reachable. A plain
    // error beats redirecting, which would drop the ?id= the page needs (or
    // bounce straight back through this same rewrite).
    console.error('product-preview: could not load index.html', err);
    res.status(503).send('Joe Tech is briefly unavailable. Please refresh in a moment.');
    return;
  }

  const send = (body: string) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Short shared cache: a crawler re-scraping a link should pick up an
    // edited name or a replaced photo the same day, not weeks later.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    res.status(200).send(body);
  };

  const id = typeof req.query?.id === 'string' ? req.query.id : '';
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!id || !supabaseUrl || !supabaseAnonKey) {
    send(html);
    return;
  }

  try {
    const query = new URL(`${supabaseUrl}/rest/v1/products`);
    query.searchParams.set('id', `eq.${id}`);
    query.searchParams.set('select', 'name,description,images,price');
    query.searchParams.set('limit', '1');

    const lookup = await fetch(query.toString(), {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    const rows = (await lookup.json()) as any[];
    const product = Array.isArray(rows) ? rows[0] : null;
    if (!product?.name) {
      send(html);
      return;
    }

    const image = usableImage(product.images);
    const price =
      typeof product.price === 'number' || typeof product.price === 'string'
        ? `₦${Number(product.price).toLocaleString('en-NG')}`
        : '';
    const title = price ? `${product.name} — ${price} | Joe Tech` : `${product.name} | Joe Tech`;
    const description =
      (typeof product.description === 'string' && product.description.trim()) ||
      'Tested, genuine and backed by warranty at Joe Tech.';

    html = setMeta(html, 'property', 'og:title', title);
    html = setMeta(html, 'property', 'og:description', description.slice(0, 200));
    html = setMeta(html, 'property', 'og:type', 'product');
    html = setMeta(html, 'property', 'og:url', `${origin}/product?id=${encodeURIComponent(id)}`);
    html = setMeta(html, 'name', 'twitter:title', title);
    html = setMeta(html, 'name', 'twitter:description', description.slice(0, 200));

    if (image) {
      html = setMeta(html, 'property', 'og:image', image);
      html = setMeta(html, 'property', 'og:image:alt', product.name);
      html = setMeta(html, 'name', 'twitter:image', image);
    }

    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`);

    send(html);
  } catch (err) {
    console.error('product-preview: lookup failed', err);
    send(html);
  }
}
