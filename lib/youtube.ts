const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{6,}$/

export function getYouTubeVideoId(input: string): string | null {
  try {
    const url = new URL(input)
    const hostname = url.hostname.toLowerCase()
    const isYouTubeHost = hostname === "youtube.com" || hostname.endsWith(".youtube.com") || hostname === "youtu.be"
    if (!isYouTubeHost) return null

    const pathParts = url.pathname.split("/").filter(Boolean)
    const candidate = hostname === "youtu.be"
      ? pathParts[0]
      : url.searchParams.get("v") || (
        (pathParts[0] === "embed" || pathParts[0] === "shorts" || pathParts[0] === "live")
          ? pathParts[1]
          : null
      )
    return candidate && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null
  } catch {
    return null
  }
}

export function toYouTubeEmbedUrl(input: string): string {
  const videoId = getYouTubeVideoId(input)
  if (!videoId) return input

  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    showinfo: "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}
