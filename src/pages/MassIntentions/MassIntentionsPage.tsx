import { useEffect, useRef, useState } from "react"

import { massIntentionsApi } from "@/api/massIntentions"
import { DatePicker } from "@/components/DatePicker"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"
import { printMassIntentions } from "@/lib/printMassIntentions"
import type { MassIntention, MassIntentionsManageData } from "@/types/config"

const SEARCH_MIN_LENGTH = 3
const SEARCH_DEBOUNCE_MS = 300

import { ConfigColors } from "./ConfigColors"
import { IntentionEditor } from "./IntentionEditor"
import { IntentionList } from "./IntentionList"
import type { ConfigFormValues, IntentionFormValues } from "./schema"

type Mode = { type: "list" } | { type: "new" } | { type: "edit"; intention: MassIntention }

export function MassIntentionsPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [data, setData] = useState<MassIntentionsManageData | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [mode, setMode] = useState<Mode>({ type: "list" })
  const [deleteTarget, setDeleteTarget] = useState<MassIntention | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const isFirstRender = useRef(true)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [printFromDate, setPrintFromDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [printError, setPrintError] = useState<string | null>(null)
  const [printing, setPrinting] = useState(false)

  function load(targetPage: number = page, targetSearch: string = search) {
    setStatus("loading")
    const effectiveSearch = targetSearch.length > SEARCH_MIN_LENGTH ? targetSearch : ""
    massIntentionsApi
      .listManage(targetPage, effectiveSearch)
      .then((result) => {
        setData(result)
        setPage(result.meta.currentPage)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timeout = setTimeout(() => load(1, search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

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

  async function handlePrint() {
    setPrintError(null)
    setPrinting(true)
    try {
      const items = await massIntentionsApi.printList(printFromDate)
      printMassIntentions(items, printFromDate)
      setPrintDialogOpen(false)
    } catch {
      setPrintError("Nie udało się przygotować wydruku.")
    } finally {
      setPrinting(false)
    }
  }

  if (!data && status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (!data && status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać intencji.</p>
  }

  if (!data) {
    return null
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
        <>
          <div className="px-(--card-spacing) pt-(--card-spacing)">
            <Input
              type="search"
              placeholder="Szukaj po treści intencji, opisie dnia lub dacie (np. 29.08)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <IntentionList
            items={data.items}
            config={data.config}
            canWrite={canWrite}
            onAdd={() => setMode({ type: "new" })}
            onEdit={(intention) => setMode({ type: "edit", intention })}
            onDelete={setDeleteTarget}
            onPrint={() => setPrintDialogOpen(true)}
          />
          <div className="flex items-center justify-between gap-3 border-t p-(--card-spacing)">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={data.meta.currentPage <= 1}
              onClick={() => load(data.meta.currentPage - 1)}
            >
              Poprzednia
            </Button>
            <span className="text-sm text-muted-foreground">
              Strona {data.meta.currentPage} z {data.meta.lastPage} ({data.meta.total} intencji)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={data.meta.currentPage >= data.meta.lastPage}
              onClick={() => load(data.meta.currentPage + 1)}
            >
              Następna
            </Button>
          </div>
        </>
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

      {printDialogOpen && (
        <Dialog open onOpenChange={(open) => !open && setPrintDialogOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Drukuj intencje</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Wybierz datę początkową — wydrukowane zostaną wszystkie intencje od tego dnia do
              najmłodszego wpisanego.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="print-from-date">Od dnia</Label>
              <DatePicker id="print-from-date" value={printFromDate} onChange={setPrintFromDate} />
            </div>
            {printError && <p className="text-sm text-destructive">{printError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPrintDialogOpen(false)}>
                Anuluj
              </Button>
              <Button type="button" onClick={handlePrint} disabled={printing}>
                {printing ? "Przygotowywanie…" : "Drukuj"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
