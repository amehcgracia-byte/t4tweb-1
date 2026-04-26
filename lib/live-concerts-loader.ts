import { createClient } from "next-sanity"

export interface LiveConcert {
  _editorId: number
  eventName: string
  locationName: string
  locationLink: string
  ticketUrl: string
  venue: string
  city: string
  country: string
  address: string
  date: string
  time: string
  status: string
  style: string
  genre: string
  capacity: string
  price: string
  locationUrl: string
  imageUrl: string
}

export interface LivePlatformLink {
  id: string
  name: string
  href: string
  category: "streaming" | "social"
}

export interface LiveSectionData {
  concerts: LiveConcert[]
  elementStyles: Record<string, Record<string, unknown>>
  backgroundImageUrl: string
  streamingPlatforms: LivePlatformLink[]
  socialPlatforms: LivePlatformLink[]
}

const DEFAULT_LIVE_BACKGROUND = "/images/sections/live-bg.jpg"

const DEFAULT_LIVE_STREAMING_PLATFORMS: LivePlatformLink[] = [
  { id: "live-streaming-spotify", name: "Spotify", href: "https://open.spotify.com/artist/0FHjK3O0k8HQMrJsF7KQwF", category: "streaming" },
  { id: "live-streaming-apple-music", name: "Apple Music", href: "https://music.apple.com/us/artist/tales-for-the-tillerman/1819840222", category: "streaming" },
  { id: "live-streaming-youtube-music", name: "YouTube Music", href: "https://music.youtube.com/channel/UCiSLr9s4NLC1kzHBqJirsrQ", category: "streaming" },
  { id: "live-streaming-soundcloud", name: "SoundCloud", href: "https://soundcloud.com/tales-for-the-tillerman", category: "streaming" },
  { id: "live-streaming-bandcamp", name: "Bandcamp", href: "https://talesforthetillerman.bandcamp.com/", category: "streaming" },
  { id: "live-streaming-amazon-music", name: "Amazon Music", href: "https://music.amazon.co.uk/artists/B0FCNWCSZC/tales-for-the-tillerman", category: "streaming" },
  { id: "live-streaming-tidal", name: "Tidal", href: "https://tidal.com/artist/61948400", category: "streaming" },
  { id: "live-streaming-deezer", name: "Deezer", href: "https://www.deezer.com/en/artist/330066641", category: "streaming" },
]

const DEFAULT_LIVE_SOCIAL_PLATFORMS: LivePlatformLink[] = [
  { id: "live-social-youtube", name: "YouTube", href: "https://www.youtube.com/@Tales4Tillerman", category: "social" },
  { id: "live-social-instagram", name: "Instagram", href: "https://www.instagram.com/tales4tillerman", category: "social" },
  { id: "live-social-tiktok", name: "TikTok", href: "https://www.tiktok.com/@tales.40.tilllerman", category: "social" },
  { id: "live-social-facebook", name: "Facebook", href: "https://www.facebook.com/profile.php?id=61575566232586", category: "social" },
]

