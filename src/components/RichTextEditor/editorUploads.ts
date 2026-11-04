import { useSyncExternalStore } from "react"

let pending = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Counts editor work that leaves temporary `blob:` image URLs in the content (pasted or
 * imported images still uploading). Shared across editors so that forms can block saving.
 */
export const editorUploads = {
  begin() {
    pending++
    emit()
  },
  end() {
    pending = Math.max(0, pending - 1)
    emit()
  },
}

export function useEditorUploadsPending(): boolean {
  return useSyncExternalStore(subscribe, () => pending > 0)
}

export const UPLOADS_PENDING_LABEL = "Wysyłanie obrazów…"
