import { useEffect, useState } from "react"
import { Printer, X } from "lucide-react"

import { themeApi } from "@/api/theme"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useFonts } from "@/lib/fonts"
import { printContent } from "@/lib/printContent"
import type { Theme } from "@/types/config"

import type { NewsFormValues } from "./schema"

const DEFAULT_NEWS_IMAGE = "/img/elzbieta_czysta.jpg"

function formatDatePl(iso: string): string {
  if (!iso) {
    return ""
  }
  const [year, month, day] = iso.split("-")
  return `${day}.${month}.${year}`
}

export function NewsPreviewModal({
  values,
  authorName,
  onClose,
}: {
  values: NewsFormValues | null
  authorName: string | null
  onClose: () => void
}) {
  useFonts()
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    themeApi.get().then(setTheme).catch(() => setTheme(null))
  }, [])

  if (!values) {
    return null
  }

  const headingFont = theme ? `"${theme.fontHeading}", Georgia, serif` : undefined
  const bodyFont = theme ? `"${theme.fontBody}", sans-serif` : undefined
  const primaryColor = theme?.primaryColor
  const secondaryColor = theme?.secondaryColor
  const inkColor = primaryColor ? `color-mix(in srgb, ${primaryColor} 78%, black 22%)` : undefined
  const inkSoftColor = primaryColor
    ? `color-mix(in srgb, ${primaryColor} 45%, #5a6b7d 55%)`
    : undefined

  function handlePrint() {
    if (!values) {
      return
    }
    const metaHtml = `<p style="opacity:.7;font-size:.85em;font-family:${bodyFont ?? "sans-serif"};">${formatDatePl(values.date)}</p>`
    const bodyHtml = `<div style="font-family:${bodyFont ?? "sans-serif"};">${values.body || `<p>${values.excerpt}</p>`}</div>`
    printContent(
      `<h1 style="font-family:${headingFont ?? "serif"};">${values.title}</h1>${metaHtml}${bodyHtml}`
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[85vh] max-w-xl overflow-y-auto bg-white p-0 sm:max-w-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white py-2 pr-4 pl-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="size-4" />
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            <Printer className="size-4" /> Drukuj
          </button>
        </div>
        <div className="p-6 sm:p-8">
          {values.showImageOnFullContent && (
            <img
              src={values.image ?? DEFAULT_NEWS_IMAGE}
              alt={values.title}
              className="mb-4 h-48 w-full rounded-lg object-cover"
            />
          )}
          <div
            className="mb-1.5 text-xs font-semibold"
            style={{ color: secondaryColor, fontFamily: bodyFont }}
          >
            {formatDatePl(values.date)}
          </div>
          <h2
            className="mb-3 text-xl font-black"
            style={{ color: primaryColor, fontFamily: headingFont }}
          >
            {values.title}
          </h2>
          {authorName && (
            <p className="mb-3 text-xs" style={{ color: inkSoftColor, fontFamily: bodyFont }}>
              {authorName}
            </p>
          )}
          {values.body ? (
            <div
              className="rich-content"
              style={{ color: inkColor, fontFamily: bodyFont }}
              dangerouslySetInnerHTML={{ __html: values.body }}
            />
          ) : (
            <p className="text-sm" style={{ color: inkSoftColor, fontFamily: bodyFont }}>
              {values.excerpt}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
