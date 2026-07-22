"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

export default function EditorLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/editor-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      
      if (response.ok) {
        router.push("/editor")
        return
      }
      setError(response.status === 503 ? "Editor password is not configured." : "Invalid password.")
    } catch (error) {
      console.error("Login failed:", error)
      setError("Login failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-secondary/50 border border-border rounded-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-serif text-foreground mb-4">Editor Access</h1>
        <p className="text-muted-foreground mb-6">
          Enter the editor password to continue.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-border bg-black/40 px-4 py-3 text-foreground outline-none focus:border-primary"
            autoComplete="current-password"
            aria-label="Editor password"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Enter Editor"}
          </button>
        </form>
      </div>
    </div>
  )
}
