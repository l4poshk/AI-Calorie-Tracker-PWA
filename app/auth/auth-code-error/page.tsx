import { AlertTriangle } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertTriangle className="h-12 w-12" />
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#3D4A3C]">
        Authentication Error
      </h1>

      <p className="mb-8 max-w-md text-base text-[#5C6B4F]">
        Something went wrong during the authentication process. The
        confirmation link may have expired or already been used.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <a
          href="/login"
          className="flex items-center justify-center gap-2 rounded-full bg-[#5C6B4F] px-6 py-3 text-sm font-medium text-[#FAF6F1] shadow-sm transition-colors hover:bg-[#4a563f] active:scale-95"
        >
          Back to Login
        </a>
        <a
          href="/signup"
          className="flex items-center justify-center gap-2 rounded-full border border-[#5C6B4F]/20 px-6 py-3 text-sm font-medium text-[#5C6B4F] transition-colors hover:bg-[#5C6B4F]/5 active:scale-95"
        >
          Create Account
        </a>
      </div>
    </main>
  );
}
