import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useVersionCheck } from "@/hooks/useVersionCheck"

export function VersionUpdateModal() {
  const { newVersionAvailable, dismiss, refresh } = useVersionCheck()

  return (
    <Dialog open={newVersionAvailable} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Dostępna nowa wersja panelu</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Panel został zaktualizowany. Odśwież, aby zobaczyć najnowszą wersję.
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={dismiss}>
            Nie teraz
          </Button>
          <Button type="button" onClick={refresh}>
            Odśwież
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
