import { useState } from "react"

import { usersApi } from "@/api/users"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AuthUser } from "@/types/auth"

export function DeleteUserDialog({
  user,
  onOpenChange,
  onSuccess,
}: {
  user: AuthUser
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setError(null)
    setIsDeleting(true)
    try {
      await usersApi.remove(user.id)
      onSuccess()
    } catch {
      setError("Nie udało się usunąć konta.")
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usuwanie konta</DialogTitle>
        </DialogHeader>
        <p className="text-sm">
          Czy chcesz usunąć konto <span className="font-medium">{user.name}</span>?
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Usuwanie…" : "Usuń konto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
