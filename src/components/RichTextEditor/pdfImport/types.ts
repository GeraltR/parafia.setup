/** Rectangle in PDF points, origin at the top-left corner of the page. */
export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface TextRun {
  text: string
  bold: boolean
  italic: boolean
}

export interface TextLine extends Box {
  runs: TextRun[]
  fontSize: number
}

export interface PageImage extends Box {
  src: string
}

export interface PageContent {
  width: number
  height: number
  lines: TextLine[]
  images: PageImage[]
}

/** Side the image is pushed to while the text runs beside it. */
export type ImageWrap = "left" | "right"

export type Block =
  | { type: "paragraph" | "quote"; lines: TextRun[][] }
  | { type: "heading"; level: 2 | 3; runs: TextRun[] }
  /** width in CSS pixels, matching the printed size in the PDF */
  | { type: "image"; src: string; width: number; align?: ImageWrap }
