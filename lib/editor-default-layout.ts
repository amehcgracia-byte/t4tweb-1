export interface DefaultSectionLayoutPresetEntry {
  x: number
  y: number
  width: number
  height: number
  scale?: number
}

export const SAFE_SECTION_ORDER = [
  "hero-section",
  "intro-section",
  "latest-release-section",
  "about-section",
  "press-kit-section",
  "band-members-section",
  "live-section",
  "contact-section",
  "footer-section",
] as const

export const SAFE_FLOW_PROTECTED_SECTION_IDS = [
  "about-section",
  "press-kit-section",
  "band-members-section",
  "live-section",
  "contact-section",
  "footer-section",
] as const

export const SAFE_SECTION_MIN_GAP = 56

export const DEFAULT_SECTION_LAYOUT_PRESET: Record<string, DefaultSectionLayoutPresetEntry> = {
  "about-section": { x: 11, y: 414, width: 1692, height: 569, scale: 1.115 },
  "press-kit-section": { x: -21, y: 574, width: 1912, height: 1033 },
  "band-members-section": { x: -3, y: 494, width: 1848, height: 2096 },
  "live-section": { x: 7, y: 438, width: 1848, height: 2792 },
  "contact-section": { x: 6, y: -266, width: 1848, height: 935 },
  "footer-section": { x: -2, y: -314, width: 1906, height: 662 },
}
