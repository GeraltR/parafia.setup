import { useEffect, useState } from "react"

import { Plus } from "lucide-react"

import { informacjeApi } from "@/api/informacje"
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
import type { InfoItem } from "@/types/config"

import { InfoItemEditor } from "./InfoItemEditor"
import { InfoItemList } from "./InfoItemList"
import type { InfoItemFormValues } from "./schema"

type Mode = { type: "list" } | { type: "new" } | { type: "edit"; item: InfoItem }

export function InformacjePage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [items, setItems] = useState<InfoItem[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [mode, setMode] = useState<Mode>({ type: "list" })
  const [deleteTarget, setDeleteTarget] = useState<InfoItem | null>(null)

  function load() {
    setStatus("loading")
    informacjeApi
      .listManage()
      .then((data) => {
        setItems(data)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    load()
  }, [])

  async function handlePublish(values: InfoItemFormValues) {
    if (mode.type === "edit") {
      await informacjeApi.update(mode.item.id, values)
    } else {
      await informacjeApi.create(values)
    }
    setMode({ type: "list" })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    await informacjeApi.remove(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać informacji.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Informacje dodatkowe</CardTitle>
          <span className="text-sm text-muted-foreground">
            – będą widoczne na stronie w zdefiniowanym okresie
          </span>
        </div>
        {mode.type === "list" && canWrite && (
          <CardAction>
            <Button type="button" size="sm" onClick={() => setMode({ type: "new" })}>
              <Plus /> Dodaj informację
            </Button>
          </CardAction>
        )}
      </CardHeader>
      {mode.type === "list" ? (
        <InfoItemList
          items={items}
          canWrite={canWrite}
          onEdit={(item) => setMode({ type: "edit", item })}
          onDelete={setDeleteTarget}
        />
      ) : (
        <InfoItemEditor
          infoItem={mode.type === "edit" ? mode.item : null}
          onPublish={handlePublish}
          onCancel={() => setMode({ type: "list" })}
        />
      )}

      {deleteTarget && (
        <Dialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Usuwanie informacji</DialogTitle>
            </DialogHeader>
            <p className="text-sm">
              Czy chcesz usunąć informację{" "}
              <span className="font-medium">{deleteTarget.title}</span>?
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
    </Card>
  )
}
