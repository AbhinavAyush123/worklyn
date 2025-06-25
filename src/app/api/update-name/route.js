// /app/api/update-name/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { userId, firstName, lastName } = await req.json();

  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to update name' }, { status: 400 });
  }

  const updatedUser = await res.json();
  return NextResponse.json(updatedUser);
}
