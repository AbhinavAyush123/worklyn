import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const user = await currentUser();
  const { senderId, action } = await req.json(); // action = 'accept' or 'reject'

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: action })
    .match({ sender_id: senderId, receiver_id: user.id });

  if (error) return new Response(error.message, { status: 500 });
  return new Response("Updated", { status: 200 });
}
