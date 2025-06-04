import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data, error } = await supabase
    .from('friend_requests')
    .select('*')
    .or(`and(sender_id.eq.${user.id},status.eq.accepted),and(receiver_id.eq.${user.id},status.eq.accepted)`);

  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data);
}
