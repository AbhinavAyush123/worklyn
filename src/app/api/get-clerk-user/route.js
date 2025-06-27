import { NextResponse } from "next/server";


export async function POST(request) {
 const { userId } = await request.json();


 const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
 if (!CLERK_SECRET_KEY) {
   return NextResponse.json({ error: "Missing Clerk secret key" }, { status: 500 });
 }


 try {
   const res = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
     headers: {
       Authorization: `Bearer ${CLERK_SECRET_KEY}`,
       "Content-Type": "application/json",
     },
   });


   if (!res.ok) {
     const errorText = await res.text();
     return NextResponse.json({ error: errorText }, { status: res.status });
   }


   const data = await res.json();


   return NextResponse.json(data);
 } catch (err) {
   return NextResponse.json({ error: err.message }, { status: 500 });
 }
}





