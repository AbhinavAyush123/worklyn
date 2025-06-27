import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    // Get the interview ID from the request body
    const { interviewId } = await request.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    // 1. Create Daily.co room
    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
          enable_prejoin_ui: true,
        },
      }),
    });

    const roomData = await res.json();

    if (!res.ok || !roomData.url) {
      return NextResponse.json(
        { error: "Failed to create room", details: roomData },
        { status: 500 }
      );
    }

    // 2. Update the specific interview row
    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        meeting_link: roomData.url,
        started: true,
      })
      .eq("id", interviewId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update interview", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: roomData.url });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error", message: err.message },
      { status: 500 }
    );
  }
}