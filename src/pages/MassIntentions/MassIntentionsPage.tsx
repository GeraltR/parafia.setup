import { useEffect, useState } from "react"

import { massIntentionsApi } from "@/api/massIntentions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"
import type { MassIntention, MassIntentionsData } from "@/types/config"

import { ConfigColors } from "./ConfigColors"
import { IntentionEditor } from "./IntentionEditor"
import { IntentionList } from "./IntentionList"
import type { ConfigFormValues, IntentionFormValues } from "./schema"

type Mode = { type: "list" } | { type: "new" } | { type: "edit"; intention: MassIntention }

export function MassIntentionsPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [data, setData] = useState<MassIntentionsData | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [mode, setMode] = useState<Mode>({ type: "list" })
  const [deleteTarget, setDeleteTarget] = useState<MassIntention | null>(null)

  function load() {
    setStatus("loading")
    massIntentionsApi
      .listManage()
      .then((result) => {
        setData(result)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    load()
  }, [])

  async function handlePublish(values: IntentionFormValues) {
    if (mode.type === "edit") {
      await massIntentionsApi.update(mode.intention.id, values)
    } else {
      await massIntentionsApi.create(values)
    }
    setMode({ type: "list" })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    await massIntentionsApi.remove(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  async function handleSaveColors(values: ConfigFormValues) {
    await massIntentionsApi.updateConfig(values)
    load()
  }

  if (status === "loading" || !data) {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać intencji.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <CardTitle>Intencje mszalne</CardTitle>
      </CardHeader>
      <div className="grid gap-4 px-(--card-spacing)">
        <ConfigColors config={data.config} canWrite={canWrite} onSave={handleSaveColors} />
      </div>
      <Separator />
      {mode.type === "list" ? (
        <IntentionList
          items={data.items}
          config={data.config}
          canWrite={canWrite}
          onAdd={() => setMode({ type: "new" })}
          onEdit={(intention) => setMode({ type: "edit", intention })}
          onDelete={setDeleteTarget}
        />
      ) : (
        <IntentionEditor
          intention={mode.type === "edit" ? mode.intention : null}
          onPublish={handlePublish}
          onCancel={() => setMode({ type: "list" })}
        />
      )}

      {deleteTarget && (
        <Dialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Usuwanie intencji</DialogTitle>
            </DialogHeader>
            <p className="text-sm">
              Czy chcesz usunąć intencję{" "}
              <span className="font-medium">{deleteTarget.intention}</span>?
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
