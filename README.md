# parafia.setup

Panel administracyjny do definiowania elementów strony parafialnej ([parafia](https://github.com/GeraltR/parafia.react)) — motyw, hero, nawigacja, stopka, wydarzenia, aktualności i inne sekcje obecnie zaszyte w mocku JSON tamtego projektu, docelowo zapisywane przez Laravel API.

W przyszłości panel zostanie rozszerzony o edytor treści (TipTap) do tworzenia bardziej rozbudowanego contentu (np. dłuższych artykułów/ogłoszeń).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui (Base UI)
- React Hook Form + Zod
- TipTap (przygotowane pod przyszły edytor treści)
- React Router
- Vitest + Testing Library

## Rozwój

```bash
npm install
npm run dev
```

Zmienne środowiskowe: skopiuj `.env.example` do `.env` i ustaw `VITE_API_BASE_URL` na adres Laravel API.

```bash
npm run build   # tsc -b && vite build
npm run lint    # oxlint
npm run test    # vitest
```

## Struktura

- `src/api/` — klienci API dla poszczególnych sekcji konfiguracji
- `src/components/ui/` — komponenty shadcn/ui
- `src/components/layout/` — layout panelu (sidebar, `AppShell`)
- `src/pages/` — strony edycji poszczególnych sekcji
- `src/types/config.ts` — typy współdzielone koncepcyjnie z projektem `parafia`
