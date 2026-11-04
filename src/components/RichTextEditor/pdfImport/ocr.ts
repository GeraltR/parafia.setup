import { createWorker, OEM } from "tesseract.js"
import workerPath from "tesseract.js/dist/worker.min.js?url"
import corePath from "tesseract.js-core/tesseract-core-simd-lstm.wasm.js?url"

import { ocrBlocksToLines } from "./ocrLines"
import type { TextLine } from "./types"

export interface Recognizer {
  recognize: (canvas: HTMLCanvasElement, scale: number) => Promise<TextLine[]>
  terminate: () => Promise<void>
}

/**
 * Polish OCR running fully from our own assets: the worker and core come from
 * node_modules via Vite, the language data from public/ocr (no third-party CDN).
 */
export async function createRecognizer(): Promise<Recognizer> {
  const worker = await createWorker("pol", OEM.LSTM_ONLY, {
    workerPath,
    corePath,
    langPath: `${import.meta.env.BASE_URL}ocr`,
    gzip: true,
  })

  return {
    recognize: async (canvas, scale) => {
      const { data } = await worker.recognize(canvas, {}, { blocks: true, text: false })
      return ocrBlocksToLines(data.blocks ?? [], scale)
    },
    terminate: async () => {
      await worker.terminate()
    },
  }
}