export const MANUAL_LIVE_CONCERTS: LiveConcert[] = [
  {
    _editorId: 0,
    eventName: "Walpurgisnacht im Mauerpark Berlin",
    locationName: "Mauerpark",
    locationLink: "https://maps.google.com/?q=Mauerpark+Berlin",
    ticketUrl: "",
    venue: "Mauerpark",
    city: "Berlin",
    country: "Germany",
    address: "Bernauer Str. 63-64",
    date: "2026-04-30",
    time: "22:00",
    status: "Upcoming",
    style: "World Music",
    genre: "World Music",
    capacity: "500",
    price: "Free",
    locationUrl: "https://maps.google.com/?q=Mauerpark+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 1,
    eventName: "T4T Zuckerzauber Opening Berlin",
    locationName: "Zuckerzauber",
    locationLink: "https://maps.google.com/?q=Zuckerzauber+Berlin",
    ticketUrl: "",
    venue: "Zuckerzauber",
    city: "Berlin",
    country: "Germany",
    address: "",
    date: "2026-05-08",
    time: "20:00",
    status: "Upcoming",
    style: "Funk Soul",
    genre: "Funk Soul",
    capacity: "300",
    price: "12",
    locationUrl: "https://maps.google.com/?q=Zuckerzauber+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 14,
    eventName: "Wild at Heart Berlin",
    locationName: "Wild at Heart",
    locationLink: "https://maps.google.com/?q=Wild+at+Heart+Berlin",
    ticketUrl: "https://example.com/wild-at-heart-tickets",
    venue: "Wild at Heart",
    city: "Berlin",
    country: "Germany",
    address: "Wiener Str. 20",
    date: "2026-05-22",
    time: "20:00",
    status: "Upcoming",
    style: "World Music",
    genre: "World Music",
    capacity: "",
    price: "15",
    locationUrl: "https://maps.google.com/?q=Wild+at+Heart+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 2,
    eventName: "Werk 9 Berlin",
    locationName: "Werk 9",
    locationLink: "https://maps.google.com/?q=Werk+9+Berlin",
    ticketUrl: "",
    venue: "Werk 9",
    city: "Berlin",
    country: "Germany",
    address: "Eichenstrasse 4",
    date: "2024-11-30",
    time: "20:00",
    status: "Completed",
    style: "World Music",
    genre: "World Music",
    capacity: "",
    price: "",
    locationUrl: "https://maps.google.com/?q=Werk+9+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 3,
    eventName: "ART Stalker Berlin",
    locationName: "ART Stalker",
    locationLink: "https://maps.google.com/?q=ART+Stalker+Berlin",
    ticketUrl: "",
    venue: "ART Stalker",
    city: "Berlin",
    country: "Germany",
    address: "Schlesische Str. 6",
    date: "2024-12-13",
    time: "20:00",
    status: "Completed",
    style: "World Music",
    genre: "World Music",
    capacity: "",
    price: "",
    locationUrl: "https://maps.google.com/?q=ART+Stalker+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 4,
    eventName: "Horns Erben Leipzig",
    locationName: "Horns Erben",
    locationLink: "https://maps.google.com/?q=Horns+Erben+Leipzig",
    ticketUrl: "",
    venue: "Horns Erben",
    city: "Leipzig",
    country: "Germany",
    address: "Karl-Liebknecht-Straße 39",
    date: "2025-01-19",
    time: "20:00",
    status: "Completed",
    style: "Funk Soul",
    genre: "Funk Soul",
    capacity: "",
    price: "12",
    locationUrl: "https://maps.google.com/?q=Horns+Erben+Leipzig",
    imageUrl: "",
  },
  {
    _editorId: 5,
    eventName: "KAOS Berlin",
    locationName: "KAOS",
    locationLink: "https://maps.google.com/?q=KAOS+Berlin",
    ticketUrl: "",
    venue: "KAOS",
    city: "Berlin",
    country: "Germany",
    address: "",
    date: "2025-03-22",
    time: "20:00",
    status: "Completed",
    style: "World Music",
    genre: "World Music",
    capacity: "",
    price: "12",
    locationUrl: "https://maps.google.com/?q=KAOS+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 6,
    eventName: "Zuckerzauber Berlin",
    locationName: "Zuckerzauber",
    locationLink: "https://maps.google.com/?q=Zuckerzauber+Berlin",
    ticketUrl: "",
    venue: "Zuckerzauber",
    city: "Berlin",
    country: "Germany",
    address: "",
    date: "2025-05-23",
    time: "20:00",
    status: "Completed",
    style: "Funk Soul",
    genre: "Funk Soul",
    capacity: "",
    price: "15",
    locationUrl: "https://maps.google.com/?q=Zuckerzauber+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 7,
    eventName: "Kulturelle Landpartie Wendland",
    locationName: "Kulturelle Landpartie",
    locationLink: "https://maps.google.com/?q=Kulturelle+Landapie+Wendland",
    ticketUrl: "",
    venue: "Kulturelle Landpartie",
    city: "Wendland",
    country: "Germany",
    address: "",
    date: "2025-06-06",
    time: "16:00",
    status: "Completed",
    style: "World Music",
    genre: "World Music",
    capacity: "",
    price: "Free",
    locationUrl: "https://maps.google.com/?q=Kulturelle+Landapie+Wendland",
    imageUrl: "",
  },
  {
    _editorId: 8,
    eventName: "Sommersonnenwende Festival Grasleben",
    locationName: "Sommersonnenwende Festival",
    locationLink: "https://maps.google.com/?q=Sommersonnenwende+Festival+Grasleben",
    ticketUrl: "",
    venue: "Sommersonnenwende Festival",
    city: "Grasleben",
    country: "Germany",
    address: "",
    date: "2025-06-21",
    time: "16:00",
    status: "Completed",
    style: "Funk Soul",
    genre: "Funk Soul",
    capacity: "",
    price: "15",
    locationUrl: "https://maps.google.com/?q=Sommersonnenwende+Festival+Grasleben",
    imageUrl: "",
  },
  {
    _editorId: 9,
    eventName: "Mauerpark Berlin",
    locationName: "Mauerpark",
    locationLink: "https://maps.google.com/?q=Mauerpark+Berlin",
    ticketUrl: "",
    venue: "Mauerpark",
    city: "Berlin",
    country: "Germany",
    address: "Bernauer Str. 63-64",
    date: "2025-07-13",
    time: "16:00",
    status: "Completed",
    style: "World Music",
    genre: "World Music",
    capacity: "",
    price: "Free",
    locationUrl: "https://maps.google.com/?q=Mauerpark+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 10,
    eventName: "Privatclub Berlin",
    locationName: "Privatclub",
    locationLink: "https://maps.google.com/?q=Privatclub+Berlin",
    ticketUrl: "",
    venue: "Privatclub",
    city: "Berlin",
    country: "Germany",
    address: "Skalitzer Str. 85-86",
    date: "2025-07-20",
    time: "20:00",
    status: "Completed",
    style: "Funk Soul",
    genre: "Funk Soul",
    capacity: "",
    price: "15",
    locationUrl: "https://maps.google.com/?q=Privatclub+Berlin",
    imageUrl: "",
  },
  {
    _editorId: 11,
    eventName: "Uebel & Gefährlich Hamburg",
    locationName: "Uebel & Gefährlich",
    locationLink: "https://maps.google.com/?q=Uebel+%26+Gef%C3%A4hrlich+Hamburg",
    ticketUrl: "",
    venue: "Uebel & Gefährlich",
    city: "Hamburg",
    country: "Germany",
    address: "Feldstrasse 66",
    date: "2025-07-27",
    time: "20:00",
    status: "Completed",
    style: "World Music",
    genre: "World Music",
    capacity: "",
    price: "15",
    locationUrl: "https://maps.google.com/?q=Uebel+%26+Gef%C3%A4hrlich+Hamburg",
    imageUrl: "",
  },
  {
    _editorId: 12,
    eventName: "Schnabeltierfestival Münster",
    locationName: "Schnabeltierfestival",
    locationLink: "https://maps.google.com/?q=Schnabeltierfestival+M%C3%BCnster",
    ticketUrl: "",
    venue: "Schnabeltierfestival",
    city: "Münster",
    country: "Germany",
    address: "",
    date: "2025-08-22",
    time: "16:00",
    status: "Completed",
    style: "Funk Soul",
    genre: "Funk Soul",
    capacity: "",
    price: "15",
    locationUrl: "https://maps.google.com/?q=Schnabeltierfestival+M%C3%BCnster",
    imageUrl: "",
  },
  {
    _editorId: 13,
    eventName: "Waltweiser Festival Münster",
    locationName: "Waltweiser Festival",
    locationLink: "https://maps.google.com/?q=Waltweiser+Festival+M%C3%BCnster",
    ticketUrl: "",
    venue: "Waltweiser Festival",
    city: "Münster",
    country: "Germany",
    address: "",
    date: "2025-08-23",
    time: "16:00",
    status: "Completed",
    style: "World Music",
    genre: "World Music",
    capacity: "",
    price: "15",
    locationUrl: "https://maps.google.com/?q=Waltweiser+Festival+M%C3%BCnster",
    imageUrl: "",
  },
]

