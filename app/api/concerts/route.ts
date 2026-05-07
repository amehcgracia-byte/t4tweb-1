import { NextResponse } from "next/server"
import { loadLiveConcerts } from "@/lib/live-concerts-loader"

export async function GET() {
  try {
    const concerts = await loadLiveConcerts()
    return NextResponse.json(concerts)
  } catch (error) {
    console.error("[api/concerts] failed to load live concerts", error)
    return NextResponse.json([], { status: 200 })
  }
}
