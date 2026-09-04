import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"

import { Images } from "lucide-react"

import { heroApi } from "@/api/hero"
import { ImageCropModal } from "@/components/ImageCropModal"
import { MediaPickerModal } from "@/components/MediaPickerModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"
import { useImageCropUpload } from "@/hooks/useImageCropUpload"
import { useFonts } from "@/lib/fonts"
import { cn } from "@/lib/utils"

import { HeroButtonRow } from "./HeroButtonRow"
import { HeroTextBlock } from "./HeroTextBlock"
import { heroSchema, type HeroFormValues } from "./schema"

export function HeroPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.site ?? false
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fonts = useFonts()

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      title: "",
      titleWidth: 12,
      titleFont: "",
      titleVAlign: "center",
      titleColor: null,
      subtitle: "",
      subtitleWidth: 12,
      subtitleFont: "",
      subtitleVAlign: "center",
      subtitleColor: null,
      keynote: "",
      keynoteWidth: 12,
      keynoteFont: "",
      keynoteVAlign: "center",
      backgroundImage: "",
      buttons: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "buttons",
  })

  const backgroundImage = form.watch("backgroundImage")

  useEffect(() => {
    heroApi
      .get()
      .then((hero) => {
        form.reset(hero)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    imageSrc,
    selectFile,
    cancel: cancelCrop,
    confirm: confirmCrop,
    uploading,
    uploadError,
  } = useImageCropUpload(heroApi.uploadBackgroundImage)

  function handleCropSave(blob: Blob) {
    confirmCrop(blob, (url) =>
      form.setValue("backgroundImage", url, { shouldDirty: true, shouldValidate: true })
    )
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      selectFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function onSubmit(values: HeroFormValues) {
    setSaveError(null)
    try {
      const saved = await heroApi.update(values)
      form.reset(saved)
    } catch {
      setSaveError("Nie udało się zapisać zmian.")
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać danych Hero.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <CardTitle>Sekcja Hero</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className={cn("grid gap-6", !canWrite && "opacity-60")}>
          <fieldset disabled={!canWrite} className={cn("contents", !canWrite && "pointer-events-none")}>
            <div className="grid gap-3">
              <Label>Obraz tła</Label>
              <div
                className="aspect-[1920/600] w-full max-w-[70vw] overflow-hidden rounded-lg border bg-muted bg-cover bg-[center_30%]"
                style={
                  backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined
                }
              />
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading || !canWrite}
                  className="text-sm file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-2.5 file:text-sm file:font-medium file:text-primary-foreground"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canWrite}
                  onClick={() => setPickerOpen(true)}
                >
                  <Images /> Galeria
                </Button>
                {uploading && (
                  <span className="text-sm text-muted-foreground">Przesyłanie…</span>
                )}
              </div>
              {uploadError && <span className="text-sm text-destructive">{uploadError}</span>}
              <FormField
                control={form.control}
                name="backgroundImage"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <HeroTextBlock control={form.control} prefix="title" label="Tytuł" fonts={fonts} />
            <HeroTextBlock
              control={form.control}
              prefix="subtitle"
              label="Podtytuł"
              fonts={fonts}
            />
            <HeroTextBlock
              control={form.control}
              prefix="keynote"
              label="Motto"
              fonts={fonts}
              multiline
            />

            <Separator />

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Przyciski</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      label: "",
                      href: "",
                      icon: "mass",
                      external: false,
                      textColor: null,
                      textColorHover: null,
                      bgColor: null,
                      bgColorHover: null,
                    })
                  }
                >
                  Dodaj przycisk
                </Button>
              </div>
              {fields.map((field, index) => (
                <HeroButtonRow
                  key={field.id}
                  control={form.control}
                  index={index}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </fieldset>
          </CardContent>
          <CardFooter className="sticky bottom-0 flex items-center gap-3 bg-muted shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
            <Button
              type="submit"
              disabled={!canWrite || form.formState.isSubmitting || uploading}
            >
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
      <ImageCropModal
        imageSrc={imageSrc}
        onCancel={cancelCrop}
        onSave={handleCropSave}
        saving={uploading}
      />
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) =>
          form.setValue("backgroundImage", url, { shouldDirty: true, shouldValidate: true })
        }
      />
    </Card>
  )
}
