import { useEffect, useState } from "react"

import { contentTopicsApi } from "@/api/contentTopics"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/useAuth"
import type { ContentPageSlug, ContentTopic } from "@/types/config"

import type { TopicFormValues } from "./schema"
import { TopicEditor } from "./TopicEditor"
import { TopicList } from "./TopicList"

type Mode = { type: "list" } | { type: "new" } | { type: "edit"; topic: ContentTopic }

export function ContentTopicsPage({
  page,
  title,
  maxTopics,
}: {
  page: ContentPageSlug
  title: string
  maxTopics?: number
}) {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [topics, setTopics] = useState<ContentTopic[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [mode, setMode] = useState<Mode>({ type: "list" })
  const [deleteTarget, setDeleteTarget] = useState<ContentTopic | null>(null)

  function load() {
    setStatus("loading")
    contentTopicsApi
      .listManage(page)
      .then((data) => {
        setTopics(data)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function handlePublish(values: TopicFormValues) {
    if (mode.type === "edit") {
      await contentTopicsApi.update(mode.topic.id, values)
    } else {
      await contentTopicsApi.create(page, values)
    }
    setMode({ type: "list" })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    await contentTopicsApi.remove(deleteTarget.id)
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
      </CardHeader>
      {mode.type === "list" ? (
        <TopicList
          page={page}
          topics={topics}
          maxTopics={maxTopics}
          canWrite={canWrite}
          onAdd={() => setMode({ type: "new" })}
          onEdit={(topic) => setMode({ type: "edit", topic })}
          onDelete={setDeleteTarget}
        />
      ) : (
        <TopicEditor
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
