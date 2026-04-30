import type { HomeEditorNodeContent, HomeEditorNodeGeometry, HomeEditorNodeStyle } from "@/lib/sanity/home-editor-state"

export interface DefaultSectionLayoutPresetEntry {
  x: number
  y: number
  width: number
  height: number
  scale?: number
}

export interface DefaultEditorNodePresetEntry {
  nodeId: string
  geometry?: HomeEditorNodeGeometry
  style?: HomeEditorNodeStyle
  content?: Partial<HomeEditorNodeContent>
  explicitContent?: boolean
  explicitStyle?: boolean
  explicitPosition?: boolean
  explicitSize?: boolean
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
  "about-section": {
    "x": 2,
    "y": 279,
    "width": 1692,
    "height": 569
  },
  "press-kit-section": {
    "x": -1,
    "y": 135,
    "width": 1912,
    "height": 1033
  },
  "band-members-section": {
    "x": -3,
    "y": 96,
    "width": 1848,
    "height": 2096
  },
  "live-section": {
    "x": 7,
    "y": 112,
    "width": 1848,
    "height": 2792
  },
  "contact-section": {
    "x": 6,
    "y": 112,
    "width": 1848,
    "height": 935
  },
  "footer-section": {
    "x": -2,
    "y": 56,
    "width": 1906,
    "height": 662
  }
}

