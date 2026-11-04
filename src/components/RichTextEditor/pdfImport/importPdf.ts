import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker"

import { extractPages, type ExtractProgress } from "./extractPages"
import { blocksToHtml, layoutDocument } from "./layout"
import type { Recognizer } from "./ocr"

// Bundled by Vite as a .js chunk: some hosts serve .mjs with a non-JS MIME type, which
// browsers refuse to run as a module script. Created once, shared by later imports.
GlobalWorkerOptions.workerPort = new PdfWorker()

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Converts a PDF into editor HTML. Pages with a text layer are read directly; pages
 * without one (scans, text converted to curves) go through OCR, which is loaded only
 * when needed. Images are embedded as data: URLs and uploaded by the editor on insert.
 */
export async function importPdf(file: File, onProgress: (progress: ExtractProgress) => void): Promise<string> {
  const loadingTask = getDocument({ data: new Uint8Array(await file.arrayBuffer()), fontExtraProperties: true })
  let recognizer: Recognizer | null = null

  try {
    const doc = await loadingTask.promise
    const pages = await extractPages(
      doc,
      {
        createCanvas,
        recognize: async (canvas, scale) => {
          if (!recognizer) {
            const { createRecognizer } = await import("./ocr")
            recognizer = await createRecognizer()
          }
          return recognizer.recognize(canvas, scale)
        },
      },
      onProgress,
    )
    return blocksToHtml(layoutDocument(pages))
  } finally {
    await (recognizer as Recognizer | null)?.terminate()
    await loadingTask.destroy()
  }
}
