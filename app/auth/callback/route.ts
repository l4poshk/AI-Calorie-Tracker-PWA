import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

/**
 * Auth callback handler for Supabase PKCE flow.
 *
 * After a user signs up or logs in via email, Supabase redirects them to:
 *   /auth/callback?code=<auth_code>
 *
 * This route handler exchanges the code for a session
 * and redirects the user to the dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        // In development, don't use x-forwarded-host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Auth code exchange failed — redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
