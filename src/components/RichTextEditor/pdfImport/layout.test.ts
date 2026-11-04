import { describe, expect, it } from "vitest"

import { blocksToHtml, detectColumnSplits, layoutDocument } from "./layout"
import type { PageContent, PageImage, TextLine } from "./types"

const BODY = 11
const LEADING = 14

interface LineOptions {
  width?: number
  size?: number
  bold?: boolean
  italic?: boolean
}

function line(text: string, x: number, y: number, options: LineOptions = {}): TextLine {
  const size = options.size ?? BODY
  return {
    x,
    y,
    width: options.width ?? 300,
    height: size,
    fontSize: size,
    runs: [{ text, bold: options.bold ?? false, italic: options.italic ?? false }],
  }
}

/** Body-text lines of one column: left margin 50, right margin 350. */
function column(texts: string[], startY: number, x = 50): TextLine[] {
  return texts.map((text, i) => line(text, x, startY + i * LEADING))
}

function page(lines: TextLine[], images: PageImage[] = [], width = 600, height = 800): PageContent {
  return { width, height, lines, images }
}

function html(pages: PageContent[]): string {
  return blocksToHtml(layoutDocument(pages))
}

describe("detectColumnSplits", () => {
  it("finds the gutter between two columns", () => {
    const boxes = [...column(["a", "b", "c"], 100, 50), ...column(["d", "e", "f"], 100, 420)].map((box) => ({
      ...box,
      width: 300,
    }))
    const splits = detectColumnSplits(boxes, 800)
    expect(splits).toHaveLength(1)
    expect(splits[0]).toBeGreaterThan(350)
    expect(splits[0]).toBeLessThan(420)
  })

  it("keeps a single column together", () => {
    expect(detectColumnSplits(column(["a", "b", "c"], 100), 600)).toEqual([])
  })

  it("ignores a single heading spanning the gutter", () => {
    const body = [...column(Array(20).fill("x"), 100, 50), ...column(Array(20).fill("y"), 100, 420)]
    const boxes = [...body, line("TITLE", 50, 60, { width: 670 })]
    expect(detectColumnSplits(boxes, 800)).toHaveLength(1)
  })
})

