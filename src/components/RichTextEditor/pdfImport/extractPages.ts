import { OPS, type PDFDocumentProxy, type PDFPageProxy } from "pdfjs-dist"
import type { TextItem } from "pdfjs-dist/types/src/display/api"

import { textItemsToLines, type PositionedText } from "./textLayer"
import type { Box, PageContent, PageImage, TextLine } from "./types"

type Matrix = [number, number, number, number, number, number]

export interface ExtractServices {
  createCanvas: (width: number, height: number) => HTMLCanvasElement
  /** Recognizes text on a page rendered at `scale` pixels per point. */
  recognize: (canvas: HTMLCanvasElement, scale: number) => Promise<TextLine[]>
}

export interface ExtractProgress {
  page: number
  pageCount: number
  ocr: boolean
}

/** Pages with less text than this are treated as scans / outlined text and OCR'd. */
const MIN_TEXT_CHARS = 20
const OCR_SCALE = 3
const IMAGE_SCALE = 2
const MAX_IMAGE_SIDE = 1600
const MIN_IMAGE_SIDE = 30

function multiply(m1: Matrix, m2: Matrix): Matrix {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ]
}

function unitSquareBounds(m: Matrix): Box {
  const points = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ].map(([x, y]) => [x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]])
  const xs = points.map((point) => point[0])
  const ys = points.map((point) => point[1])
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

function overlapArea(a: Box, b: Box): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  return width > 0 && height > 0 ? width * height : 0
}

function union(a: Box, b: Box): Box {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  }
}

/**
 * Clamps image rectangles to the page, drops decorations (tiny images and page-sized
 * backgrounds) and merges pieces that overlap, e.g. an image drawn with a separate mask.
 */
export function normalizeImageRects(rects: Box[], pageWidth: number, pageHeight: number): Box[] {
  const pageArea = pageWidth * pageHeight
  const clamped = rects
    .map((rect) => {
      const x = Math.max(0, rect.x)
      const y = Math.max(0, rect.y)
      return {
        x,
        y,
        width: Math.min(pageWidth, rect.x + rect.width) - x,
        height: Math.min(pageHeight, rect.y + rect.height) - y,
      }
    })
    .filter((rect) => rect.width >= MIN_IMAGE_SIDE && rect.height >= MIN_IMAGE_SIDE)
    .filter((rect) => rect.width * rect.height < pageArea * 0.8)

  const merged: Box[] = []
  for (const rect of clamped) {
    const index = merged.findIndex(
      (other) =>
        overlapArea(rect, other) >
        0.3 * Math.min(rect.width * rect.height, other.width * other.height),
    )
    if (index === -1) merged.push(rect)
    else merged[index] = union(merged[index], rect)
  }
  return merged.sort((a, b) => a.y - b.y || a.x - b.x)
}

async function imageRects(page: PDFPageProxy, viewportTransform: Matrix): Promise<Box[]> {
  const { fnArray, argsArray } = await page.getOperatorList()
  const stack: Matrix[] = []
  let ctm: Matrix = [1, 0, 0, 1, 0, 0]
  const rects: Box[] = []

  fnArray.forEach((fn, index) => {
    const args = argsArray[index]
    switch (fn) {
      case OPS.save:
        stack.push(ctm)
        break
      case OPS.restore:
        ctm = stack.pop() ?? ctm
        break
      case OPS.transform:
        ctm = multiply(ctm, args as Matrix)
        break
      case OPS.paintFormXObjectBegin:
        stack.push(ctm)
        if (Array.isArray(args[0])) ctm = multiply(ctm, args[0] as Matrix)
        break
      case OPS.paintFormXObjectEnd:
        ctm = stack.pop() ?? ctm
        break
      case OPS.paintImageXObject:
      case OPS.paintInlineImageXObject:
        rects.push(unitSquareBounds(multiply(viewportTransform, ctm)))
        break
    }
  })

  return rects
}

