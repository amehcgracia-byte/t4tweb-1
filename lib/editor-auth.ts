import { createHmac, timingSafeEqual } from "crypto"

export const EDITOR_AUTH_COOKIE = "t4t-editor-auth"
export const EDITOR_AUTH_MAX_AGE_SECONDS = 60 * 60 * 8

const SESSION_PURPOSE = "t4t-editor-auth-v1"

export function getEditorPassword(): string | null {
  const password = process.env.EDITOR_PASSWORD?.trim()
  return password ? password : null
}

export function getEditorAuthSessionValue(password: string): string {
  return createHmac("sha256", password).update(SESSION_PURPOSE).digest("hex")
}

export function isEditorPasswordValid(input: unknown): boolean {
  const password = getEditorPassword()
  if (!password || typeof input !== "string") return false
  return constantTimeEqual(input, password)
}

export function isEditorCookieValueAuthorized(cookieValue: string | undefined): boolean {
  const password = getEditorPassword()
  if (!password || !cookieValue) return false
  return constantTimeEqual(cookieValue, getEditorAuthSessionValue(password))
}

export function isEditorRequestAuthorized(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || ""
  const cookies = parseCookieHeader(cookieHeader)
  return isEditorCookieValueAuthorized(cookies.get(EDITOR_AUTH_COOKIE))
}

function parseCookieHeader(header: string): Map<string, string> {
  const cookies = new Map<string, string>()
  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=")
    if (separatorIndex === -1) continue
    const name = part.slice(0, separatorIndex).trim()
    const value = part.slice(separatorIndex + 1).trim()
    if (name) cookies.set(name, decodeURIComponent(value))
  }
  return cookies
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}
