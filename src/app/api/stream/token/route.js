// app/api/stream/token/route.js
import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

export const dynamic = 'force-dynamic'; // ✅ ensures it's server-rendered

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET // this must be defined in `.env`
);

export async function POST(req) {
  const { userId } = await req.json();

  const token = serverClient.createToken(userId);
  return NextResponse.json({ token });
}