export const DEFAULT_EDITOR_NODE_PRESET: DefaultEditorNodePresetEntry[] = [
  {
    "nodeId": "navigation",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 1884.343994140625,
      "height": 89.05599975585938
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "navigation-inner",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 1230.5919189453125,
      "height": 72.86399841308594
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-logo",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 80.95999145507812,
      "height": 80.95999145507812
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-brand-name",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 267.2287292480469,
      "height": 35.6304931640625
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-link-0",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 70.84002685546875,
      "height": 37.44399642944336
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-link-1",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 67.8040771484375,
      "height": 37.443992614746094
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-link-2",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 63.7559814453125,
      "height": 37.44399642944336
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-link-3",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 56.6719970703125,
      "height": 37.444000244140625
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-link-4",
    "geometry": {
      "x": 36.9344482421875,
      "y": 2.9625396728515625,
      "width": 83.9959716796875,
      "height": 37.443992614746094
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-link-5",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 83.9959716796875,
      "height": 37.443992614746094
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "nav-book-button",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 71.85205078125,
      "height": 36.4320068359375
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "hero-section",
    "geometry": {
      "x": -1,
      "y": -7,
      "width": 1889,
      "height": 1133
    },
    "style": {
      "color": "#f2f2f2",
      "backgroundColor": "rgb(0, 0, 0)",
      "fontSize": "17.6px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1,
      "minHeight": "1133px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "hero-title",
    "geometry": {
      "x": 83,
      "y": 254,
      "width": 971,
      "height": 173
    },
    "style": {
      "color": "#db6606",
      "fontSize": "62px",
      "fontFamily": "system-ui",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "scale": 0.877,
      "gradientEnabled": true,
      "gradientStart": "#f5f3ef",
      "gradientEnd": "#ff6a00",
      "minHeight": "auto",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "hero-subtitle",
    "geometry": {
      "x": -36,
      "y": 227,
      "width": 340,
      "height": 33
    },
    "style": {
      "color": "#ef770f",
      "fontSize": "12px",
      "fontFamily": "system-ui, -apple-system, \"system-ui\", \"Segoe UI\", sans-serif",
      "fontWeight": "700",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "scale": 1.325,
      "gradientEnabled": true,
      "gradientStart": "#f2f2f2",
      "gradientEnd": "#ef780f",
      "minHeight": "auto",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "hero-scroll-indicator",
    "geometry": {
      "x": 20,
      "y": 36,
      "width": 141,
      "height": 72
    },
    "style": {
      "color": "#ffffff",
      "fontSize": "17.6px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1.431,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "hero-scroll-label",
    "geometry": {
      "x": 1,
      "y": 12,
      "width": 81,
      "height": 23
    },
    "style": {
      "color": "#ffffff",
      "fontSize": "12px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "700",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1,
      "minHeight": "auto",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "intro-section",
    "geometry": {
      "x": -4,
      "y": 18,
      "width": 1889,
      "height": 199
    },
    "style": {
      "color": "#f2f2f2",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1.021,
      "minHeight": "528px",
      "paddingTop": "72px",
      "paddingBottom": "72px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "intro-banner-gif",
    "geometry": {
      "x": -7,
      "y": -186,
      "width": 1927,
      "height": 697
    },
    "style": {
      "color": "#f2f2f2",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1.002,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "intro-banner-text",
    "geometry": {
      "x": -8,
      "y": 154,
      "width": 672,
      "height": 78
    },
    "style": {
      "color": "#ffe7d1",
      "fontSize": "20px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "700",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "scale": 1.057,
      "gradientEnabled": false,
      "gradientStart": "#fffdfa",
      "minHeight": "auto",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "intro-book-button",
    "geometry": {
      "x": -41,
      "y": 162,
      "width": 175,
      "height": 59
    },
    "style": {
      "color": "#fcfcfc",
      "backgroundColor": "rgba(5, 5, 5, 0.550)",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "600",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1,
      "gradientEnabled": false,
      "gradientStart": "#ef6c03",
      "gradientEnd": "#cfc9c9",
      "minHeight": "auto",
      "paddingTop": "16px",
      "paddingBottom": "16px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "intro-press-button",
    "geometry": {
      "x": 45,
      "y": 159,
      "width": 164,
      "height": 53
    },
    "style": {
      "color": "#f7f7f7",
      "backgroundColor": "rgba(241, 120, 14, 0.800)",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "600",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1,
      "gradientEnabled": false,
      "gradientStart": "#b8b8b8",
      "gradientEnd": "#ff6c00",
      "minHeight": "auto",
      "paddingTop": "16px",
      "paddingBottom": "16px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "latest-release-section",
    "geometry": {
      "x": -19,
      "y": 167,
      "width": 1837,
      "height": 995
    },
    "style": {
      "color": "#f2f2f2",
      "backgroundColor": "#000000",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1.054,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "latest-release-bg",
    "geometry": {
      "x": 10,
      "y": -102,
      "width": 2104,
      "height": 1288
    },
    "style": {
      "color": "#f2f2f2",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 0.865,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "latest-release-card",
    "geometry": {
      "x": 27,
      "y": 217,
      "width": 916,
      "height": 278
    },
    "style": {
      "color": "#f2f2f2",
      "backgroundColor": "rgba(0, 0, 0, 0.100)",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "scale": 1,
      "minHeight": "0px",
      "paddingTop": "32px",
      "paddingBottom": "32px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "latest-release-title",
    "geometry": {
      "x": 4,
      "y": -10,
      "width": 830,
      "height": 67
    },
    "style": {
      "color": "#f2f2f2",
      "fontSize": "46px",
      "fontFamily": "\"Playfair Display\", Georgia, \"Times New Roman\", serif, Georgia, serif",
      "fontWeight": "700",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "scale": 1,
      "gradientEnabled": true,
      "gradientStart": "#f5f5f4",
      "minHeight": "auto",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "latest-release-subtitle",
    "geometry": {
      "x": -4,
      "y": -14,
      "width": 768,
      "height": 29
    },
    "style": {
      "color": "#fafafa",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "textShadowEnabled": false,
      "scale": 1,
      "gradientEnabled": false,
      "minHeight": "auto",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "latest-release-watch-button",
    "geometry": {
      "x": -46,
      "y": -1,
      "width": 174,
      "height": 39
    },
    "style": {
      "color": "#ffffff",
      "backgroundColor": "rgba(255, 154, 31, 1.000)",
      "fontSize": "16px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "600",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "textShadowEnabled": true,
      "scale": 1,
      "minHeight": "48px",
      "paddingTop": "12px",
      "paddingBottom": "12px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "latest-release-shows-button",
    "geometry": {
      "x": 43,
      "y": 1,
      "width": 183,
      "height": 52
    },
    "style": {
      "color": "#ff9a1f",
      "backgroundColor": "rgba(36, 36, 36, 0.550)",
      "fontSize": "16px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "600",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "textShadowEnabled": true,
      "scale": 1,
      "minHeight": "48px",
      "paddingTop": "12px",
      "paddingBottom": "12px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "about-section",
    "geometry": {
      "x": 2,
      "y": 279,
      "width": 1692,
      "height": 569
    },
    "explicitPosition": true
  },
  {
    "nodeId": "about-bg-image",
    "geometry": {
      "x": -99,
      "y": -141,
      "width": 1910,
      "height": 1370
    },
    "style": {
      "color": "#f2f2f2",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1.056,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "about-header-eyebrow",
    "geometry": {
      "x": -63,
      "y": -125,
      "width": 693,
      "height": 24
    },
    "style": {
      "color": "#ff9a1f",
      "fontSize": "16px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "600",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "textShadowEnabled": true,
      "scale": 1.485,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "about-header-title",
    "geometry": {
      "x": 136,
      "y": 81,
      "width": 227,
      "height": 17
    },
    "style": {
      "color": "#f8f5f2",
      "fontSize": "17px",
      "fontFamily": "system-ui",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "textShadowEnabled": false,
      "scale": 2.862,
      "gradientEnabled": true,
      "gradientStart": "#f4f0ec",
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "about-text-card",
    "geometry": {
      "x": 20,
      "y": 101,
      "width": 896,
      "height": 361
    },
    "style": {
      "color": "#f2f2f2",
      "backgroundColor": "rgba(0, 0, 0, 0.000)",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1,
      "minHeight": "0px",
      "paddingTop": "56px",
      "paddingBottom": "56px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "about-text-1",
    "geometry": {
      "x": 0,
      "y": -19,
      "width": 798,
      "height": 90
    },
    "style": {
      "color": "#ffffff",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "textShadowEnabled": true,
      "scale": 1,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "about-text-2",
    "geometry": {
      "x": -5,
      "y": -9,
      "width": 798,
      "height": 84
    },
    "style": {
      "color": "#ffffff",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "textShadowEnabled": true,
      "scale": 1,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "about-tags",
    "geometry": {
      "x": 166,
      "y": -4,
      "width": 525,
      "height": 32
    },
    "style": {
      "color": "#ee7c11",
      "fontSize": "16px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "textShadowEnabled": true,
      "scale": 1,
      "minHeight": "0px",
      "paddingTop": "8px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "about-copy-button",
    "geometry": {
      "x": 7,
      "y": 88,
      "width": 145,
      "height": 57
    },
    "style": {
      "color": "#f2f2f2",
      "backgroundColor": "rgba(241, 126, 19, 0.500)",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "700",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "textShadowEnabled": false,
      "scale": 1,
      "minHeight": "auto",
      "paddingTop": "14px",
      "paddingBottom": "14px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-section",
    "geometry": {
      "x": -1,
      "y": 135,
      "width": 1912,
      "height": 1033
    },
    "explicitPosition": true
  },
  {
    "nodeId": "press-kit-bg",
    "geometry": {
      "x": -4,
      "y": -2,
      "width": 1955,
      "height": 1082
    },
    "style": {
      "color": "#f2f2f2",
      "fontSize": "17.6px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "left",
      "scale": 1,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-header-eyebrow",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 768,
      "height": 24
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-main-card",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 1237,
      "height": 385
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-folder-icon",
    "geometry": {
      "x": 1,
      "y": -8,
      "width": 81,
      "height": 81
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-title",
    "geometry": {
      "x": 16,
      "y": -19,
      "width": 1142,
      "height": 50
    },
    "style": {
      "color": "#ef841a",
      "fontSize": "40px",
      "fontFamily": "\"Playfair Display\", Georgia, \"Times New Roman\", serif, Georgia, serif",
      "fontWeight": "600",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "scale": 1,
      "gradientEnabled": true,
      "gradientStart": "#f8f7f7",
      "gradientEnd": "#ff6a00",
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-description",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 512,
      "height": 59
    },
    "style": {
      "color": "#d1d1d1",
      "fontSize": "18px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "400",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "scale": 1,
      "minHeight": "0px",
      "paddingTop": "0px",
      "paddingBottom": "0px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-download-button",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 156,
      "height": 52
    },
    "style": {
      "color": "#ffffff",
      "backgroundColor": "#ff8c21",
      "fontSize": "16px",
      "fontFamily": "Inter, \"Segoe UI\", Roboto, system-ui, -apple-system, sans-serif, system-ui, sans-serif",
      "fontWeight": "600",
      "fontStyle": "normal",
      "textDecoration": "none",
      "textAlign": "center",
      "scale": 1,
      "minHeight": "0px",
      "paddingTop": "14px",
      "paddingBottom": "14px"
    },
    "explicitStyle": true,
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-resource-0",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 389,
      "height": 210
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-resource-1",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 389,
      "height": 210
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "press-kit-manager",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 389,
      "height": 210
    },
    "explicitPosition": true,
    "explicitSize": true
  },
  {
    "nodeId": "band-members-section",
    "geometry": {
      "x": -3,
      "y": 96,
      "width": 1848,
      "height": 2096
    },
    "explicitPosition": true
  },
  {
    "nodeId": "live-section",
    "geometry": {
      "x": 7,
      "y": 112,
      "width": 1848,
      "height": 2792
    },
    "explicitPosition": true
  },
  {
    "nodeId": "contact-section",
    "geometry": {
      "x": 6,
      "y": 112,
      "width": 1848,
      "height": 935
    },
    "explicitPosition": true
  },
  {
    "nodeId": "footer-section",
    "geometry": {
      "x": -2,
      "y": 56,
      "width": 1906,
      "height": 662
    },
    "explicitPosition": true
  },
  {
    "nodeId": "footer-cta",
    "geometry": {
      "x": 0,
      "y": 0,
      "width": 176.0625,
      "height": 48
    },
    "explicitContent": true,
    "explicitPosition": true,
    "explicitSize": true,
    "content": {
      "text": "Book the Band",
      "href": "#contact"
    }
  }
]