function normalizePrice(value: unknown): string {
  if (typeof value === "number") return String(value)
  if (typeof value === "string") return value
  return ""
}

function deriveConcertStatus(date: string, time: string, storedStatus?: string): string {
  const normalizedStatus = typeof storedStatus === "string" ? storedStatus.trim() : ""
  if (/cancelled/i.test(normalizedStatus)) return "Cancelled"
  if (!date) return "Upcoming"
  const iso = `${date}T${time && /^\d{2}:\d{2}/.test(time) ? time : "23:59"}:00`
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return normalizedStatus || "Upcoming"
  return parsed.getTime() < Date.now() ? "Completed" : "Upcoming"
}

function normalizeConcert(
  concert: {
    editorId?: number
    eventName?: string
    venue?: string
    locationName?: string
    address?: string
    city?: string
    country?: string
    date?: string
    time?: string
    status?: string
    genre?: string
    style?: string
    capacity?: string
    price?: unknown
    priceText?: string
    ticketUrl?: string
    locationUrl?: string
    locationLink?: string
    imageUrl?: string
  },
  fallbackId: number
): LiveConcert {
  const locationName = concert.locationName || concert.venue || ""
  const locationLink = concert.locationLink || concert.locationUrl || ""
  const ticketUrl = concert.ticketUrl || ""
  const style = concert.style || concert.genre || "World Music"
  return {
    _editorId: typeof concert.editorId === "number" ? concert.editorId : fallbackId,
    eventName: concert.eventName || locationName || `Concert ${fallbackId + 1}`,
    locationName,
    locationLink,
    ticketUrl,
    venue: locationName,
    city: concert.city || "",
    country: concert.country || "",
    address: concert.address || "",
    date: concert.date || "",
    time: concert.time || "",
    status: deriveConcertStatus(concert.date || "", concert.time || "", concert.status),
    style,
    genre: style,
    capacity: concert.capacity || "",
    price: normalizePrice(concert.price ?? concert.priceText),
    locationUrl: locationLink,
    imageUrl: concert.imageUrl || "",
  }
}

