'use client';

import { useActionState } from 'react';
import { login } from '@/src/actions/auth';
import type { AuthActionState } from '@/src/actions/auth';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState | undefined,
    FormData
  >(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5C6B4F] text-[#FAF6F1]">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#3D4A3C]">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-[#5C6B4F]/70">
            Log in to your CalTracker account
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          {/* Error message */}
          {state?.error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-[#3D4A3C]"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6B4F]/40" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#5C6B4F]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#3D4A3C] outline-none transition-colors placeholder:text-[#5C6B4F]/40 focus:border-[#5C6B4F]/40 focus:ring-2 focus:ring-[#5C6B4F]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[#3D4A3C]"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6B4F]/40" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#5C6B4F]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#3D4A3C] outline-none transition-colors placeholder:text-[#5C6B4F]/40 focus:border-[#5C6B4F]/40 focus:ring-2 focus:ring-[#5C6B4F]/10"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C6B4F] py-2.5 text-sm font-medium text-[#FAF6F1] shadow-sm transition-all hover:bg-[#4a563f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Log in'
            )}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-[#5C6B4F]/70">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-[#5C6B4F] underline underline-offset-2 transition-colors hover:text-[#3D4A3C]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
