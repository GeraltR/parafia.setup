export interface NavSection {
  to: string
  label: string
}

export const navSections: NavSection[] = [
  { to: "/theme", label: "Motyw" },
  { to: "/hero", label: "Hero" },
  { to: "/navbar", label: "Nawigacja" },
  { to: "/short-actions", label: "Skróty" },
  { to: "/footer", label: "Stopka" },
  { to: "/events", label: "Wydarzenia" },
  { to: "/news", label: "Aktualności" },
  { to: "/mass-intentions", label: "Intencje mszalne" },
  { to: "/info-extra", label: "Informacja dodatkowa" },
  { to: "/contact-addresses", label: "Dane kontaktowe" },
]
