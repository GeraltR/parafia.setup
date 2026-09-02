import { useEffect, useState } from "react"

import { Plus } from "lucide-react"

import type { TopicsApi } from "@/api/contentTopics"
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
import type { ContentTopic } from "@/types/config"

import type { TopicFormValues } from "./schema"
import { TopicEditor } from "./TopicEditor"
import { TopicList } from "./TopicList"

type Mode = { type: "list" } | { type: "new" } | { type: "edit"; topic: ContentTopic }

export function ContentTopicsPage({
  api,
  title,
  maxTopics,
  showScheduling = true,
  canPrint = true,
}: {
  api: TopicsApi
  title: string
  maxTopics?: number
  showScheduling?: boolean
  canPrint?: boolean
}) {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [topics, setTopics] = useState<ContentTopic[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [mode, setMode] = useState<Mode>({ type: "list" })
  const [deleteTarget, setDeleteTarget] = useState<ContentTopic | null>(null)
  const canAddMore = maxTopics === undefined || topics.length < maxTopics

  function load() {
    setStatus("loading")
    api
      .listManage()
      .then((data) => {
        setTopics(data)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    setMode({ type: "list" })
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api])

  async function handlePublish(values: TopicFormValues) {
    if (mode.type === "edit") {
      await api.update(mode.topic.id, values)
    } else {
      await api.create(values)
    }
    setMode({ type: "list" })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    await api.remove(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać tematów.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {mode.type === "list" && canWrite && canAddMore && (
          <CardAction>
            <Button type="button" size="sm" onClick={() => setMode({ type: "new" })}>
              <Plus /> Dodaj temat
            </Button>
          </CardAction>
        )}
      </CardHeader>
      {mode.type === "list" ? (
        <TopicList
          topics={topics}
          canWrite={canWrite}
          canPrint={canPrint}
          showMeta={showScheduling}
          onEdit={(topic) => setMode({ type: "edit", topic })}
          onDelete={setDeleteTarget}
        />
      ) : (
        <TopicEditor
          api={api}
          showScheduling={showScheduling}
          topic={mode.type === "edit" ? mode.topic : null}
          onPublish={handlePublish}
          onCancel={() => setMode({ type: "list" })}
        />
      )}

      {deleteTarget && (
        <Dialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Usuwanie tematu</DialogTitle>
            </DialogHeader>
            <p className="text-sm">
              Czy chcesz usunąć temat <span className="font-medium">{deleteTarget.title}</span>?
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
