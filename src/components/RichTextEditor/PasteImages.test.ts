import { Editor } from "@tiptap/core"
import Image from "@tiptap/extension-image"
import StarterKit from "@tiptap/starter-kit"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { classifySrc, dataUrlToFile, PasteImages, prepareHtml } from "./PasteImages"

// 1x1 transparent PNG
const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

function pngFile(name = "photo.png") {
  return new File([new Uint8Array([137, 80, 78, 71])], name, { type: "image/png" })
}

function sequentialUrls() {
  let next = 0
  return () => `blob:temp-${++next}`
}

describe("classifySrc", () => {
  it.each([
    ["https://example.com/a.png", "remote"],
    ["//cdn.example.com/a.png", "remote"],
    ["/storage/content/a.png", "remote"],
    [PNG_DATA_URL, "inline"],
    ["file:///Users/me/Library/a.png", "unreachable"],
    ["blob:https://other.app/123", "unreachable"],
    ["webkit-fake-url://abc/image.tiff", "unreachable"],
    [null, "unreachable"],
  ])("classifies %s as %s", (src, kind) => {
    expect(classifySrc(src)).toBe(kind)
  })
})

describe("dataUrlToFile", () => {
  it("decodes a base64 image", async () => {
    const file = dataUrlToFile(PNG_DATA_URL, "pasted-1")
    expect(file?.name).toBe("pasted-1.png")
    expect(file?.type).toBe("image/png")
    const signature = new Uint8Array(await file!.arrayBuffer()).slice(0, 4)
    expect(Array.from(signature)).toEqual([137, 80, 78, 71])
  })

  it("rejects non-image data", () => {
    expect(dataUrlToFile("data:text/plain;base64,SGVsbG8=", "x")).toBeNull()
  })
})

describe("prepareHtml", () => {
  it("keeps remote images untouched", () => {
    const result = prepareHtml('<p>a</p><img src="https://example.com/a.png">', [], sequentialUrls())
    expect(result.uploads).toHaveLength(0)
    expect(result.lost).toBe(0)
    expect(result.html).toContain('src="https://example.com/a.png"')
  })

  it("turns inline images into uploads", () => {
    const result = prepareHtml(`<img src="${PNG_DATA_URL}">`, [], sequentialUrls())
    expect(result.uploads).toHaveLength(1)
    expect(result.uploads[0].file.type).toBe("image/png")
    expect(result.html).toContain('src="blob:temp-1"')
  })

  it("matches unreachable images with clipboard files in order", () => {
    const first = pngFile("first.png")
    const second = pngFile("second.png")
    const result = prepareHtml(
      '<img src="file:///a.png"><p>text</p><img src="file:///b.png" srcset="file:///b@2x.png 2x">',
      [first, second],
      sequentialUrls(),
    )
    expect(result.uploads.map((upload) => upload.file)).toEqual([first, second])
    expect(result.html).not.toContain("file://")
    expect(result.lost).toBe(0)
  })

  it("drops unreachable images without data and counts them", () => {
    const result = prepareHtml('<p>a</p><img src="file:///a.png"><img src="file:///b.png">', [], sequentialUrls())
    expect(result.lost).toBe(2)
    expect(result.html).toBe("<p>a</p>")
  })

  it("appends files to text-only html", () => {
    const result = prepareHtml("<p>text</p>", [pngFile()], sequentialUrls())
    expect(result.html).toBe('<p>text</p><img src="blob:temp-1">')
    expect(result.uploads).toHaveLength(1)
  })

  it("ignores extra files when html already has images", () => {
    const result = prepareHtml('<img src="https://example.com/a.png">', [pngFile()], sequentialUrls())
    expect(result.uploads).toHaveLength(0)
  })
})

