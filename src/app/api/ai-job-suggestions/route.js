import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })


export async function POST(req) {
 try {
   const { query } = await req.json()


   const { data: jobs, error } = await supabase.from('job_listings').select('*').limit(100)
   if (error) throw error


   const prompt = `
You are an AI that matches job listings to user input.


User input: "${query}"


Here is a list of jobs:
${JSON.stringify(jobs, null, 2)}


Pick the top 3-5 relevant jobs. Return ONLY a JSON array of objects like:
[
 {
   "id": "job_uuid",
   "title": "Job Title",
   "company": "Company Name",
   "reason": "Why this job is a good match"
 }
]
Do not include markdown, text, or explanations. Only raw JSON.
   `


   const result = await model.generateContent(prompt)
   const text = result.response.text()


   // Try to extract JSON safely using regex
   const jsonMatch = text.match(/\[\s*{[\s\S]*?}\s*]/)


   if (!jsonMatch) throw new Error('Could not extract JSON array from AI response.')


   const matches = JSON.parse(jsonMatch[0])


   return NextResponse.json({ matches })
 } catch (err) {
   console.error('AI parsing error:', err)
   return NextResponse.json({ error: 'AI suggestion failed' }, { status: 500 })
 }
}





