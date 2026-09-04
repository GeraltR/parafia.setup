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
      { to: "/short-actions", label: "Skróty" },
      { to: "/footer", label: "Stopka" },
    ],
  },
  {
    label: "Treści",
    items: [
      { to: "/events", label: "Ważne informacje" },
      { to: "/news", label: "Aktualności" },
      { to: "/mass-intentions", label: "Intencje mszalne" },
      { to: "/informacje", label: "Informacje dodatkowe" },
      { to: "/sakramenty", label: "Sakramenty" },
      { to: "/parafia", label: "Parafia" },
      { to: "/liturgia", label: "Liturgia" },
      { to: "/mass-and-pastor", label: "Msze i Duszpasterze" },
      { to: "/associations", label: "Stowarzyszenia" },
      { to: "/media", label: "Galeria" },
    ],
  },
  {
    label: "Zarządzanie",
    items: [
      { to: "/users", label: "Użytkownicy" },
      { to: "/stats", label: "Statystyki" },
    ],
  },
]

export const allNavLinks: NavLink[] = navGroups.flatMap((group) => group.items)
