export type HomeEditorNodeType = "section" | "background" | "card" | "text" | "button" | "image"

export interface HomeEditorNodeGeometry {
  x: number
  y: number
  width: number
  height: number
}

export interface HomeEditorNodeStyle {
  color?: string
  backgroundColor?: string
  opacity?: number
  contrast?: number
  saturation?: number
  brightness?: number
  negative?: boolean
  fontSize?: string
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  scale?: number
  minHeight?: string
  paddingTop?: string
  paddingBottom?: string
}

export interface HomeEditorNodeContent {
  text?: string
  href?: string
  src?: string
  alt?: string
  videoUrl?: string
  mediaKind?: "image" | "video"
}

export interface HomeEditorNodeOverride {
  nodeId: string
  nodeType: HomeEditorNodeType
  geometry: HomeEditorNodeGeometry
  style: HomeEditorNodeStyle
  content: HomeEditorNodeContent
  explicitContent: boolean
  explicitStyle: boolean
  explicitPosition: boolean
  explicitSize: boolean
  updatedAt: string
}

export interface HomeEditorStateDocument {
  _id: string
  _type: "homeEditorState"
  updatedAt?: string
  nodes: HomeEditorNodeOverride[]
}
