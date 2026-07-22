import { NextResponse } from 'next/server'
import {
  EDITOR_AUTH_COOKIE,
  EDITOR_AUTH_MAX_AGE_SECONDS,
  getEditorAuthSessionValue,
  getEditorPassword,
  isEditorPasswordValid,
} from "@/lib/editor-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { password?: unknown }
    const password = getEditorPassword()

    if (!password) {
      return NextResponse.json({ success: false, error: "Editor password is not configured." }, { status: 503 })
    }

    if (!isEditorPasswordValid(body.password)) {
      return NextResponse.json({ success: false, error: "Invalid editor password." }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(EDITOR_AUTH_COOKIE, getEditorAuthSessionValue(password), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: EDITOR_AUTH_MAX_AGE_SECONDS,
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
