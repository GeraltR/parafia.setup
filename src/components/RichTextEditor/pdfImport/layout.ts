import type { Block, Box, ImageWrap, PageContent, PageImage, TextLine, TextRun } from "./types"

/** Chronicle section titles ("Styczeń 2005 r.", "ROK 2013"); OCR often garbles the year. */
const DATE_HEADING =
  /^(rok|stycze[nń]|luty|marzec|kwiecie[nń]|maj|czerwiec|lipiec|sierpie[nń]|wrzesie[nń]|pa[zź]dziernik|listopad|grudzie[nń])\s*(?=.*\d)[\p{L}\d .,]{2,12}$/iu
const OPENING_QUOTE = /^[„"”“«]/
const CLOSING_QUOTE = /[”"“»]\W*$/
const SENTENCE_END = /[.!?:;”"»)]$/
/** PDF user space is in points (1/72 in), CSS pixels are 1/96 in. */
const PX_PER_PT = 96 / 72

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function percentile(values: number[], fraction: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))]
}

export function lineText(line: { runs: TextRun[] }): string {
  return line.runs.map((run) => run.text).join("")
}

function isWholeBold(runs: TextRun[]): boolean {
  const visible = runs.filter((run) => run.text.trim())
  return visible.length > 0 && visible.every((run) => run.bold)
}

function isWholeItalic(runs: TextRun[]): boolean {
  const visible = runs.filter((run) => run.text.trim())
  return visible.length > 0 && visible.every((run) => run.italic)
}

/**
 * Finds vertical gutters between text columns: bands in the middle part of the page
 * that (almost) no box crosses. Returns the x positions to split at, left to right.
 */
export function detectColumnSplits(boxes: Box[], pageWidth: number): number[] {
  const bins = new Array<number>(Math.ceil(pageWidth)).fill(0)
  for (const box of boxes) {
    const from = Math.max(0, Math.floor(box.x))
    const to = Math.min(bins.length, Math.ceil(box.x + box.width))
    for (let x = from; x < to; x++) bins[x]++
  }

  // A heading spanning both columns must not hide the gutter.
  const noise = Math.max(1, Math.floor(boxes.length * 0.03))
  const minGutter = 10
  const splits: number[] = []
  let runStart = -1

  for (let x = Math.floor(pageWidth * 0.2); x <= Math.ceil(pageWidth * 0.8); x++) {
    const empty = x < bins.length && bins[x] <= noise
    if (empty && runStart < 0) runStart = x
    if (!empty && runStart >= 0) {
      if (x - runStart >= minGutter) splits.push((runStart + x) / 2)
      runStart = -1
    }
  }

  return splits.filter((split) => {
    const left = boxes.filter((box) => box.x + box.width <= split).length
    const right = boxes.filter((box) => box.x >= split).length
    return left >= boxes.length * 0.15 && right >= boxes.length * 0.15
  })
}

export function columnIndex(x: number, splits: number[]): number {
  const index = splits.findIndex((split) => x < split)
  return index === -1 ? splits.length : index
}

/** Drops bare page numbers printed in the top or bottom margin. */
function isPageNumber(line: TextLine, pageHeight: number): boolean {
  const inMargin = line.y < pageHeight * 0.1 || line.y + line.height > pageHeight * 0.9
  return inMargin && /^\s*[-–]?\s*\d{1,3}\s*[-–]?\s*$/.test(lineText(line))
}

interface Paragraph {
  kind: "text"
  top: number
  lines: TextLine[]
  /** Visual lines grouped by forced line breaks (e.g. verses). */
  segments: TextLine[][]
  /** First paragraph of a column that may continue the previous one. */
  continuation: boolean
  /** The last line stops short of the right margin, so the paragraph really ended. */
  endsShort: boolean
}

interface ImageEntry {
  kind: "image"
  top: number
  src: string
  width: number
  align?: ImageWrap
}

type Entry = Paragraph | ImageEntry

interface Metrics {
  bodySize: number
}

export function documentMetrics(pages: PageContent[]): Metrics {
  const weighted: number[] = []
  for (const page of pages) {
    for (const line of page.lines) {
      const length = Math.min(200, lineText(line).length)
      for (let i = 0; i < length; i += 10) weighted.push(line.fontSize)
    }
  }
  return { bodySize: median(weighted) || 10 }
}

