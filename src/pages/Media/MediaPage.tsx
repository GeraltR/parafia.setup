import { useEffect, useRef, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { contentImagesApi } from "@/api/contentImages"
import { mediaApi, type MediaItem } from "@/api/media"
import { ImageCropModal } from "@/components/ImageCropModal"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/useAuth"
import { useImageCropUpload } from "@/hooks/useImageCropUpload"

function formatSize(bytes: number | null): string {
  if (bytes === null) {
    return ""
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDatePl(iso: string | null): string {
  if (!iso) {
    return ""
  }
  const date = new Date(iso)
  return date.toLocaleDateString("pl-PL")
}

export function MediaPage() {
  const { user } = useAuth()
  const canUpload = user?.canWrite.content ?? false
  const canDelete = user?.canWrite.site ?? false
  const [items, setItems] = useState<MediaItem[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { imageSrc, selectFile, cancel: cancelCrop, confirm: confirmCrop, uploading } =
    useImageCropUpload(contentImagesApi.uploadImage)

  function load() {
    setStatus("loading")
    mediaApi
      .list()
      .then((data) => {
        setItems(data)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    load()
  }, [])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      selectFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleCropSave(blob: Blob) {
    confirmCrop(blob, () => load())
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    await mediaApi.remove(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać galerii.</p>
  }

  return (
    <Card className="max-w-4xl overflow-visible">
      <CardHeader>
        <CardTitle>Galeria</CardTitle>
        {canUpload && (
          <CardAction>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="media-upload-input"
            />
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus /> {uploading ? "Przesyłanie…" : "Dodaj zdjęcie"}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <div className="grid grid-cols-1 gap-3 p-(--card-spacing)">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Galeria jest pusta.</p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border">
              <div
                className="aspect-square w-full bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url(${item.url})` }}
              />
              <div className="grid gap-0.5 p-2">
                <p className="truncate text-xs font-medium" title={item.originalName ?? undefined}>
                  {item.originalName ?? "—"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatSize(item.size)}
                  {item.size !== null && item.author && " · "}
                  {item.author?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{formatDatePl(item.createdAt)}</p>
              </div>
              {canDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {deleteTarget && (
        <Dialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Usuwanie zdjęcia</DialogTitle>
            </DialogHeader>
            <p className="text-sm">
              Czy chcesz usunąć zdjęcie{" "}
              <span className="font-medium">{deleteTarget.originalName ?? `#${deleteTarget.id}`}</span>?
              Jeśli jest używane na stronie, przestanie się tam wyświetlać.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                Anuluj
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Usuń
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ImageCropModal
        imageSrc={imageSrc}
        onCancel={cancelCrop}
        onSave={handleCropSave}
        saving={uploading}
      />
    </Card>
  )
}
