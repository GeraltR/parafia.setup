export interface NavLink {
  to: string
  label: string
}

export interface NavGroup {
  label: string
  items: NavLink[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Strona",
    items: [
      { to: "/theme", label: "Motyw" },
      { to: "/hero", label: "Hero" },
      { to: "/navbar", label: "Nawigacja" },
      { to: "/contact-addresses", label: "Dane kontaktowe" },
    ],
  },
  {
    label: "Treści",
    items: [
      { to: "/short-actions", label: "Skróty" },
      { to: "/footer", label: "Stopka" },
      { to: "/events", label: "Wydarzenia" },
      { to: "/news", label: "Aktualności" },
      { to: "/mass-intentions", label: "Intencje mszalne" },
      { to: "/info-extra", label: "Informacje" },
    ],
  },
  {
    label: "Zarządzanie",
    items: [{ to: "/users", label: "Użytkownicy" }],
  },
]

export const allNavLinks: NavLink[] = navGroups.flatMap((group) => group.items)
