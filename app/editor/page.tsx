import HomePage from "../home-page"
import { VisualEditorBootTrigger, VisualEditorOverlay } from "@/components/visual-editor"
import { EDITOR_AUTH_COOKIE, isEditorCookieValueAuthorized } from "@/lib/editor-auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function EditorPage() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(EDITOR_AUTH_COOKIE)
  if (!isEditorCookieValueAuthorized(authCookie?.value)) {
    redirect("/editor/login")
  }

  const timestamp = new Date().toISOString()
  console.log(`[RUNTIME] EditorPage mounted at ${timestamp}`)

  // Render editor from the same published source of truth as the public page.
  // This keeps root-section layout parity stable after deploy/reload.
  return (
    <>
      <HomePage perspective="published" isEditorRoute={true} />
      <VisualEditorBootTrigger />
      <VisualEditorOverlay />
    </>
  )
}
