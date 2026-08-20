import { useEffect, useState } from "react"

import { fontsApi, type FontFamily } from "@/api/fonts"

const FONT_FACE_STYLE_ID = "app-font-faces"

function buildFontFaceCss(fonts: FontFamily[]): string {
  return fonts
    .flatMap((font) =>
      font.variants.map(
        (variant) => `@font-face {
  font-family: "${font.family}";
  src: url("${variant.url}") format("woff2");
  font-weight: ${variant.weight};
  font-style: ${variant.style};
  font-display: swap;
}`
      )
    )
    .join("\n")
}

function injectFontFaces(fonts: FontFamily[]) {
  let styleEl = document.getElementById(FONT_FACE_STYLE_ID)
  if (!styleEl) {
    styleEl = document.createElement("style")
    styleEl.id = FONT_FACE_STYLE_ID
    document.head.appendChild(styleEl)
  }
  styleEl.textContent = buildFontFaceCss(fonts)
}

export function useFonts() {
  const [fonts, setFonts] = useState<FontFamily[]>([])

  useEffect(() => {
    fontsApi
      .list()
      .then((result) => {
        setFonts(result)
        injectFontFaces(result)
      })
      .catch(() => setFonts([]))
  }, [])

  return fonts
}