function mergePlatformLinks(
  incoming: unknown,
  defaults: LivePlatformLink[]
): LivePlatformLink[] {
  const incomingMap = new Map<string, LivePlatformLink>()
  if (Array.isArray(incoming)) {
    for (const item of incoming) {
      if (!item || typeof item !== "object") continue
      const id = typeof (item as { id?: unknown }).id === "string" ? (item as { id: string }).id.trim() : ""
      if (!id) continue
      const href = typeof (item as { href?: unknown }).href === "string" ? (item as { href: string }).href.trim() : ""
      const name = typeof (item as { name?: unknown }).name === "string" ? (item as { name: string }).name.trim() : ""
      incomingMap.set(id, {
        id,
        href,
        name: name || defaults.find((entry) => entry.id === id)?.name || id,
        category: (item as { category?: unknown }).category === "social" ? "social" : "streaming",
      })
    }
  }
  return defaults.map((entry) => {
    const stored = incomingMap.get(entry.id)
    return {
      ...entry,
      href: stored?.href || entry.href,
      name: stored?.name || entry.name,
    }
  })
}

export async function loadLiveSectionData(
  perspective: "published" | "drafts" = "published"
): Promise<LiveSectionData> {
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'qtpb6qpz',
      dataset: 'production',
      apiVersion: "2024-01-01",
      useCdn: false,
      perspective,
    })

    const [settings, sanityConcerts] = await Promise.all([
      client.fetch<{
        elementStyles?: Record<string, Record<string, unknown>>
        backgroundImageUrl?: string
        streamingPlatforms?: LivePlatformLink[]
        socialPlatforms?: LivePlatformLink[]
        concertsManagedByEditor?: boolean
      } | null>(
        `*[_type == "liveSection"][0]{
          elementStyles,
          "backgroundImageUrl": backgroundImage.asset->url,
          concertsManagedByEditor,
          streamingPlatforms,
          socialPlatforms
        }`
      ),
      client.fetch<
        Array<{
          editorId?: number
          eventName?: string
          venue?: string
          locationName?: string
          address?: string
          city?: string
          country?: string
          date?: string
          time?: string
          status?: string
          genre?: string
          style?: string
          capacity?: string
          price?: unknown
          priceText?: string
          ticketUrl?: string
          locationUrl?: string
          locationLink?: string
          imageUrl?: string
        }>
      >(
        `*[_type == "concert"] | order(date asc){
          editorId,
          eventName,
          venue,
          locationName,
          address,
          city,
          country,
          date,
          time,
          status,
          genre,
          style,
          capacity,
          price,
          priceText,
          ticketUrl,
          locationUrl,
          locationLink,
          "imageUrl": eventImage.asset->url
        }`
      ),
    ])

    const concertsManagedByEditor = settings?.concertsManagedByEditor === true
    const concertsBase =
      Array.isArray(sanityConcerts) && sanityConcerts.length > 0
        ? sanityConcerts.map((concert, index) => normalizeConcert(concert, index))
        : concertsManagedByEditor
          ? []
          : [...MANUAL_LIVE_CONCERTS]
    const wildAtHeartFallback = MANUAL_LIVE_CONCERTS.find((concert) => /wild at heart/i.test(concert.eventName)) || null
    const concerts =
      !concertsManagedByEditor &&
      wildAtHeartFallback &&
      !concertsBase.some((concert) => /wild at heart/i.test(concert.eventName || concert.locationName || ""))
        ? [...concertsBase, normalizeConcert(wildAtHeartFallback, concertsBase.length)].sort((a, b) => a.date.localeCompare(b.date))
        : concertsBase

    return {
      concerts,
      elementStyles:
        settings?.elementStyles &&
        typeof settings.elementStyles === "object" &&
        !Array.isArray(settings.elementStyles)
          ? settings.elementStyles
          : {},
      backgroundImageUrl: settings?.backgroundImageUrl || DEFAULT_LIVE_BACKGROUND,
      streamingPlatforms: mergePlatformLinks(settings?.streamingPlatforms, DEFAULT_LIVE_STREAMING_PLATFORMS),
      socialPlatforms: mergePlatformLinks(settings?.socialPlatforms, DEFAULT_LIVE_SOCIAL_PLATFORMS),
    }
  } catch (error) {
    console.error("[loadLiveSectionData]", error)
    return {
      concerts: [...MANUAL_LIVE_CONCERTS],
      elementStyles: {},
      backgroundImageUrl: DEFAULT_LIVE_BACKGROUND,
      streamingPlatforms: DEFAULT_LIVE_STREAMING_PLATFORMS,
      socialPlatforms: DEFAULT_LIVE_SOCIAL_PLATFORMS,
    }
  }
}

export async function loadLiveConcerts(): Promise<LiveConcert[]> {
  const data = await loadLiveSectionData()
  return data.concerts
}
