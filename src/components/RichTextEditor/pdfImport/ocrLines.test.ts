import { describe, expect, it } from "vitest"

import { ocrBlocksToLines, type OcrBlock } from "./ocrLines"

function ocrLine(text: string, bbox: { x0: number; y0: number; x1: number; y1: number }, confidence = 90) {
  return { confidence, bbox, rowAttributes: { rowHeight: 33 }, words: text.split(" ").map((word) => ({ text: word })) }
}

describe("ocrBlocksToLines", () => {
  it("converts pixel boxes back to page points", () => {
    const blocks: OcrBlock[] = [{ paragraphs: [{ lines: [ocrLine("Luty 2005 r.", { x0: 300, y0: 600, x1: 900, y1: 660 })] }] }]
    expect(ocrBlocksToLines(blocks, 3)).toEqual([
      {
        x: 100,
        y: 200,
        width: 200,
        height: 20,
        fontSize: 11,
        runs: [{ text: "Luty 2005 r.", bold: false, italic: false }],
      },
    ])
  })

  it("drops noise and low-confidence lines", () => {
    const box = { x0: 0, y0: 0, x1: 30, y1: 30 }
    const blocks: OcrBlock[] = [
      { paragraphs: [{ lines: [ocrLine("| ~", box), ocrLine("Zebrano kwotę", box, 20), ocrLine("Zebrano kwotę", box)] }] },
    ]
    expect(ocrBlocksToLines(blocks, 3).map((line) => line.runs[0].text)).toEqual(["Zebrano kwotę"])
  })
})
