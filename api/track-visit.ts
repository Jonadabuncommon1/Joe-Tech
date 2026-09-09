import { createClient } from '@supabase/supabase-js';

/**
 * Logs one row per site visit: real IP address, rough location, device,
 * browser, referrer, and whichever page/view the visitor landed on. Fires
 * for EVERY visitor, signed in or not, unlike src/lib/visitorTracking.ts's
 * Firestore log which only ever records people who actually sign in.
 *
 * Deliberately not a Vite/React module: this only runs as a Vercel Node
 * serverless function (see vercel.json's rewrite, which now excludes
 * /api/ so this route actually reaches the function instead of getting
 * rewritten to index.html like every other path). It does nothing when
 * run locally under `vite dev`, since that server doesn't execute
 * anything under /api at all, only Vercel's own runtime does.
 *
 * Uses the same anon key the client already ships (available here as a
 * plain, non-VITE_-prefixed process.env read, no new secret needed), not
 * a service-role key. That's why the RLS policy on site_visits only grants
 * INSERT to anon, never SELECT: anyone with browser devtools open can see
 * this key regardless, so the row-level policy is the actual security
 * boundary, not the key being secret. Reading the table back is done from
 * Supabase's own Table Editor (that's your own login, not the anon key,
 * so RLS doesn't apply there), not through any public endpoint.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      res.status(200).json({ skipped: 'supabase not configured' });
      return;
    }

    const forwardedFor = (req.headers['x-forwarded-for'] as string | undefined) || '';
    const ip = forwardedFor.split(',')[0].trim() || req.socket?.remoteAddress || null;
    const userAgent = (req.headers['user-agent'] as string | undefined) || '';

    let body: any = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    } catch {
      // Malformed body shouldn't stop the visit from being logged at all.
    }

    const device = /tablet|ipad|playbook|silk/i.test(userAgent)
      ? 'Tablet'
      : /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
        ? 'Mobile'
        : 'Desktop';
    const browser = userAgent.includes('Edg')
      ? 'Edge'
      : userAgent.includes('Chrome')
        ? 'Chrome'
        : userAgent.includes('Firefox')
          ? 'Firefox'
          : userAgent.includes('Safari')
            ? 'Safari'
            : 'Other';

    // Set by Vercel's own edge network on every request, no geo-IP lookup
    // of our own needed. Only present in production, not local dev.
    const city = req.headers['x-vercel-ip-city'];

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('site_visits').insert({
      ip,
      country: req.headers['x-vercel-ip-country'] || null,
      region: req.headers['x-vercel-ip-country-region'] || null,
      city: city ? decodeURIComponent(city as string) : null,
      path: typeof body.path === 'string' ? body.path.slice(0, 200) : null,
      referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 500) : null,
      user_agent: userAgent.slice(0, 500),
      device,
      browser,
    });

    if (error) {
      console.error('track-visit insert error:', error.message);
    }

    res.status(200).json({ ok: !error });
  } catch (err) {
    console.error('track-visit error:', err);
    // Never surface this to the visitor, it's fire-and-forget from the page.
    res.status(200).json({ ok: false });
  }
}
