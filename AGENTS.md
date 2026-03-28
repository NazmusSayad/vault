## Project

- NEVER start a dev server (`npm run dev`) or build the project (`npm run build`). The user will do that themselves.
- Use next dynamic imports with `ssr: false` for all ui components inside `src/app/(private)` to prevent hydration errors. It's kind of a dashboard so no need for server side rendering.

## UI/UX

- Do not use `lucide-icons` for icons. Use `hugeicons` instead.
- Do not put "..." to indicate loading state. Use a spinner or skeleton instead.

## Tailwind Theme

- Default color shades (eg: `text-slate-500`, `border-red-500`, `bg-white`) are not available. Use theme colors (eg: `text-muted`, `border-border`, `bg-primary`) instead.

## React

- DO NOT USE `useActionState` form `react`.
- DO NOT USE `useEffect` unless instructed to do so. If there is no way possible, ask the user what to do instead.
