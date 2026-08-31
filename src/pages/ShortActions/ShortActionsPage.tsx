import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { shortActionsApi } from "@/api/shortActions"
import { ColorField } from "@/components/ColorField"
import { NullableFontSelect } from "@/components/NullableFontSelect"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"
import { useFonts } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import type { ShortActionsData } from "@/types/config"

import { ShortActionItemRow } from "./ShortActionItemRow"
import { shortActionsSchema, type ShortActionsFormValues } from "./schema"

function toFormValues(data: ShortActionsData): ShortActionsFormValues {
  return {
    config: data.config,
    items: data.items.map((item) => ({
      id: item.id,
      icon: item.icon,
      iconUrl: item.iconUrl,
      title: item.title,
      description: item.description,
      href: item.href,
      external: item.external ?? false,
    })),
  }
}

export function ShortActionsPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.site ?? false
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)
  const fonts = useFonts()

  const form = useForm<ShortActionsFormValues>({
    resolver: zodResolver(shortActionsSchema),
    defaultValues: {
      config: {
        titleFont: null,
        titleSize: null,
        titleColor: null,
        subtitleFont: null,
        subtitleSize: null,
        subtitleColor: null,
        bgColor: null,
        bgColorHover: null,
      },
      items: [],
    },
  })

  useEffect(() => {
    shortActionsApi
      .get()
      .then((data) => {
        form.reset(toFormValues(data))
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: ShortActionsFormValues) {
    setSaveError(null)
    try {
      const saved = await shortActionsApi.update(values)
      form.reset(toFormValues(saved))
    } catch {
      setSaveError("Nie udało się zapisać zmian.")
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać danych.</p>
  }

  return (
    <Card className="max-w-4xl overflow-visible">
      <CardHeader>
        <CardTitle>Skróty</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className={cn("grid gap-6", !canWrite && "opacity-60")}>
          <fieldset disabled={!canWrite} className={cn("contents", !canWrite && "pointer-events-none")}>
            <div className="grid gap-4">
              <p className="text-sm font-medium">Styl wspólny dla wszystkich 6 przycisków</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="config.titleFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Czcionka tytułu</FormLabel>
                      <NullableFontSelect value={field.value} onChange={field.onChange} fonts={fonts} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.titleSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wielkość tytułu</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          placeholder="0.84rem"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ColorField
                  control={form.control}
                  name="config.titleColor"
                  label="Kolor tytułu"
                  fallback="#1a365d"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="config.subtitleFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Czcionka podtytułu</FormLabel>
                      <NullableFontSelect value={field.value} onChange={field.onChange} fonts={fonts} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.subtitleSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wielkość podtytułu</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          placeholder="0.72rem"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ColorField
                  control={form.control}
                  name="config.subtitleColor"
                  label="Kolor podtytułu"
                  fallback="#5a6b7d"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ColorField
                  control={form.control}
                  name="config.bgColor"
                  label="Kolor tła"
                  fallback="#ffffff"
                />
                <ColorField
                  control={form.control}
                  name="config.bgColorHover"
                  label="Kolor tła (hover)"
                  fallback="#f4f6f8"
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <ShortActionItemRow key={index} control={form.control} index={index} />
              ))}
            </div>
          </fieldset>
          </CardContent>
          <CardFooter className="sticky bottom-0 flex items-center gap-3 bg-muted shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
            <Button type="submit" disabled={!canWrite || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Zapisywanie…" : "Zapisz"}
            </Button>
            {!canWrite && (
              <span className="text-sm text-muted-foreground">
                Brak uprawnień do zapisywania zmian.
              </span>
            )}
            {saveError && <span className="text-sm text-destructive">{saveError}</span>}
            {form.formState.isSubmitSuccessful && !saveError && (
              <span className="text-sm text-muted-foreground">Zapisano.</span>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
