import { Extension, type Editor } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pasteImages: {
      /** Inserts HTML at the selection and uploads its inline (data:) images. */
      insertHtmlWithImages: (html: string) => ReturnType
    }
  }
}

/** Uploads run a few at a time so a long import does not flood the server. */
const MAX_PARALLEL_UPLOADS = 3

export interface PasteImagesOptions {
  upload: (file: File) => Promise<{ url: string }>
  onUploadStart: () => void
  onUploadSettled: (success: boolean) => void
  /** Images that were present in the clipboard but whose data could not be read. */
  onImagesLost: (count: number) => void
}

interface PendingUpload {
  tempUrl: string
  file: File
}

export interface PreparedHtml {
  html: string
  uploads: PendingUpload[]
  lost: number
}

type SrcKind = "remote" | "inline" | "unreachable"

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/")
}

/**
 * "remote" sources can be kept as-is, "inline" ones carry their own data and can be
 * uploaded, "unreachable" ones (file:, foreign blob:, webkit-fake-url:, ...) point at
 * data the browser will never give us.
 */
export function classifySrc(src: string | null): SrcKind {
  if (!src) return "unreachable"
  if (/^data:image\//i.test(src)) return "inline"
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("/")) return "remote"
  return "unreachable"
}

export function dataUrlToFile(dataUrl: string, baseName: string): File | null {
  const match = /^data:(image\/[\w.+-]+)(;base64)?,(.*)$/is.exec(dataUrl)
  if (!match) return null
  const [, mimeType, isBase64, payload] = match
  try {
    const binary = isBase64 ? atob(payload) : decodeURIComponent(payload)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const extension = mimeType.split("/")[1].replace("+xml", "").replace("jpeg", "jpg")
    return new File([bytes], `${baseName}.${extension}`, { type: mimeType })
  } catch {
    return null
  }
}

/**
 * Rewrites pasted HTML so that every image either points at a working URL or at a
 * temporary object URL that will be swapped for the uploaded one. Images the browser
 * cannot read are matched, in order, with image files from the clipboard; if there are
 * none left the <img> is dropped and counted as lost.
 */
export function prepareHtml(
  html: string,
  files: File[],
  createObjectUrl: (file: File) => string,
): PreparedHtml {
  const doc = new DOMParser().parseFromString(html, "text/html")
  const images = Array.from(doc.body.querySelectorAll("img"))
  const queue = [...files]
  const uploads: PendingUpload[] = []
  let lost = 0

  const useFile = (img: HTMLImageElement, file: File) => {
    const tempUrl = createObjectUrl(file)
    img.setAttribute("src", tempUrl)
    img.removeAttribute("srcset")
    uploads.push({ tempUrl, file })
  }

  images.forEach((img, index) => {
    const src = img.getAttribute("src")
    const kind = classifySrc(src)
    if (kind === "remote") return

    const file =
      kind === "inline" ? dataUrlToFile(src as string, `pasted-${index + 1}`) : queue.shift()
    if (file) {
      useFile(img, file)
    } else {
      img.remove()
      lost++
    }
  })

  // Text-only HTML alongside image files (e.g. text + pictures copied together):
  // keep both. When the HTML already had images, extra files are most likely
  // duplicates of them, so they are ignored.
  if (images.length === 0) {
    queue.forEach((file) => {
      const img = doc.createElement("img")
      useFile(img, file)
      doc.body.appendChild(img)
    })
  }

  return { html: doc.body.innerHTML, uploads, lost }
}

function replaceImageSrc(editor: Editor, tempUrl: string, url: string | null) {
  if (editor.isDestroyed) return
  const { state } = editor
  const tr = state.tr
  const toDelete: Array<{ from: number; to: number }> = []

  state.doc.descendants((node, pos) => {
    if (node.type.name !== "image" || node.attrs.src !== tempUrl) return
    if (url) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: url })
    } else {
      toDelete.push({ from: pos, to: pos + node.nodeSize })
    }
  })

  toDelete.reverse().forEach(({ from, to }) => tr.delete(from, to))
  if (!tr.docChanged) return
  // The swap is not a user action, so it should not be a separate undo step.
  tr.setMeta("addToHistory", false)
  editor.view.dispatch(tr)
}

function startUploads(editor: Editor, uploads: PendingUpload[], options: PasteImagesOptions) {
  const queue = [...uploads]
  queue.forEach(() => options.onUploadStart())

  const next = async (): Promise<void> => {
    const item = queue.shift()
    if (!item) return
    try {
      const { url } = await options.upload(item.file)
      replaceImageSrc(editor, item.tempUrl, url)
      options.onUploadSettled(true)
    } catch {
      replaceImageSrc(editor, item.tempUrl, null)
      options.onUploadSettled(false)
    }
    return next()
  }

  for (let i = 0; i < Math.min(MAX_PARALLEL_UPLOADS, queue.length); i++) void next()
}

function imageFilesFrom(transfer: DataTransfer | null): File[] {
  return transfer ? Array.from(transfer.files).filter(isImageFile) : []
}

export const PasteImages = Extension.create<PasteImagesOptions>({
  name: "pasteImages",

  addOptions() {
    return {
      upload: () => Promise.reject(new Error("PasteImages: upload option is not configured")),
      onUploadStart: () => {},
      onUploadSettled: () => {},
      onImagesLost: () => {},
    }
  },

  addCommands() {
    return {
      insertHtmlWithImages:
        (html) =>
        ({ editor, commands, dispatch }) => {
          if (!dispatch) return true
          const prepared = prepareHtml(html, [], (file) => URL.createObjectURL(file))
          if (!commands.insertContent(prepared.html)) return false
          if (prepared.lost > 0) this.options.onImagesLost(prepared.lost)
          startUploads(editor, prepared.uploads, this.options)
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const editor = this.editor
    const options = this.options
    let reentrant = false

    const imageNodes = (files: File[]) =>
      files.map((file) => {
        const tempUrl = URL.createObjectURL(file)
        return { upload: { tempUrl, file }, node: { type: "image", attrs: { src: tempUrl } } }
      })

    return [
      new Plugin({
        key: new PluginKey("pasteImages"),
        props: {
          handlePaste: (view, event) => {
            const data = event.clipboardData
            if (reentrant || !data) return false

            const html = data.getData("text/html")
            const files = imageFilesFrom(data)

            if (html) {
              const prepared = prepareHtml(html, files, (file) => URL.createObjectURL(file))
              if (prepared.uploads.length === 0 && prepared.lost === 0) return false

              reentrant = true
              try {
                view.pasteHTML(prepared.html, event)
              } finally {
                reentrant = false
              }
              if (prepared.lost > 0) options.onImagesLost(prepared.lost)
              startUploads(editor, prepared.uploads, options)
              return true
            }

            if (files.length === 0) return false
            const items = imageNodes(files)
            editor.chain().focus().insertContent(items.map((item) => item.node)).run()
            startUploads(editor, items.map((item) => item.upload), options)
            return true
          },

          handleDrop: (view, event, _slice, moved) => {
            const files = imageFilesFrom(event.dataTransfer)
            if (moved || files.length === 0) return false

            const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
            const items = imageNodes(files)
            const nodes = items.map((item) => item.node)
            if (position === undefined) {
              editor.chain().focus().insertContent(nodes).run()
            } else {
              editor.chain().focus().insertContentAt(position, nodes).run()
            }
            startUploads(editor, items.map((item) => item.upload), options)
            return true
          },
        },
      }),
    ]
  },
})
