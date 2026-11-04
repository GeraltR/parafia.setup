import type { TextLine } from "./types"

/** The subset of tesseract.js block output this module relies on. */
export interface OcrBlock {
  paragraphs: Array<{
    lines: Array<{
      confidence: number
      bbox: { x0: number; y0: number; x1: number; y1: number }
      // tesseract.js 6 typings say `row_height`, the runtime object has `rowHeight`.
      rowAttributes?: { rowHeight?: number; row_height?: number }
      words: Array<{ text: string }>
    }>
  }>
}

/** Converts OCR output (pixels at `scale` px per point) into page-space text lines. */
export function ocrBlocksToLines(blocks: OcrBlock[], scale: number): TextLine[] {
  return blocks
    .flatMap((block) => block.paragraphs.flatMap((paragraph) => paragraph.lines))
    .map((line) => {
      const text = line.words
        .map((word) => word.text)
        .join(" ")
        .trim()
      const { x0, y0, x1, y1 } = line.bbox
      const height = (y1 - y0) / scale
      const rowHeight = line.rowAttributes?.rowHeight ?? line.rowAttributes?.row_height
      return {
        x: x0 / scale,
        y: y0 / scale,
        width: (x1 - x0) / scale,
        height,
        fontSize: rowHeight ? rowHeight / scale : height / 1.25,
        runs: [{ text, bold: false, italic: false }],
        confidence: line.confidence,
      }
    })
    .filter((line) => /[\p{L}\d]{2}/u.test(line.runs[0].text) && line.confidence >= 40)
    .map(({ confidence: _confidence, ...line }) => line)
}
