import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const user = await currentUser();
  const { receiverId, content } = await req.json();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: friendship } = await supabase
    .from('friend_requests')
    .select()
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId},status.eq.accepted),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id},status.eq.accepted)`);

  if (!friendship.length)
    return new Response("You are not friends.", { status: 403 });

  const { error } = await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content
  });

  if (error) return new Response(error.message, { status: 500 });
  return new Response("Message sent", { status: 200 });
}
