import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { footerApi } from "@/api/footer"
import { ColorField } from "@/components/ColorField"
import { NullableFontSelect } from "@/components/NullableFontSelect"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"
import { useFonts } from "@/lib/fonts"
import type { FooterConfig } from "@/types/config"

import { OfficeHourRow } from "./OfficeHourRow"
import { footerSchema, type FooterFormValues } from "./schema"

function toFormValues(data: FooterConfig): FooterFormValues {
  return {
    officeTitle: data.officeTitle,
    officeNote: data.officeNote,
    mapEmbedUrl: data.mapEmbedUrl,
    mapLink: data.mapLink,
    config: data.config,
    officeHours: data.officeHours.map((h) => ({
      id: h.id,
      day: h.day,
      hoursOn: h.hoursOn,
      hoursEnd: h.hoursEnd,
    })),
  }
}

export function FooterPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.site ?? false
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)
  const fonts = useFonts()

  const form = useForm<FooterFormValues>({
    resolver: zodResolver(footerSchema),
    defaultValues: {
      officeTitle: "",
      officeNote: "",
      mapEmbedUrl: "",
      mapLink: "",
      config: { bgColor: null, titleFont: null, titleSize: null, titleColor: null },
      officeHours: [],
    },
  })

  const officeHoursArray = useFieldArray({ control: form.control, name: "officeHours" })

  useEffect(() => {
    footerApi
      .get()
      .then((data) => {
        form.reset(toFormValues(data))
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: FooterFormValues) {
    setSaveError(null)
    try {
      const saved = await footerApi.update(values)
      form.reset(toFormValues(saved))
    } catch {
      setSaveError("Nie udało się zapisać zmian.")
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać danych stopki.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <CardTitle>Stopka</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <p className="text-sm font-medium">Kancelaria</p>
              <FormField
                control={form.control}
                name="officeTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tytuł sekcji</FormLabel>
                    <FormControl>
                      <Input placeholder="Godziny otwarcia kancelarii" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Godziny przyjęć</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      officeHoursArray.append({ day: "", hoursOn: "", hoursEnd: "" })
                    }
                  >
                    <Plus /> Dodaj wpis
                  </Button>
                </div>
                {officeHoursArray.fields.map((field, index) => (
                  <OfficeHourRow
                    key={field.id}
                    control={form.control}
                    index={index}
                    onRemove={() => officeHoursArray.remove(index)}
                  />
                ))}
              </div>
              <FormField
                control={form.control}
                name="officeNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notatka pod godzinami</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="W sprawach pilnych prosimy o kontakt telefoniczny…"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid gap-4">
              <p className="text-sm font-medium">Mapa</p>
              <FormField
                control={form.control}
                name="mapEmbedUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres osadzonej mapy (embed)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.google.com/maps?...&output=embed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mapLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link „Zobacz dojazd”</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.google.com/maps/place/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid gap-4">
              <p className="text-sm font-medium">Tło i czcionka nagłówków</p>
              <div className="grid grid-cols-3 gap-4">
                <ColorField
                  control={form.control}
                  name="config.bgColor"
                  label="Kolor tła stopki"
                  fallback="#1a365d"
                />
                <FormField
                  control={form.control}
                  name="config.titleFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Czcionka nagłówków</FormLabel>
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
                      <FormLabel>Wielkość</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          placeholder="0.74rem"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <ColorField
                control={form.control}
                name="config.titleColor"
                label="Kolor nagłówków"
                fallback="#ffffff"
              />
            </div>
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