describe("layoutDocument", () => {
  it("joins wrapped lines and starts paragraphs at first-line indents", () => {
    const lines = [
      line("Pierwszy akapit zaczyna się", 70, 100),
      line("i trwa dalej do końca.", 50, 114, { width: 150 }),
      line("Drugi akapit.", 70, 128, { width: 100 }),
    ]
    expect(html([page(lines)])).toBe("<p>Pierwszy akapit zaczyna się i trwa dalej do końca.</p><p>Drugi akapit.</p>")
  })

  it("starts a paragraph after a larger vertical gap", () => {
    // Enough lines for the normal leading to be measurable.
    const lines = [...column(["Jeden", "dwa", "trzy."], 100), ...column(["Cztery", "pięć."], 160)]
    expect(html([page(lines)])).toBe("<p>Jeden dwa trzy.</p><p>Cztery pięć.</p>")
  })

  it("removes end-of-line hyphenation", () => {
    const lines = [line("procesja wyru-", 50, 100), line("szyła z kościoła.", 50, 114, { width: 120 })]
    expect(html([page(lines)])).toBe("<p>procesja wyruszyła z kościoła.</p>")
  })

  it("keeps inline bold and italic", () => {
    const styled: TextLine = {
      ...line("", 50, 100),
      runs: [
        { text: "Hasło: ", bold: false, italic: false },
        { text: "Głosić Ewangelię", bold: false, italic: true },
        { text: " i ", bold: false, italic: false },
        { text: "<nadzieję>", bold: true, italic: false },
      ],
    }
    expect(html([page([styled])])).toBe(
      "<p>Hasło: <em>Głosić Ewangelię</em> i <strong>&lt;nadzieję&gt;</strong></p>",
    )
  })

  it("detects headings by size, by bold and by chronicle dates", () => {
    const lines = [
      line("ROK 2013", 50, 60, { size: 22, width: 120 }),
      line("Sprawy różne", 50, 100, { bold: true, width: 100 }),
      line("Treść akapitu.", 70, 120, { width: 120 }),
      // OCR misreads the year, but a short line starting with a month is still a heading.
      line("Styczeń 200brr.", 50, 160, { width: 110 }),
      line("Dalsza treść.", 70, 180, { width: 120 }),
    ]
    expect(html([page(lines)])).toBe(
      "<h2>ROK 2013</h2><h3>Sprawy różne</h3><p>Treść akapitu.</p><h2>Styczeń 200brr.</h2><p>Dalsza treść.</p>",
    )
  })

  it("turns quoted italic verses into a blockquote with line breaks", () => {
    const lines = [
      ...column(["Duszpasterze złożyli", "Parafianom życzenia:"], 60),
      line("„Niech Nowo Narodzony Bóg", 80, 100, { italic: true, width: 160 }),
      line("obdarza Was nadzieją”.", 80, 114, { italic: true, width: 150 }),
    ]
    expect(html([page(lines)])).toBe(
      "<p>Duszpasterze złożyli Parafianom życzenia:</p>" +
        "<blockquote><p><em>„Niech Nowo Narodzony Bóg</em><br><em>obdarza Was nadzieją”.</em></p></blockquote>",
    )
  })

  it("separates an announcement intro from the quote below it", () => {
    const lines = [
      line("Z ogłoszeń na dzień 9 stycznia:", 70, 100, { width: 180 }),
      line("”Caritas została zarejestrowana", 70, 114),
      line("jako Organizacja Pożytku Publicznego”.", 50, 128, { width: 200 }),
    ]
    expect(html([page(lines)])).toBe(
      "<p>Z ogłoszeń na dzień 9 stycznia:</p>" +
        "<blockquote><p>”Caritas została zarejestrowana jako Organizacja Pożytku Publicznego”.</p></blockquote>",
    )
  })

  it("reads columns left to right and glues a paragraph split between them", () => {
    const left = [...column(["Lewa kolumna", "kończy się w pół zdania, Ks."], 100, 50)]
    const right = [
      line("Proboszcz podziękował wszystkim.", 420, 100),
      ...column(["Dalej prawa", "kolumna."], 114, 420),
    ]
    expect(html([page([...right, ...left], [], 800)])).toBe(
      "<p>Lewa kolumna kończy się w pół zdania, Ks. Proboszcz podziękował wszystkim. Dalej prawa kolumna.</p>",
    )
  })

  it("does not glue a heading at the top of the next page to the previous paragraph", () => {
    const first = page([line("Procesje odbywały się wokół kościoła.", 50, 700)])
    const second = page([
      line("CZERWIEC 2013", 50, 60, { size: 14, bold: true, width: 100 }),
      line("Treść.", 70, 90, { width: 60 }),
    ])
    expect(html([first, second])).toBe(
      "<p>Procesje odbywały się wokół kościoła.</p><h2>CZERWIEC 2013</h2><p>Treść.</p>",
    )
  })

  it("places images by vertical position, also when they sit beside the text", () => {
    const lines = [line("Przed zdjęciem.", 50, 100, { width: 120 }), line("Po zdjęciu.", 70, 400, { width: 120 })]
    const photo: PageImage = { x: 420, y: 200, width: 150, height: 150, src: "data:image/jpeg;base64,AAAA" }
    expect(html([page(lines, [photo])])).toBe(
      '<p>Przed zdjęciem.</p><img src="data:image/jpeg;base64,AAAA" width="200"><p>Po zdjęciu.</p>',
    )
  })

  it("floats an image that has text running beside it", () => {
    const lines = [
      line("Przed zdjęciem.", 50, 100, { width: 120 }),
      ...column(["Tekst obok", "zdjęcia biegnie", "w trzech liniach."], 200),
    ]
    const photo: PageImage = { x: 420, y: 195, width: 150, height: 120, src: "data:image/jpeg;base64,AAAA" }
    expect(html([page(lines, [photo])])).toBe(
      '<p>Przed zdjęciem.</p><img src="data:image/jpeg;base64,AAAA" width="200" data-align="right">' +
        "<p>Tekst obok zdjęcia biegnie w trzech liniach.</p>",
    )
  })

  it("moves a floated photo starting above a section title below the title", () => {
    const lines = [
      line("Luty 2005 r.", 50, 200, { width: 100 }),
      ...column(["Tekst obok", "zdjęcia biegnie", "w trzech liniach."], 230),
    ]
    const photo: PageImage = { x: 420, y: 190, width: 150, height: 120, src: "data:image/jpeg;base64,AAAA" }
    expect(html([page(lines, [photo])])).toBe(
      '<h2>Luty 2005 r.</h2><img src="data:image/jpeg;base64,AAAA" width="200" data-align="right">' +
        "<p>Tekst obok zdjęcia biegnie w trzech liniach.</p>",
    )
  })

  it("keeps wide images on their own line", () => {
    const lines = column(["Tekst obok", "szerokiego", "zdjęcia."], 200, 10)
    const photo: PageImage = { x: 200, y: 195, width: 380, height: 120, src: "data:image/jpeg;base64,AAAA" }
    expect(html([page(lines, [photo])])).not.toContain("data-align")
  })

  it("drops bare page numbers in the margins", () => {
    const lines = [line("Treść strony.", 50, 100, { width: 120 }), line("12", 290, 770, { width: 12 })]
    expect(html([page(lines)])).toBe("<p>Treść strony.</p>")
  })
})
