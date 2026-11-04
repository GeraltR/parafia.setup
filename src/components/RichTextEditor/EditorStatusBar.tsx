import type { ExtractProgress } from "./pdfImport/extractPages"

export function EditorStatusBar({
  pdfProgress,
  pendingUploads,
  failedImages,
  error,
  onDismiss,
}: {
  pdfProgress: ExtractProgress | null
  pendingUploads: number
  failedImages: number
  error: string | null
  onDismiss: () => void
}) {
  let message: string | null = null
  if (pdfProgress) {
    message =
      pdfProgress.pageCount === 0
        ? "Import PDF: wczytywanie pliku…"
        : `Import PDF: strona ${pdfProgress.page} z ${pdfProgress.pageCount}` +
          (pdfProgress.ocr ? " – rozpoznawanie tekstu (OCR)…" : "…")
  } else if (pendingUploads > 0) {
    message = `Przesyłanie obrazków… (pozostało: ${pendingUploads})`
  }

  const problems = [
    error,
    failedImages > 0
      ? `Nie udało się wkleić obrazków: ${failedImages}. Dodaj je ręcznie przyciskiem „Wstaw obraz” (maks. 5 MB).`
      : null,
  ].filter(Boolean)

  if (!message && problems.length === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-2 border-t px-4 py-2 text-sm">
      {message ? (
        <span className="text-muted-foreground">{message}</span>
      ) : (
        <>
          <span className="text-destructive">{problems.join(" ")}</span>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={onDismiss}
          >
            Zamknij
          </button>
        </>
      )}
    </div>
  )
}
