import { useEffect, useState } from "react"

import { newsApi } from "@/api/news"
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
import type { NewsItem } from "@/types/config"

import { NewsEditor } from "./NewsEditor"
import { NewsList } from "./NewsList"
import type { NewsFormValues } from "./schema"

type Mode = { type: "list" } | { type: "new" } | { type: "edit"; news: NewsItem }

export function NewsPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [news, setNews] = useState<NewsItem[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [mode, setMode] = useState<Mode>({ type: "list" })
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null)

  function load() {
    setStatus("loading")
    newsApi
      .listManage()
      .then((data) => {
        setNews(data)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }

  useEffect(() => {
    load()
  }, [])

  async function handlePublish(values: NewsFormValues) {
    if (mode.type === "edit") {
      await newsApi.update(mode.news.id, values)
    } else {
      await newsApi.create(values)
    }
    setMode({ type: "list" })
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    await newsApi.remove(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać aktualności.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <CardTitle>Aktualności</CardTitle>
      </CardHeader>
      {mode.type === "list" ? (
        <NewsList
          news={news}
          canWrite={canWrite}
          onAdd={() => setMode({ type: "new" })}
          onEdit={(item) => setMode({ type: "edit", news: item })}
          onDelete={setDeleteTarget}
        />
      ) : (
        <NewsEditor
          news={mode.type === "edit" ? mode.news : null}
          onPublish={handlePublish}
          onCancel={() => setMode({ type: "list" })}
        />
      )}

      {deleteTarget && (
        <Dialog open onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Usuwanie aktualności</DialogTitle>
            </DialogHeader>
            <p className="text-sm">
              Czy chcesz usunąć aktualność{" "}
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
