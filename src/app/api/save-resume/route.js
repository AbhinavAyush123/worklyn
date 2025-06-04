import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    // 1. Get the authenticated Clerk user
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // 2. Look up your custom user by Clerk user ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId) // assumes your Clerk ID is stored as `id` in `users` table
      .single();

    if (userError || !user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 3. Create a new resume entry every time
    const resumeData = {
      user_id: user.id,
      contact_info: body.contact_info,
      summary: body.summary,
      skills: body.skills,
      work_experiences: body.work_experiences,
      education: body.education,
      activities: body.activities,
      sectionOrder: body.sectionOrder,
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('resumes')
      .insert([resumeData]);

    if (insertError) {
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Resume saved successfully' }, { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
