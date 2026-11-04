import { columnIndex, detectColumnSplits } from "./layout"
import type { TextLine, TextRun } from "./types"

/** A text item already converted to page coordinates (top-left origin, points). */
export interface PositionedText {
  text: string
  x: number
  baseline: number
  width: number
  fontSize: number
  fontName: string
}

export function fontStyle(fontName: string): Pick<TextRun, "bold" | "italic"> {
  // Embedded names look like "ABCDEE+Cambria,BoldItalic" or "Arial-BoldMT".
  const name = fontName.replace(/^[A-Z]{6}\+/, "")
  return {
    bold: /bold|black|heavy|semibold|demi/i.test(name),
    italic: /italic|oblique/i.test(name),
  }
}

function toLine(items: PositionedText[]): TextLine {
  const sorted = [...items].sort((a, b) => a.x - b.x)
  const runs: TextRun[] = []
  let previous: PositionedText | null = null

  for (const item of sorted) {
    const style = fontStyle(item.fontName)
    let text = item.text
    if (previous) {
      const gap = item.x - (previous.x + previous.width)
      const touchesSpace = /\s$/.test(previous.text) || /^\s/.test(text)
      if (gap > item.fontSize * 0.2 && !touchesSpace) text = ` ${text}`
    }
    runs.push({ text, ...style })
    previous = item
  }
  runs[0].text = runs[0].text.trimStart()
  runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd()

  const fontSize = Math.max(...items.map((item) => item.fontSize))
  const x = sorted[0].x
  const right = Math.max(...sorted.map((item) => item.x + item.width))
  const top = Math.min(...sorted.map((item) => item.baseline - item.fontSize * 0.8))
  const bottom = Math.max(...sorted.map((item) => item.baseline + item.fontSize * 0.2))

  return { x, y: top, width: right - x, height: bottom - top, fontSize, runs }
}

function differentStyle(a: PositionedText, b: PositionedText): boolean {
  return Math.abs(a.fontSize - b.fontSize) > 1 || fontStyle(a.fontName).bold !== fontStyle(b.fontName).bold
}

/**
 * Splits a baseline group where a wide gap separates differently styled parts, e.g. a
 * run-in heading followed by body text. Same-style gaps (justified text, "a)" + tab)
 * stay on one line.
 */
function splitAtGaps(items: PositionedText[]): PositionedText[][] {
  const sorted = [...items].sort((a, b) => a.x - b.x)
  const groups: PositionedText[][] = [[sorted[0]]]
  // Measured from the last visible item: a tab is often a wide whitespace item.
  let previous = sorted[0]
  for (const item of sorted.slice(1)) {
    const visible = item.text.trim() !== ""
    const gap = item.x - (previous.x + previous.width)
    if (visible && gap > Math.max(previous.fontSize, item.fontSize) * 2 && differentStyle(previous, item)) {
      groups.push([item])
    } else {
      groups[groups.length - 1].push(item)
    }
    if (visible) previous = item
  }
  return groups
}

/**
 * Groups positioned text items into lines. Items are first assigned to columns so that
 * two columns sharing a baseline do not end up glued into one line.
 */
export function textItemsToLines(items: PositionedText[], pageWidth: number): TextLine[] {
  const visible = items.filter((item) => item.text.length > 0 && item.fontSize > 0)
  const boxes = visible
    .filter((item) => item.text.trim())
    .map((item) => ({ x: item.x, y: item.baseline - item.fontSize, width: item.width, height: item.fontSize }))
  const splits = detectColumnSplits(boxes, pageWidth)

  const lines: TextLine[] = []
  const columns = new Map<number, PositionedText[]>()
  for (const item of visible) {
    const column = columnIndex(item.x, splits)
    columns.set(column, [...(columns.get(column) ?? []), item])
  }

  for (const columnItems of columns.values()) {
    const sorted = [...columnItems].sort((a, b) => a.baseline - b.baseline || a.x - b.x)
    let current: PositionedText[] = []
    let baseline = 0

    for (const item of sorted) {
      if (current.length > 0 && Math.abs(item.baseline - baseline) > item.fontSize * 0.5) {
        lines.push(...splitAtGaps(current).map(toLine))
        current = []
      }
      if (current.length === 0) baseline = item.baseline
      current.push(item)
    }
    if (current.length > 0) lines.push(...splitAtGaps(current).map(toLine))
  }

  return lines.filter((line) => line.runs.some((run) => run.text.trim()))
}
