import Image from "@tiptap/extension-image"

export const IMAGE_ALIGNMENTS = ["left", "center", "right"] as const

export type ImageAlign = (typeof IMAGE_ALIGNMENTS)[number]

function parseAlign(value: string | null): ImageAlign | null {
  return IMAGE_ALIGNMENTS.find((align) => align === value) ?? null
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    contentImage: {
      /** Floats the selected image (left/right, text wraps around it) or centres it; null resets. */
      setImageAlign: (align: ImageAlign | null) => ReturnType
    }
  }
}

/**
 * Image node with corner resize handles and an alignment stored as `data-align`, so the
 * public site can float images with plain CSS.
 */
export const ContentImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (element) => parseAlign(element.getAttribute("data-align")),
        renderHTML: (attributes) => (attributes.align ? { "data-align": attributes.align } : {}),
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { align }),
    }
  },
}).configure({
  // Long chronicle pages hold dozens of photos; load them as the reader scrolls.
  HTMLAttributes: { loading: "lazy" },
  resize: {
    enabled: true,
    directions: ["bottom-left", "bottom-right", "top-left", "top-right"],
    minWidth: 50,
    minHeight: 50,
    alwaysPreserveAspectRatio: true,
  },
})
