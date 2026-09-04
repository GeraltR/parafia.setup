import { useEffect, useState } from "react"

import { mediaApi, type MediaItem } from "@/api/media"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    if (!open) {
      return
    }
    setStatus("loading")
    mediaApi
      .list()
      .then((data) => {
        setItems(data)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Wybierz zdjęcie z galerii</DialogTitle>
        </DialogHeader>
        {status === "loading" && (
          <p className="text-sm text-muted-foreground">Ładowanie…</p>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive">Nie udało się wczytać galerii.</p>
        )}
        {status === "ready" && items.length === 0 && (
          <p className="text-sm text-muted-foreground">Galeria jest pusta.</p>
        )}
        {status === "ready" && items.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.url)
                  onClose()
                }}
                className="aspect-square overflow-hidden rounded-lg border bg-muted bg-cover bg-center transition-opacity hover:opacity-80"
                style={{ backgroundImage: `url(${item.url})` }}
                title={item.originalName ?? undefined}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
