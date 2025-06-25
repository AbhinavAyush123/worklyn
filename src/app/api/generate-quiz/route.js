import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@clerk/nextjs/server'




const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })


export async function POST(req) {
 try {
   // Authentication
   const { userId } = getAuth(req)
   if (!userId) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }


   // Request validation
   let requestBody
   try {
     requestBody = await req.json()
   } catch (err) {
     return NextResponse.json(
       { error: 'Invalid request body' },
       { status: 400 }
     )
   }


   const { topic } = requestBody
   if (!topic || typeof topic !== 'string') {
     return NextResponse.json(
       { error: 'Topic is required and must be a string' },
       { status: 400 }
     )
   }


   // AI Prompt
   const prompt = `
     Generate a list of 10 interview questions on the topic: "${topic}".
     Provide each question with 4 answer choices and indicate the correct answer with an explanation.
     Format the response as valid JSON and only JSON, without any markdown code blocks or additional text:
     [
       {
         "question": "...",
         "choices": ["...", "...", "...", "..."],
         "answer": "...",
  
       }
     ]
   `


   // AI Response
   let questions
   try {
     const result = await model.generateContent(prompt)
     const response = await result.response
     const text = response.text()
    
     // Improved JSON extraction
     let jsonString = text.trim()
       .replace(/^```(json)?/, '')  // Remove starting ```
       .replace(/```$/, '')         // Remove ending ```
       .trim()


     questions = JSON.parse(jsonString)
    
     // Validate the questions structure
     if (!Array.isArray(questions)) {
       throw new Error('AI response is not an array')
     }


     // Additional validation
     if (questions.length === 0) {
       throw new Error('No questions generated')
     }


     for (const question of questions) {
       if (!question.question || !question.choices || !question.answer) {
         throw new Error('Invalid question structure')
       }
       if (question.choices.length !== 4) {
         throw new Error('Each question must have 4 choices')
       }
       if (!question.choices.includes(question.answer)) {
         throw new Error('Correct answer must be one of the choices')
       }
     }
   } catch (err) {
     console.error('AI response error:', err)
     return NextResponse.json(
       {
         error: 'Failed to generate questions',
         details: err.message,
         rawResponse: text || 'No response text'
       },
       { status: 500 }
     )
   }


   // Database insertion
   try {
     const { data, error } = await supabase
       .from('quizzes')
       .insert({
         user_id: userId,
         topic,
         questions,
         progress: 0,
         score: null,
       })
       .select()
       .single()


     if (error) throw error


     return NextResponse.json(data)
   } catch (err) {
     console.error('Database error:', err)
     return NextResponse.json(
       {
         error: 'Failed to save quiz',
         details: err.message,
         supabaseError: err.code || 'No error code'
       },
       { status: 500 }
     )
   }


 } catch (error) {
   console.error('Unexpected error:', error)
   return NextResponse.json(
     {
       error: 'Internal server error',
       details: error.message,
       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
     },
     { status: 500 }
   )
 }
}