describe("PasteImages extension", () => {
  const createObjectURL = URL.createObjectURL
  let editor: Editor

  beforeEach(() => {
    URL.createObjectURL = vi.fn(sequentialUrls())
  })

  afterEach(() => {
    editor?.destroy()
    URL.createObjectURL = createObjectURL
  })

  function createEditor(upload: (file: File) => Promise<{ url: string }>) {
    const status = { started: 0, succeeded: 0, failed: 0, lost: 0 }
    editor = new Editor({
      extensions: [
        StarterKit,
        Image,
        PasteImages.configure({
          upload,
          onUploadStart: () => status.started++,
          onUploadSettled: (success) => (success ? status.succeeded++ : status.failed++),
          onImagesLost: (count) => (status.lost += count),
        }),
      ],
      content: "<p></p>",
    })
    return status
  }

  function paste(data: { html?: string; files?: File[] }) {
    const files = data.files ?? []
    const clipboardData = {
      types: data.html ? ["text/html"] : ["Files"],
      files,
      getData: (type: string) => (type === "text/html" ? (data.html ?? "") : ""),
    }
    const event = { clipboardData, preventDefault: () => {} } as unknown as ClipboardEvent
    return editor.view.someProp("handlePaste", (handler) =>
      handler(editor.view, event, editor.view.state.doc.slice(0)),
    )
  }

  function imageSources() {
    const sources: string[] = []
    editor.state.doc.descendants((node) => {
      if (node.type.name === "image") sources.push(node.attrs.src)
    })
    return sources
  }

  it("uploads pasted image files and swaps in the final url", async () => {
    const status = createEditor(async (file) => ({ url: `https://parafia.test/storage/${file.name}` }))

    expect(paste({ files: [pngFile("one.png"), pngFile("two.png")] })).toBe(true)
    expect(imageSources()).toEqual(["blob:temp-1", "blob:temp-2"])

    await vi.waitFor(() => expect(status.succeeded).toBe(2))
    expect(imageSources()).toEqual([
      "https://parafia.test/storage/one.png",
      "https://parafia.test/storage/two.png",
    ])
    expect(editor.getHTML()).not.toContain("blob:")
  })

  it("keeps text and uploads images pasted as html", async () => {
    const status = createEditor(async () => ({ url: "https://parafia.test/storage/a.png" }))

    expect(paste({ html: `<p>Historia parafii</p><img src="${PNG_DATA_URL}">` })).toBe(true)

    await vi.waitFor(() => expect(status.succeeded).toBe(1))
    expect(editor.getHTML()).toContain("Historia parafii")
    expect(imageSources()).toEqual(["https://parafia.test/storage/a.png"])
  })

  it("removes dead images and reports them", () => {
    const status = createEditor(async () => ({ url: "unused" }))

    expect(paste({ html: '<p>Tekst</p><img src="file:///tmp/a.png">' })).toBe(true)

    expect(status.lost).toBe(1)
    expect(imageSources()).toEqual([])
    expect(editor.getHTML()).toContain("Tekst")
  })

  it("removes the placeholder when the upload fails", async () => {
    const status = createEditor(() => Promise.reject(new Error("413")))

    paste({ files: [pngFile()] })

    await vi.waitFor(() => expect(status.failed).toBe(1))
    expect(imageSources()).toEqual([])
  })

  it("inserts imported html at the cursor and uploads its images", async () => {
    const status = createEditor(async () => ({ url: "https://parafia.test/storage/kronika.jpg" }))

    editor.commands.insertHtmlWithImages(`<h2>Styczeń 2005 r.</h2><p>Treść</p><img src="${PNG_DATA_URL}">`)

    await vi.waitFor(() => expect(status.succeeded).toBe(1))
    expect(editor.getHTML()).toContain("<h2>Styczeń 2005 r.</h2>")
    expect(imageSources()).toEqual(["https://parafia.test/storage/kronika.jpg"])
  })

  it("uploads at most three images at a time", async () => {
    let running = 0
    let peak = 0
    const status = createEditor(async (file) => {
      running++
      peak = Math.max(peak, running)
      await new Promise((resolve) => setTimeout(resolve, 5))
      running--
      return { url: `https://parafia.test/storage/${file.name}` }
    })

    editor.commands.insertHtmlWithImages(Array(7).fill(`<img src="${PNG_DATA_URL}">`).join(""))

    await vi.waitFor(() => expect(status.succeeded).toBe(7))
    expect(peak).toBe(3)
    expect(imageSources().every((src) => src.startsWith("https://"))).toBe(true)
  })

  it("leaves plain html pastes to the default handler", () => {
    const status = createEditor(async () => ({ url: "unused" }))

    expect(paste({ html: "<p>Tylko tekst</p>" })).toBeFalsy()
    expect(status.started).toBe(0)
  })
})
