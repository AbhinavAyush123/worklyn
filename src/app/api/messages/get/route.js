import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  const user = await currentUser();
  const { otherUserId } = await req.json();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data);
}
