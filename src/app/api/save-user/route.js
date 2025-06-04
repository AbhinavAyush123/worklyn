import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { id, emailAddresses, firstName, lastName, imageUrl } = user;

  const { error } = await supabase
    .from('users')
    .upsert({
      id,
      email: emailAddresses[0]?.emailAddress,
      first_name: firstName,
      last_name: lastName,
      image_url: imageUrl,
    });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
