import { NextResponse } from 'next/server'
import { EDITOR_AUTH_COOKIE } from "@/lib/editor-auth"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(EDITOR_AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
