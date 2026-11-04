import { describe, expect, it } from "vitest"

import { lineText } from "./layout"
import { fontStyle, textItemsToLines, type PositionedText } from "./textLayer"

function item(text: string, x: number, baseline: number, width: number, extra: Partial<PositionedText> = {}): PositionedText {
  return { text, x, baseline, width, fontSize: 11, fontName: "ABCDEE+Cambria", ...extra }
}

describe("fontStyle", () => {
  it.each([
    ["ABCDEE+Cambria", false, false],
    ["ABCDEE+Cambria,Bold", true, false],
    ["ABCDEE+Cambria,Italic", false, true],
    ["Arial-BoldItalicMT", true, true],
  ])("reads %s", (name, bold, italic) => {
    expect(fontStyle(name)).toEqual({ bold, italic })
  })
})

describe("textItemsToLines", () => {
  it("joins items on one baseline and adds missing spaces", () => {
    const lines = textItemsToLines([item("Msza", 50, 100, 25), item("święta", 78, 100, 30)], 600)
    expect(lines.map(lineText)).toEqual(["Msza święta"])
  })

  it("keeps two columns sharing a baseline apart", () => {
    const left = Array.from({ length: 10 }, (_, i) => item("lewa kolumna tekstu", 50, 100 + i * 14, 300))
    const right = Array.from({ length: 10 }, (_, i) => item("prawa kolumna tekstu", 450, 100 + i * 14, 300))
    const lines = textItemsToLines([...left, ...right], 800)
    expect(lines).toHaveLength(20)
    expect(lines.every((line) => !lineText(line).includes("lewa kolumna tekstu prawa"))).toBe(true)
  })

  it("splits a run-in heading from the text after a tab", () => {
    const lines = textItemsToLines(
      [
        item("CZERWIEC 2014", 42, 300, 104, { fontSize: 14, fontName: "X+Cambria,Bold" }),
        item(" ", 146, 300, 37, { fontSize: 14 }),
        item("Na pierwszy dzień czerwca", 184, 300, 150),
      ],
      600,
    )
    expect(lines.map(lineText)).toEqual(["CZERWIEC 2014", "Na pierwszy dzień czerwca"])
    expect(lines[0].runs[0].bold).toBe(true)
  })

  it("keeps wide justified gaps of the same style on one line", () => {
    const lines = textItemsToLines([item("W", 50, 100, 10), item("niedzielę", 120, 100, 45)], 600)
    expect(lines.map(lineText)).toEqual(["W niedzielę"])
  })
})
