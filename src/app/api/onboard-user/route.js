import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { role } = await req.json();

  const { error } = await supabase
    .from('users')
    .update({ role, has_onboarded: true })
    .eq('id', user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
