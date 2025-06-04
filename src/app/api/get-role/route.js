import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    return new Response('Error fetching role', { status: 500 });
  }

  return new Response(JSON.stringify({ role: data.role }), { status: 200 });
}
