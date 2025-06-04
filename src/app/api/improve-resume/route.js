import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req) {
  try {
    const { summary } = await req.json();

    // Use template literal correctly with backticks, not single quotes
    const prompt = `
        Please improve the following resume summary by:
        - Correcting grammar and punctuation
        - Enhancing sentence flow and clarity
        - Keeping the tone formal and confident
        -no template
        -keep in mind this is a highschool student
        -give me one correct response
        -the response should be complete and ready to put into a resume without my input
        Here is the summary:

${summary}
`;

    // generateContent expects an object with contents array
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    // Extract generated text
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ result: text });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
