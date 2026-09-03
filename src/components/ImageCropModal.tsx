import { useRef } from "react"
import { Cropper, type ReactCropperElement } from "react-cropper"
import "cropperjs/dist/cropper.css"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ImageCropModal({
  imageSrc,
  onCancel,
  onSave,
  saving,
}: {
  imageSrc: string | null
  onCancel: () => void
  onSave: (blob: Blob) => void
  saving: boolean
}) {
  const cropperRef = useRef<ReactCropperElement>(null)

  function handleSave() {
    const canvas = cropperRef.current?.cropper.getCroppedCanvas()
    if (!canvas) {
      return
    }
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob)
        }
      },
      "image/jpeg",
      0.92
    )
  }

  return (
    <Dialog open={imageSrc !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kadrowanie obrazu</DialogTitle>
        </DialogHeader>
        {imageSrc && (
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            style={{ height: 360, width: "100%" }}
            aspectRatio={NaN}
            viewMode={1}
            guides
            background={false}
            responsive
            autoCropArea={1}
          />
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Anuluj
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Zapisywanie…" : "Zapisz kadrowanie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
