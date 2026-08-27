import contentCss from "@/components/RichTextEditor/content.css?raw"

export function printContent(html: string) {
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    return
  }

  doc.open()
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><style>${contentCss}</style></head><body class="rich-content">${html}</body></html>`
  )
  doc.close()

  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()

  setTimeout(() => document.body.removeChild(iframe), 1000)
}
