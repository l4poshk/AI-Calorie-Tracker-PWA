'use client';

import { useActionState } from 'react';
import { signup } from '@/src/actions/auth';
import type { AuthActionState } from '@/src/actions/auth';
import { UserPlus, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState | undefined,
    FormData
  >(signup, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5C6B4F] text-[#FAF6F1]">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#3D4A3C]">
            Create account
          </h1>
          <p className="mt-1 text-sm text-[#5C6B4F]/70">
            Start tracking your calories with AI
          </p>
        </div>

        {/* Success message */}
        {state?.message && (
          <div className="mb-4 flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

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
                minLength={6}
                placeholder="Min. 6 characters"
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
              'Create account'
            )}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-[#5C6B4F]/70">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-[#5C6B4F] underline underline-offset-2 transition-colors hover:text-[#3D4A3C]"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