async function positionedText(page: PDFPageProxy, viewportTransform: Matrix): Promise<PositionedText[]> {
  const content = await page.getTextContent()
  return content.items
    .filter((item): item is TextItem => "str" in item)
    .map((item) => {
      const [, , c, d, e, f] = multiply(viewportTransform, item.transform as Matrix)
      let fontName = item.fontName
      try {
        // Real font names are available once the operator list has loaded the fonts
        // and the document was opened with `fontExtraProperties: true`.
        fontName = (page.commonObjs.get(item.fontName) as { name?: string }).name ?? fontName
      } catch {
        // Font not resolved: style detection falls back to the internal name.
      }
      return {
        text: item.str,
        x: e,
        baseline: f,
        width: item.width,
        fontSize: Math.hypot(c, d),
        fontName,
      }
    })
}

async function renderPage(page: PDFPageProxy, scale: number, services: ExtractServices) {
  const viewport = page.getViewport({ scale })
  const canvas = services.createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
  const context = canvas.getContext("2d") as CanvasRenderingContext2D
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, canvas.width, canvas.height)
  await page.render({ canvas, canvasContext: context, viewport }).promise
  return canvas
}

function cropImage(source: HTMLCanvasElement, rect: Box, scale: number, services: ExtractServices): string {
  const sourceWidth = rect.width * scale
  const sourceHeight = rect.height * scale
  const ratio = Math.min(1, MAX_IMAGE_SIDE / Math.max(sourceWidth, sourceHeight))
  const target = services.createCanvas(Math.round(sourceWidth * ratio), Math.round(sourceHeight * ratio))
  target
    .getContext("2d")
    ?.drawImage(source, rect.x * scale, rect.y * scale, sourceWidth, sourceHeight, 0, 0, target.width, target.height)
  return target.toDataURL("image/jpeg", 0.88)
}

async function extractPage(page: PDFPageProxy, services: ExtractServices, onOcr: () => void): Promise<PageContent> {
  const viewport = page.getViewport({ scale: 1 })
  const transform = viewport.transform as Matrix
  const rects = normalizeImageRects(await imageRects(page, transform), viewport.width, viewport.height)
  const items = await positionedText(page, transform)
  const textChars = items.reduce((sum, item) => sum + item.text.trim().length, 0)
  const needsOcr = textChars < MIN_TEXT_CHARS

  let lines = textItemsToLines(items, viewport.width)
  let images: PageImage[] = []

  if (needsOcr || rects.length > 0) {
    const scale = needsOcr ? OCR_SCALE : IMAGE_SCALE
    const canvas = await renderPage(page, scale, services)
    images = rects.map((rect) => ({ ...rect, src: cropImage(canvas, rect, scale, services) }))

    if (needsOcr) {
      onOcr()
      // Text inside photos (signs, banners) is not part of the document text.
      const context = canvas.getContext("2d") as CanvasRenderingContext2D
      context.fillStyle = "#ffffff"
      rects.forEach((rect) => context.fillRect(rect.x * scale, rect.y * scale, rect.width * scale, rect.height * scale))
      // Keep the few real text lines (e.g. a title) and add what OCR found elsewhere.
      const recognized = await services.recognize(canvas, scale)
      lines = [...lines, ...recognized.filter((line) => !lines.some((own) => overlapArea(own, line) > 0))]
    }
    canvas.width = 0
    canvas.height = 0
  }

  page.cleanup()
  return { width: viewport.width, height: viewport.height, lines, images }
}

export async function extractPages(
  doc: PDFDocumentProxy,
  services: ExtractServices,
  onProgress: (progress: ExtractProgress) => void = () => {},
): Promise<PageContent[]> {
  const pages: PageContent[] = []
  for (let number = 1; number <= doc.numPages; number++) {
    onProgress({ page: number, pageCount: doc.numPages, ocr: false })
    const page = await doc.getPage(number)
    pages.push(
      await extractPage(page, services, () => onProgress({ page: number, pageCount: doc.numPages, ocr: true })),
    )
  }
  return pages
}
