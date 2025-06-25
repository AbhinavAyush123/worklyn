import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });




export async function POST(req) {
  try {
    const { jobTitle } = await req.json();

    if (!jobTitle) {
      throw new Error("Missing jobTitle in request body");
    }

    const prompt = `
Provide the salary data for the job title "${jobTitle}". Make sure you give accurate numbers and give high numbers to jobs that are high earning and vice versa. This should be exactly as a JSON object with the following structure:

{
  "percentiles": [
    {"percentile": 10, "salary": number},
    {"percentile": 20, "salary": number},
    {"percentile": 30, "salary": number},
    {"percentile": 40, "salary": number},
    {"percentile": 50, "salary": number},
    {"percentile": 60, "salary": number},
    {"percentile": 70, "salary": number},
    {"percentile": 80, "salary": number},
    {"percentile": 90, "salary": number}
  ],
  "summary": {
    "junior": { "yearly": number, "hourly": number },
    "mid": { "yearly": number, "hourly": number },
    "senior": { "yearly": number, "hourly": number },
    "average": { "yearly": number, "hourly": number }
  }
}

Return ONLY valid JSON, without any explanations or additional text.
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    let text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Log raw response from Gemini API to debug
    console.log("Gemini raw response text:", text);
    console.log("Using Gemini API key:", process.env.GEMINI_API_KEY ? "YES" : "NO");


    // Extract JSON from response (strip ```json or ``` if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to extract JSON from Gemini response:", text);
      throw new Error("Failed to parse AI JSON response");
    }

    const jsonText = jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error in /api/salary-trend:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
