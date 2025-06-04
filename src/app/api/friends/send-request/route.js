import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const user = await currentUser();
  const { receiverId } = await req.json();

  if (!user || !receiverId) return new Response("Invalid", { status: 400 });

  const { error } = await supabase.from('friend_requests').insert({
    sender_id: user.id,
    receiver_id: receiverId
  });

  if (error) return new Response(error.message, { status: 500 });
  return new Response("Request sent", { status: 200 });
}
