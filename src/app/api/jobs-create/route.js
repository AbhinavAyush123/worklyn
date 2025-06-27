import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@clerk/nextjs/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key here for full insert rights
)

export async function POST(req) {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const {
      title,
      description,
      company,
      location,
      salary,
      job_type,
      experience,
      work_mode,
      tags,
      image_url,
    } = body

    // Validate required fields
    if (!title || !company) {
      return NextResponse.json(
        { error: 'Missing required fields: title and company' },
        { status: 400 }
      )
    }

    // Insert job listing
    const { data, error } = await supabase.from('job_listings').insert([
      {
        title,
        description,
        company,
        location,
        salary,
        job_type,
        experience,
        work_mode,
        tags,
        image_url,
        posted_by: userId,
      },
    ])

    if (error) {
      console.error('Insert Error:', error)
      return NextResponse.json({ error: 'Failed to post job' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (e) {
    console.error('API Error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
