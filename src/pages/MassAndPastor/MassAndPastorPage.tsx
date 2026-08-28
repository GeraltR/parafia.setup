import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { massAndPastorApi } from "@/api/massAndPastor"
import { ColorField } from "@/components/ColorField"
import { NullableFontSelect } from "@/components/NullableFontSelect"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"
import { useFonts } from "@/lib/fonts"
import type { MassAndPastorData } from "@/types/config"

import { MassTimeRow } from "./MassTimeRow"
import { PastorRow } from "./PastorRow"
import { massAndPastorSchema, type MassAndPastorFormValues } from "./schema"

function toFormValues(data: MassAndPastorData): MassAndPastorFormValues {
  return {
    config: data.config,
    massTimes: data.massTimes.map((mt) => ({
      id: mt.id,
      label: mt.label,
      hours: mt.hours,
      note: mt.note,
    })),
    pastors: data.pastors.map((p) => ({
      id: p.id,
      position: p.position,
      fullName: p.fullName,
      photoUrl: p.photoUrl,
      duties: p.duties,
      isActive: p.isActive,
    })),
  }
}

export function MassAndPastorPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)
  const fonts = useFonts()

  const form = useForm<MassAndPastorFormValues>({
    resolver: zodResolver(massAndPastorSchema),
    defaultValues: {
      config: {
        positionFont: null,
        positionSize: null,
        positionColor: null,
        nameFont: null,
        nameSize: null,
        nameColor: null,
      },
      massTimes: [],
      pastors: [],
    },
  })

  const massTimesArray = useFieldArray({ control: form.control, name: "massTimes" })
  const pastorsArray = useFieldArray({ control: form.control, name: "pastors" })

  useEffect(() => {
    massAndPastorApi
      .get()
      .then((data) => {
        form.reset(toFormValues(data))
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: MassAndPastorFormValues) {
    setSaveError(null)
    try {
      const saved = await massAndPastorApi.update(values)
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
        <CardTitle>Msze i Duszpasterze</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <p className="text-sm font-medium">Styl stanowiska i imienia duszpasterzy</p>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="config.positionFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Czcionka stanowiska</FormLabel>
                      <NullableFontSelect value={field.value} onChange={field.onChange} fonts={fonts} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.positionSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wielkość</FormLabel>
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
                  name="config.positionColor"
                  label="Kolor"
                  fallback="#c9a84c"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="config.nameFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Czcionka imienia i nazwiska</FormLabel>
                      <NullableFontSelect value={field.value} onChange={field.onChange} fonts={fonts} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config.nameSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wielkość</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          placeholder="0.95rem"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ColorField
                  control={form.control}
                  name="config.nameColor"
                  label="Kolor"
                  fallback="#1a365d"
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Godziny Mszy Świętych</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => massTimesArray.append({ label: "", hours: "", note: null })}
                >
                  <Plus /> Dodaj wpis
                </Button>
              </div>
              {massTimesArray.fields.map((field, index) => (
                <MassTimeRow
                  key={field.id}
                  control={form.control}
                  index={index}
                  onRemove={() => massTimesArray.remove(index)}
                />
              ))}
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Duszpasterze</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    pastorsArray.append({
                      position: "",
                      fullName: "",
                      photoUrl: null,
                      duties: "",
                      isActive: true,
                    })
                  }
                >
                  <Plus /> Dodaj duszpasterza
                </Button>
              </div>
              {pastorsArray.fields.map((field, index) => (
                <PastorRow
                  key={field.id}
                  control={form.control}
                  index={index}
                  onRemove={() => pastorsArray.remove(index)}
                />
              ))}
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
