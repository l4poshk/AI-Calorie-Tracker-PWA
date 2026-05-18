import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/src/types/supabase';

/**
 * Refreshes the user's Supabase session on every navigation.
 *
 * IMPORTANT (Next.js 16): `middleware.ts` is deprecated and renamed to `proxy.ts`.
 * The exported function must be named `proxy` (not `middleware`).
 *
 * This runs BEFORE any page/component rendering.
 * It reads cookies, refreshes the token if expired,
 * and writes updated cookies back to the response.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 1. Set cookies on the request (so downstream server components see them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // 2. Create a fresh response that carries the updated request headers
          supabaseResponse = NextResponse.next({
            request,
          });

          // 3. Set cookies on the response (so browser receives Set-Cookie headers)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );

          // 4. Apply cache-busting headers from Supabase SSR
          //    (prevents CDN from caching responses with Set-Cookie)
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value),
            );
          }
        },
      },
    },
  );

  // IMPORTANT: Do NOT use getSession() for auth decisions.
  // getUser() contacts the Auth server to verify the token.
  // Calling getUser() also triggers token refresh if the session is expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth route protection: redirect unauthenticated users away from /dashboard
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public assets (icons, images, sw.js, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons/|manifest.webmanifest|sw.js|workbox-.*\\.js).*)',
  ],
};
