import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      userId,
      firstName,
      lastName,
      school,
      intendedMajor,
      bio,
      educationLevel,
      skills,
      resumeUrl,
      location,
      portfolioUrl,
      linkedinUrl,
    } = body;

    const { error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        school,
        intended_major: intendedMajor,
        bio,
        education_level: educationLevel,
        skills,
        resume_url: resumeUrl,
        location,
        portfolio_url: portfolioUrl,
        linkedin_url: linkedinUrl,
      })
      .eq('id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Profile updated' }), { status: 200 });
  } catch (err) {
    console.error('Server error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
