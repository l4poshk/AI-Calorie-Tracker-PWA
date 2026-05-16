import { redirect } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/server';
import { logout } from '@/src/actions/auth';
import { LogOut } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#3D4A3C]">
        Dashboard
      </h1>

      <p className="mb-2 text-base text-[#5C6B4F]">
        Welcome, <span className="font-medium">{user.email}</span>
      </p>

      <p className="mb-8 text-sm text-[#5C6B4F]/60">
        This placeholder will be replaced with the calorie logging UI in Phase 2.
      </p>

      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full border border-[#5C6B4F]/20 px-6 py-2.5 text-sm font-medium text-[#5C6B4F] transition-colors hover:bg-[#5C6B4F]/5 active:scale-95"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </main>
  );
}
