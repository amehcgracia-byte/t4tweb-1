import { draftMode } from 'next/headers'
import HomePage from "../home-page"

export default async function EditorPage() {
  // Enable Draft Mode to fetch drafts from Sanity
  const draft = await draftMode()
  draft.enable()

  // Load editor state from previewDrafts perspective and mark as editor route
  // This ensures server-side rendering uses editor data, not published data
  // VisualEditorProvider will also detect /editor route on client and activate editor
  return <HomePage perspective="previewDrafts" isEditorRoute={true} />
}
