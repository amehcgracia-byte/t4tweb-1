import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD || 't4t-editor-2026'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password !== EDITOR_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('t4t-editor-auth', 'authorized', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