function splitIntoParagraphs(lines: TextLine[], metrics: Metrics): Paragraph[] {
  if (lines.length === 0) return []

  const { bodySize } = metrics
  const left = percentile(
    lines.map((line) => line.x),
    0.1,
  )
  const right = percentile(
    lines.map((line) => line.x + line.width),
    0.9,
  )
  const spacing =
    median(
      lines
        .slice(1)
        .map((line, i) => line.y - lines[i].y)
        .filter((gap) => gap > bodySize * 0.5 && gap < bodySize * 3),
    ) || bodySize * 1.3

  const indent = (line: TextLine) => line.x - left
  const isShort = (line: TextLine) => line.x + line.width < right - bodySize * 4
  const isHeadingLike = (line: TextLine) =>
    (isWholeBold(line.runs) || line.fontSize > bodySize * 1.2) && lineText(line).length < 80

  const startParagraph = (line: TextLine, continuation: boolean): Paragraph => ({
    kind: "text",
    top: line.y,
    lines: [line],
    segments: [[line]],
    continuation,
    endsShort: false,
  })

  const first = lines[0]
  const paragraphs = [startParagraph(first, indent(first) < bodySize * 0.8)]

  for (let i = 1; i < lines.length; i++) {
    const previous = lines[i - 1]
    const line = lines[i]
    const current = paragraphs[paragraphs.length - 1]

    const newParagraph =
      line.y - previous.y > spacing * 1.45 ||
      (isShort(previous) && (/:\s*$/.test(lineText(previous)) || OPENING_QUOTE.test(lineText(line).trimStart()))) ||
      Math.abs(line.fontSize - previous.fontSize) > bodySize * 0.2 ||
      (indent(line) > bodySize * 0.8 && Math.abs(indent(line) - indent(previous)) > bodySize * 0.5) ||
      isHeadingLike(previous) !== isHeadingLike(line)

    if (newParagraph) {
      paragraphs.push(startParagraph(line, false))
    } else if (isShort(previous)) {
      current.lines.push(line)
      current.segments.push([line])
    } else {
      current.lines.push(line)
      current.segments[current.segments.length - 1].push(line)
    }
  }

  for (const paragraph of paragraphs) {
    paragraph.endsShort = isShort(paragraph.lines[paragraph.lines.length - 1])
  }
  return paragraphs
}

function pageEntries(page: PageContent, metrics: Metrics): Entry[][] {
  const lines = page.lines.filter((line) => !isPageNumber(line, page.height))
  const splits = detectColumnSplits(lines, page.width)
  const columns: TextLine[][] = Array.from({ length: splits.length + 1 }, () => [])
  for (const line of lines) columns[columnIndex(line.x, splits)].push(line)

  const entries: Entry[][] = columns.map((columnLines) =>
    splitIntoParagraphs(
      [...columnLines].sort((a, b) => a.y - b.y || a.x - b.x),
      metrics,
    ),
  )

  for (const image of page.images) {
    const column = nearestColumn(image, columns, splits)
    entries[column].push({
      kind: "image",
      top: image.y,
      src: image.src,
      width: image.width,
      align: wrapSide(image, columns[column], page.width),
    })
  }

  return entries.map((column) => column.sort((a, b) => a.top - b.top))
}

/**
 * An image with text running beside it on one side only is floated to the other side, so
 * the editor wraps the text around it as the PDF did. Wide images stay on their own line.
 */
function wrapSide(image: PageImage, columnLines: TextLine[], pageWidth: number): ImageWrap | undefined {
  if (image.width > pageWidth * 0.55) return undefined
  const beside = columnLines.filter((line) => line.y < image.y + image.height && line.y + line.height > image.y)
  const onLeft = beside.filter((line) => line.x + line.width <= image.x + 2).length
  const onRight = beside.filter((line) => line.x >= image.x + image.width - 2).length
  if (onLeft >= 2 && onRight === 0) return "right"
  if (onRight >= 2 && onLeft === 0) return "left"
  return undefined
}

/** Images go to the column under their centre, or to the closest column holding text. */
function nearestColumn(image: PageImage, columns: TextLine[][], splits: number[]): number {
  const centre = image.x + image.width / 2
  const own = columnIndex(centre, splits)
  if (columns[own].length > 0) return own

  let best = own
  let bestDistance = Infinity
  columns.forEach((columnLines, index) => {
    if (columnLines.length === 0) return
    const from = Math.min(...columnLines.map((line) => line.x))
    const to = Math.max(...columnLines.map((line) => line.x + line.width))
    const distance = centre < from ? from - centre : centre > to ? centre - to : 0
    if (distance < bestDistance) {
      best = index
      bestDistance = distance
    }
  })
  return best
}

function joinLines(lines: TextLine[]): TextRun[] {
  const runs: TextRun[] = []
  lines.forEach((line, index) => {
    const lineRuns = line.runs.map((run) => ({ ...run }))
    if (index > 0 && runs.length > 0 && lineRuns.length > 0) {
      const last = runs[runs.length - 1]
      const next = lineRuns[0]
      if (/\p{L}-$/u.test(last.text) && /^\p{Ll}/u.test(next.text.trimStart())) {
        last.text = last.text.slice(0, -1)
        next.text = next.text.trimStart()
      } else if (!/\s$/.test(last.text) && !/^\s/.test(next.text)) {
        last.text += " "
      }
    }
    runs.push(...lineRuns)
  })
  return mergeRuns(runs)
}

