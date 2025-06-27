import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Make sure your Supabase client is set up
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  const { userId } = auth();
  const body = await req.json();
  const { roomUrl, studentId } = body;

  const { data, error } = await supabase.from("interviews").insert({
    recruiter_id: userId,
    student_id: studentId,
    meeting_link: roomUrl,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true, interview: data[0] });
}
