import { redirect } from 'next/navigation';
import { createClient } from '@/src/lib/supabase/server';
import HistoryClient from '@/src/components/History/HistoryClient';

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <HistoryClient userEmail={user.email ?? 'User'} />;
}
