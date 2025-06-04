import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const user = await currentUser();
  const { receiverId } = await req.json();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data, error } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending',
    });

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
