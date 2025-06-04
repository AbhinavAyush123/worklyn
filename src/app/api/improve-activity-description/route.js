import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function POST(req) {
  try {
    const { description } = await req.json();

    

    const prompt = `
        Improve the following job experience description for a resume with the following requirments
        -Enhance grammar, 
        -use professional and industry-relevant vocabulary, 
        -and focus on achievements and clarity. 
        -give one response ready to put into a resume
        -the response shouldn't need anymore information from me
        -dont assume information
        -dont make a template

        Description: ${description}
        `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error('Error improving description:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
