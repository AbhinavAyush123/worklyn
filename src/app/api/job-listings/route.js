import { supabase } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req) {
  const { userId } = await getAuth(req);

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { title, description, company, location, salary } = await req.json();

  const { data, error } = await supabase.from('job_listings').insert([
    {
      title,
      description,
      company,
      location,
      salary,
      posted_by: userId,
    },
  ]).select(); // 👈 forces Supabase to return the inserted row(s)

  if (error) {
    console.error('Insert error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!data || data.length === 0) {
    console.error('No data returned from Supabase insert');
    return new Response(JSON.stringify({ error: 'Insert succeeded but no data returned' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, job: data[0] }), { status: 200 });
}
