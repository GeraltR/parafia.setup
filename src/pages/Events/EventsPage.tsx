import { useEffect, useState } from "react"

import { eventsApi } from "@/api/events"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/useAuth"
import type { EventItem } from "@/types/config"

import { EventEditor } from "./EventEditor"
import { EventList } from "./EventList"
import type { EventFormValues } from "./schema"

type Mode = { type: "list" } | { type: "new" } | { type: "edit"; event: EventItem }

export function EventsPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [events, setEvents] = useState<EventItem[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [mode, setMode] = useState<Mode>({ type: "list" })
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null)

  function load() {
    setStatus("loading")
    eventsApi
      .listManage()
      .then((data) => {
        setEvents(data)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    load()
  }, [])

  async function handlePublish(values: EventFormValues) {
    if (mode.type === "edit") {
      await eventsApi.update(mode.event.id, values)
    } else {
      await eventsApi.create(values)
    }
    setMode({ type: "list" })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    await eventsApi.remove(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać wydarzeń.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <CardTitle>Najbliższe wydarzenia</CardTitle>
      </CardHeader>
      {mode.type === "list" ? (
        <EventList
          events={events}
          canWrite={canWrite}
          onAdd={() => setMode({ type: "new" })}
          onEdit={(event) => setMode({ type: "edit", event })}
          onDelete={setDeleteTarget}
        />
      ) : (
        <EventEditor
          event={mode.type === "edit" ? mode.event : null}
          onPublish={handlePublish}
          onCancel={() => setMode({ type: "list" })}
        />
      )}

      {deleteTarget && (
        <Dialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Usuwanie wydarzenia</DialogTitle>
            </DialogHeader>
            <p className="text-sm">
              Czy chcesz usunąć wydarzenie{" "}
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
