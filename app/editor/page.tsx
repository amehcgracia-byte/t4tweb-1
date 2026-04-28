import HomePage from "../home-page"

export const dynamic = "force-dynamic"

export default async function EditorPage() {
  const timestamp = new Date().toISOString()
  console.log(`[RUNTIME] EditorPage mounted at ${timestamp}`)

  // Render editor from the same published source of truth as the public page.
  // This keeps root-section layout parity stable after deploy/reload.
  return <HomePage perspective="published" isEditorRoute={true} />
}
