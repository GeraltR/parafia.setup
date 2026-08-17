import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"
import { useFieldArray, useForm, type Control, type FieldPath } from "react-hook-form"
import { HexColorPicker } from "react-colorful"
import { z } from "zod"

import { heroApi } from "@/api/hero"
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
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

const vAlignSchema = z.enum(["top", "center", "bottom"])
const iconSchema = z.enum(["mass", "announcements", "live"])

const heroButtonSchema = z.object({
  id: z.number().optional(),
  label: z.string().min(1, "Wymagane"),
  href: z.string().min(1, "Wymagane"),
  icon: iconSchema,
  external: z.boolean().optional(),
  textColor: z.string().nullable(),
  textColorHover: z.string().nullable(),
  bgColor: z.string().nullable(),
  bgColorHover: z.string().nullable(),
})

const heroSchema = z.object({
  title: z.string(),
  titleWidth: z.number().min(1).max(12),
  titleFont: z.string(),
  titleVAlign: vAlignSchema,
  titleColor: z.string().nullable(),
  subtitle: z.string(),
  subtitleWidth: z.number().min(1).max(12),
  subtitleFont: z.string(),
  subtitleVAlign: vAlignSchema,
  subtitleColor: z.string().nullable(),
  keynote: z.string(),
  keynoteWidth: z.number().min(1).max(12),
  keynoteFont: z.string(),
  keynoteVAlign: vAlignSchema,
  backgroundImage: z.string().min(1, "Wgraj obraz tła"),
  buttons: z.array(heroButtonSchema),
})

type HeroFormValues = z.infer<typeof heroSchema>

const V_ALIGN_LABELS: Record<z.infer<typeof vAlignSchema>, string> = {
  top: "Góra",
  center: "Środek",
  bottom: "Dół",
}

const ICON_LABELS: Record<z.infer<typeof iconSchema>, string> = {
  mass: "Msza święta",
  announcements: "Ogłoszenia",
  live: "Transmisja na żywo",
}

const TEXT_BLOCK_FIELDS = {
  title: {
    text: "title",
    width: "titleWidth",
    font: "titleFont",
    vAlign: "titleVAlign",
    color: "titleColor",
  },
  subtitle: {
    text: "subtitle",
    width: "subtitleWidth",
    font: "subtitleFont",
    vAlign: "subtitleVAlign",
    color: "subtitleColor",
  },
  keynote: {
    text: "keynote",
    width: "keynoteWidth",
    font: "keynoteFont",
    vAlign: "keynoteVAlign",
    color: null,
  },
} as const

function ColorField({
  control,
  name,
  label,
  fallback,
}: {
  control: Control<HeroFormValues>
  name: FieldPath<HeroFormValues>
  label: string
  fallback: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as string | null
        const swatchValue = value && HEX_COLOR_PATTERN.test(value) ? value : fallback
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Popover>
              <FormControl>
                <PopoverTrigger
                  type="button"
                  className="h-8 w-10 shrink-0 rounded-md border border-input"
                  style={{ backgroundColor: swatchValue }}
                />
              </FormControl>
              <PopoverContent className="grid w-56 gap-3">
                <HexColorPicker color={swatchValue} onChange={field.onChange} />
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    className="flex-1 font-mono"
                    placeholder={fallback}
                    value={value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : e.target.value)
                    }
                  />
                  {value !== null && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => field.onChange(null)}
                    >
                      Domyślny
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </FormItem>
        )
      }}
    />
  )
}

function HeroTextBlock({
  control,
  prefix,
  label,
  multiline,
}: {
  control: Control<HeroFormValues>
  prefix: keyof typeof TEXT_BLOCK_FIELDS
  label: string
  multiline?: boolean
}) {
  const fields = TEXT_BLOCK_FIELDS[prefix]

  return (
    <div className="grid gap-4 rounded-lg border p-4">
      <FormField
        control={control}
        name={fields.text}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              {multiline ? (
                <Textarea {...field} value={field.value as string} />
              ) : (
                <Input {...field} value={field.value as string} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-4 gap-4">
        <FormField
          control={control}
          name={fields.width}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Szerokość (1–12)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  className="w-20"
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  value={field.value as number}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={fields.font}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Font</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} placeholder="domyślny" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={fields.vAlign}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wyrównanie</FormLabel>
              <Select value={field.value as string} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => V_ALIGN_LABELS[value as keyof typeof V_ALIGN_LABELS]}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(V_ALIGN_LABELS).map(([value, valueLabel]) => (
                    <SelectItem key={value} value={value}>
                      {valueLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {fields.color && (
          <ColorField
            control={control}
            name={fields.color}
            label="Kolor tekstu"
            fallback="#ffffff"
          />
        )}
      </div>
    </div>
  )
}

function HeroButtonRow({
  control,
  index,
  onRemove,
}: {
  control: Control<HeroFormValues>
  index: number
  onRemove: () => void
}) {
  return (
    <div className="grid gap-4 rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`buttons.${index}.label`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etykieta</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`buttons.${index}.href`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex items-end gap-4">
        <FormField
          control={control}
          name={`buttons.${index}.icon`}
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Ikona</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => ICON_LABELS[value as keyof typeof ICON_LABELS]}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(ICON_LABELS).map(([value, valueLabel]) => (
                    <SelectItem key={value} value={value}>
                      {valueLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`buttons.${index}.external`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0 pb-2">
              <FormControl>
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">Nowa karta</FormLabel>
            </FormItem>
          )}
        />
        <Button type="button" variant="destructive" size="icon" onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <ColorField
          control={control}
          name={`buttons.${index}.textColor`}
          label="Tekst"
          fallback="#ffffff"
        />
        <ColorField
          control={control}
          name={`buttons.${index}.bgColor`}
          label="Tło"
          fallback="#0a1428"
        />
        <ColorField
          control={control}
          name={`buttons.${index}.textColorHover`}
          label="Tekst (hover)"
          fallback="#0a1428"
        />
        <ColorField
          control={control}
          name={`buttons.${index}.bgColorHover`}
          label="Tło (hover)"
          fallback="#ffffff"
        />
      </div>
    </div>
  )
}

export function HeroPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      const { url } = await heroApi.uploadBackgroundImage(file)
      form.setValue("backgroundImage", url, { shouldDirty: true, shouldValidate: true })
    } catch {
      setUploadError("Nie udało się przesłać obrazu.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Sekcja Hero</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
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
                  disabled={uploading}
                  className="text-sm file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-2.5 file:text-sm file:font-medium file:text-primary-foreground"
                />
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

            <HeroTextBlock control={form.control} prefix="title" label="Tytuł" />
            <HeroTextBlock control={form.control} prefix="subtitle" label="Podtytuł" />
            <HeroTextBlock
              control={form.control}
              prefix="keynote"
              label="Motto"
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
          </CardContent>
          <CardFooter className="flex items-center gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
              {form.formState.isSubmitting ? "Zapisywanie…" : "Zapisz"}
            </Button>
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
