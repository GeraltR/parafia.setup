import { useState } from "react"

/**
 * Drives the "select file -> crop -> upload" flow shared by every image upload
 * field in the panel. Pair with <ImageCropModal> to render the crop dialog.
 */
export function useImageCropUpload(upload: (file: File) => Promise<{ url: string }>) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [pendingFileName, setPendingFileName] = useState("image.jpg")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function selectFile(file: File) {
    setUploadError(null)
    setPendingFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }

  function cancel() {
    setImageSrc(null)
  }

  async function confirm(blob: Blob, onUploaded: (url: string) => void) {
    setUploading(true)
    setUploadError(null)
    try {
      const file = new File([blob], pendingFileName, { type: blob.type })
      const { url } = await upload(file)
      onUploaded(url)
      setImageSrc(null)
    } catch {
      setUploadError("Nie udało się przesłać obrazu.")
    } finally {
      setUploading(false)
    }
  }

  return { imageSrc, selectFile, cancel, confirm, uploading, uploadError }
}
