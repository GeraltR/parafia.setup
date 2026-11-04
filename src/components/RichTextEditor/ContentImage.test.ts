import { Editor } from "@tiptap/core"
import { NodeSelection } from "@tiptap/pm/state"
import StarterKit from "@tiptap/starter-kit"
import { afterEach, describe, expect, it } from "vitest"

import { ContentImage } from "./ContentImage"

describe("ContentImage", () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  function createEditor(content: string) {
    editor = new Editor({ extensions: [StarterKit, ContentImage], content })
    return editor
  }

  function selectFirstImage() {
    let imagePos = -1
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "image" && imagePos < 0) imagePos = pos
    })
    editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, imagePos)))
  }

  it("keeps the size and alignment through a load and save", () => {
    createEditor('<p>Tekst</p><img src="https://parafia.test/a.jpg" width="267" height="200" data-align="left">')

    expect(editor.getHTML()).toContain(
      '<img loading="lazy" src="https://parafia.test/a.jpg" width="267" height="200" data-align="left">',
    )
  })

  it("keeps the alt text", () => {
    createEditor('<img src="https://parafia.test/a.jpg" alt="Procesja Bożego Ciała 2005">')

    expect(editor.getHTML()).toContain('alt="Procesja Bożego Ciała 2005"')
  })

  it("drops unknown alignment values", () => {
    createEditor('<img src="https://parafia.test/a.jpg" data-align="javascript:alert(1)">')

    expect(editor.getHTML()).not.toContain("data-align")
  })

  it("aligns the selected image and resets it", () => {
    createEditor('<p>Tekst</p><img src="https://parafia.test/a.jpg">')
    selectFirstImage()

    editor.commands.setImageAlign("right")
    expect(editor.getHTML()).toContain('data-align="right"')

    editor.commands.setImageAlign(null)
    expect(editor.getHTML()).not.toContain("data-align")
  })

  it("renders corner resize handles in the editor", () => {
    createEditor('<img src="https://parafia.test/a.jpg">')

    const handles = editor.view.dom.querySelectorAll("[data-resize-handle]")
    expect(Array.from(handles, (handle) => handle.getAttribute("data-resize-handle")).sort()).toEqual([
      "bottom-left",
      "bottom-right",
      "top-left",
      "top-right",
    ])
  })
})