function mergeRuns(runs: TextRun[]): TextRun[] {
  const merged: TextRun[] = []
  for (const run of runs) {
    const last = merged[merged.length - 1]
    if (last && last.bold === run.bold && last.italic === run.italic) {
      last.text += run.text
    } else {
      merged.push({ ...run })
    }
  }
  const first = merged[0]
  const end = merged[merged.length - 1]
  if (first) first.text = first.text.trimStart()
  if (end) end.text = end.text.trimEnd()
  return merged.filter((run) => run.text)
}

function toBlock(paragraph: Paragraph, metrics: Metrics): Block {
  const segments = paragraph.segments.map(joinLines)
  const allRuns = segments.flat()
  const text = allRuns
    .map((run) => run.text)
    .join("")
    .trim()
  const fontSize = median(paragraph.lines.map((line) => line.fontSize))

  if (paragraph.lines.length <= 2 && text.length <= 80) {
    if (fontSize > metrics.bodySize * 1.2 || DATE_HEADING.test(text)) {
      return { type: "heading", level: 2, runs: plain(joinLines(paragraph.lines)) }
    }
    if (isWholeBold(allRuns) && !SENTENCE_END.test(text)) {
      return { type: "heading", level: 3, runs: plain(joinLines(paragraph.lines)) }
    }
  }

  if (OPENING_QUOTE.test(text) && (isWholeItalic(allRuns) || CLOSING_QUOTE.test(text))) {
    return { type: "quote", lines: segments }
  }

  return { type: "paragraph", lines: segments }
}

/** Headings carry their own weight, so explicit bold inside them is noise. */
function plain(runs: TextRun[]): TextRun[] {
  return mergeRuns(runs.map((run) => ({ ...run, bold: false })))
}

function isHeadingStart(paragraph: Paragraph, metrics: Metrics): boolean {
  const line = paragraph.lines[0]
  return isWholeBold(line.runs) || line.fontSize > metrics.bodySize * 1.2 || DATE_HEADING.test(lineText(line).trim())
}

function canContinue(previous: Paragraph, next: Paragraph, metrics: Metrics): boolean {
  if (isHeadingStart(previous, metrics) || isHeadingStart(next, metrics)) return false
  // A last line reaching the right margin means the text simply flowed on.
  if (!previous.endsShort) return true
  const previousText = lineText({ runs: joinLines(previous.lines) })
  const nextText = lineText(next.lines[0]).trimStart()
  return !SENTENCE_END.test(previousText) && /^[\p{Ll}\d]/u.test(nextText)
}

/**
 * Converts the pages of a document into editor blocks in reading order: columns left to
 * right, top to bottom within a column, images placed by their vertical position.
 * Paragraphs cut by a column or page break are glued back together.
 */
export function layoutDocument(pages: PageContent[]): Block[] {
  const metrics = documentMetrics(pages)
  const entries = pages.flatMap((page) => pageEntries(page, metrics)).flat()

  const result: Entry[] = []
  let lastParagraph: Paragraph | null = null

  for (const entry of entries) {
    if (entry.kind === "image") {
      result.push(entry)
      continue
    }
    if (entry.continuation && lastParagraph && canContinue(lastParagraph, entry, metrics)) {
      lastParagraph.lines.push(...entry.lines)
      const [firstSegment, ...rest] = entry.segments
      lastParagraph.segments[lastParagraph.segments.length - 1].push(...firstSegment)
      lastParagraph.segments.push(...rest)
      continue
    }
    result.push(entry)
    lastParagraph = entry
  }

  const blocks: Block[] = result.map((entry) =>
    entry.kind === "image"
      ? { type: "image", src: entry.src, width: Math.round(entry.width * PX_PER_PT), align: entry.align }
      : toBlock(entry, metrics),
  )
  return floatsAfterHeadings(blocks)
}

/**
 * A floated photo often starts a little above the section title in the PDF. Headings
 * clear floats, so left in front of the title it would sit alone; move it below instead.
 */
function floatsAfterHeadings(blocks: Block[]): Block[] {
  const result = [...blocks]
  for (let i = result.length - 1; i >= 0; i--) {
    const block = result[i]
    if (block.type !== "image" || !block.align) continue
    let after = i
    while (result[after + 1]?.type === "heading") after++
    if (after > i) {
      result.splice(i, 1)
      result.splice(after, 0, block)
    }
  }
  return result
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function runsToHtml(runs: TextRun[]): string {
  return runs
    .map((run) => {
      let html = escapeHtml(run.text)
      if (run.italic) html = `<em>${html}</em>`
      if (run.bold) html = `<strong>${html}</strong>`
      return html
    })
    .join("")
}

export function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "image":
          return `<img src="${escapeHtml(block.src)}" width="${block.width}"${block.align ? ` data-align="${block.align}"` : ""}>`
        case "heading":
          return `<h${block.level}>${runsToHtml(block.runs)}</h${block.level}>`
        case "quote":
          return `<blockquote><p>${block.lines.map(runsToHtml).join("<br>")}</p></blockquote>`
        case "paragraph":
          return `<p>${block.lines.map(runsToHtml).join("<br>")}</p>`
      }
    })
    .join("")
}
