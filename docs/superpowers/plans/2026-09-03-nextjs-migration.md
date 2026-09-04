# Next.js App Router Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Vite + React SPA (`achados-e-perdidos` / APATA adoption board) in-place to Next.js 16 App Router with full TypeScript, rendering the home pet list on the server (RSC + streaming) while admin pages stay client-side with react-query.

**Architecture:** A `src/app/` App Router tree replaces `index.html` + `main.jsx` + `App.jsx` + `react-router`. The root layout owns fonts/metadata/global CSS and wraps everything in a client `Providers` (react-query only). `/` is a server component that fetches `GET /pets` with `cache: 'no-store'` inside a `<Suspense>` so the page shell streams immediately and the list streams when the (slow, cold-starting) API answers; the list itself is a client component seeded with `initialData` so react-query keeps handling refetch/invalidation. `/painel`, `/cadastro`, `/gerenciar` are client pages; `/cadastro` and `/gerenciar` live in a `(admin)` route group whose layout is a client-side JWT guard. Auth state comes from a `useSyncExternalStore` hook over `localStorage` (replaces the `ContextNavbar` context) to be hydration-safe and to satisfy `react-hooks/set-state-in-effect`.

**Tech Stack:** Next.js 16.3.4 (App Router, Turbopack), React 19.2, TypeScript 5.9, Tailwind CSS 4.3 via `@tailwindcss/postcss`, @tanstack/react-query 5, axios, react-hook-form, react-number-format, react-icons, React Compiler (`reactCompiler: true` + `babel-plugin-react-compiler`), ESLint 9 flat config + `eslint-config-next`.

**Spec:** The task brief from the user (reproduced in "Global Constraints" and "Decisions" below). No separate spec file exists; this document is the spec-bearing artifact.

**Versions targeted (verified 2026-09-03):** `next@16.3.4` and `eslint-config-next@16.3.4` are the latest on npm; `@tailwindcss/postcss@4.3.3`/`tailwindcss@4.3.3`; `typescript@5.9.3` (npm `latest` is 7.0.2 — deliberately NOT used, see Risks); `eslint@9.39.x` (npm `latest` is 10.x — deliberately NOT used; `eslint-config-next` peer is `>=9`). Config APIs (`reactCompiler`, `eslint-config-next/core-web-vitals` + `/typescript` flat exports, `@tailwindcss/postcss`, `fetch` `cache: 'no-store'`) were confirmed against the Next.js v16 docs via Context7 (`/vercel/next.js`) and by inspecting the installed `next@16.3.4` package (font export names, `next-env.d.ts` template, tsconfig defaults).

## Global Constraints

- Node `v20.19.6` locally (Next 16 requires `>=20.9.0`). npm `11.17.0`.
- Branch: `feat/nextjs` (already exists and is checked out at `main` HEAD `9543aba`). All commits go there. Never commit to `main`.
- In-place migration in `/Users/rodrigoandradebccgmail.com/Dev/Study/Apata-Frontend`. Preserve git history (use `git mv` for renames). Do not create a new repo. Keep the existing Vercel project.
- Full TypeScript: every source file becomes `.ts`/`.tsx`. `strict: true`. No `any` (explicit or implicit). Types in `src/types.ts`.
- Scope is "port + Server Components on the home page": `/` fetches pets on the server; `/painel`, `/cadastro`, `/gerenciar` stay client-side with react-query.
- Env var `VITE_URLAPI` → `NEXT_PUBLIC_URLAPI` everywhere. Storage key stays `token`; header stays `authorization: Bearer <token>`.
- `vercel.json` (SPA rewrite) must be deleted.
- No test runner exists in the repo and adding one is out of scope. Every task is verified with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and (where relevant) a `next dev` smoke check. The final task has the full manual smoke-test checklist.
- Commit after every task. Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT
  ```

## Decisions (already made by the user — do not re-litigate)

1. Port + RSC home page. Admin/manage/register pages stay client + react-query.
2. Convert whole codebase to TypeScript with real types in the same migration.
3. In-place on `feat/nextjs`; preserve history, Vercel project, and the *intent* of `vercel.json` (all routes served by the app — which Next does natively, so the file is removed).

## Decisions made by this plan (flagged so the executor/reviewer can object)

| # | Decision | Why |
|---|---|---|
| D1 | Delete dead code instead of porting: `src/paginas/pagebusca.jsx`, `src/paginas/pagecadastro.jsx`, Navbar's `pesquisar`/`inputpesquisa`, context fields `itens/setItens/barraBusca/setBarraBusca`, `estrutura.txt`, `src/estrutura.txt`, `src/img/teste.jpg`, `src/img/loading.svg`, `src/img/QRVoluntario.jpeg`, `src/assets/react.svg`, `public/vite.svg`, `public/ico.png`. | `pagebusca`/`pagecadastro` are not in the route table (verified: `App.jsx` routes are only `/`, `/cadastro`, `/gerenciar`, `/painel`) and nothing imports them; `pagecadastro.jsx` is 100% commented out; `pagebusca` targets a `/busca` route that does not exist and uses `_id` fields the rest of the app doesn't. `estrutura.txt` files are 12k-line Windows `tree` dumps. Images/`public` files have zero references (grep-verified). `QRVoluntario.jpeg` is referenced only in commented-out code. |
| D2 | Remove deps `react-imask` (zero imports), `express` (zero imports, stray), `react-router`, `react-router-dom`, `@tailwindcss/vite`, `vite`, `@vitejs/plugin-react`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `@eslint/js`, `globals`. | Unused or replaced by Next / `eslint-config-next` (which bundles the react, react-hooks, jsx-a11y and import plugins). |
| D3 | Drop `Duru Sans`; load only `WDXL Lubrifont JP N` via `next/font/google`. | `Duru Sans` has zero references in any CSS/JSX (grep-verified); it was only loaded by the `<link>`. Loading it would be dead weight. |
| D4 | Replace the `ContextNavbar` context with `useAuthToken()` (a `useSyncExternalStore` over `localStorage`) in `src/lib/auth.ts`. `Providers` holds only `QueryClientProvider`. | After D1 the context only carried `adm/setAdm`, which is purely derived from "is there a token". `eslint-config-next@16` enables `react-hooks/set-state-in-effect: error`, which forbids Navbar's `useEffect(() => { if (token) setAdm(true) }, [])` and the naive guard pattern. `useSyncExternalStore` with a `null` server snapshot is the hydration-safe way to read `localStorage`. |
| D5 | Keep the React Compiler: `reactCompiler: true` in `next.config.ts` + keep `babel-plugin-react-compiler` as a devDependency. Do NOT enable `experimental.turbopackRustReactCompiler`. | The app already runs compiled (Vite babel plugin, same compiler 1.0), so behaviour is unchanged. The stable Next option requires the babel plugin installed (docs: "Install React Compiler plugin"). The Rust port is experimental. |
| D6 | Images: local assets in `src/img/` use `next/image` with static imports (`load.gif` with `unoptimized`); API-provided pet photos (`pet.foto`) and the `FileReader` data-URL preview stay `<img>` with an eslint-disable comment. | Static imports give width/height and zero CLS for free. Pet photo host is unknown (ASSUMPTION: Cloudinary) and photos are user-uploaded with `object-cover`/`object-contain` toggling at fixed `w-24 h-24`; `next/image` would need `remotePatterns` + `fill` layout changes that are out of scope for a port. |
| D7 | Fix three latent bugs during the port (each is a compile error in TS anyway): (a) `search.jsx` `pesquisar` references undefined `barraBusca` (ReferenceError on submit) → Search becomes a pure controlled input whose submit only prevents default (filtering is already live); (b) `Button` declares prop `disable` but `Formulario` passes `disabled` (button was never actually disabled) → prop is `disabled`; (c) `queryClient.invalidateQueries(["itens"])` is the v4 signature; in v5 it must be `{ queryKey: ['itens'] }`. | Required for `tsc --noEmit` to pass; behaviour becomes what the author intended. |
| D8 | `Button`'s dynamic Tailwind class ``text-[${size}pt]`` becomes `style={{ fontSize: \`${size}pt\` }}`. | Tailwind v4 cannot generate dynamic class names; it only worked because the same literals happen to exist elsewhere. Inline style is equivalent (`text-[Npt]` sets only `font-size`). |
| D9 | `contato` from the phone `<Controller>` is submitted as 11 digits (react-number-format `onValueChange` value) instead of possibly formatted text. | Every consumer already strips non-digits (`somenteDigitos`, `wa.me` link). ASSUMPTION: backend accepts digits-only phone (it must, since validation already passes digits-only values through today). |
| D10 | Rename components to PascalCase `.tsx` (`about.jsx` → `About.tsx`, etc.) and pages move into `src/app/`. `hookapi/fetchItem.jsx` → `src/lib/api.ts`. | Every file is rewritten anyway; PascalCase matches Next conventions. Use `git mv` so history follows. |
| D11 | Remove `"type": "module"` from `package.json`; configs use explicit `.mjs`/`.ts`. | `create-next-app` does not set it; removing avoids ESM/CJS edge cases in tooling. |
| D12 | Fix the typo class `text-(--text-color)rounded-2xl` (one token, matched nothing) in the "Procurando seu novo melhor amigo" box to `text-(--text-color) rounded-2xl`. | Obvious typo; makes the box render as designed. Minor visual change (rounded corners + green text) — reviewer may revert. |
| D13 | Keep `ScrollToTop` (ported to `usePathname`) even though App Router already scrolls to top on navigation. | Spec asks for it; it is harmless (one `window.scrollTo(0,0)` per path change). |
| D14 | `onUpdate` in `Gerenciar` returns the mutation promise so `Item` awaits the real request before hiding its spinner. | Today `fatualizar` did not return the promise, so `await fatualizar(...)` resolved instantly and the spinner flickered. |
| D15 | Home fetch uses `cache: 'no-store'` + `AbortSignal.timeout(10_000)` wrapped in `<Suspense>`. | Adoption board: an admin edit/delete must be visible on the very next page load — ISR (`next: { revalidate: N }`) would show stale pets for up to N seconds on first paint and on-demand `revalidatePath` would require a new route handler since mutations go client → external API. Cost: `/` is dynamically rendered per request (trivial at this traffic). The timeout + Suspense keep a cold-starting backend from blocking the page shell. |

---

## File Structure (final state)

```
.
├── .env.example                 NEW  NEXT_PUBLIC_URLAPI placeholder (committed)
├── .gitignore                   MOD  + .next/ out/ next-env.d.ts *.tsbuildinfo .env*.local .vercel
├── eslint.config.mjs            NEW  flat config from eslint-config-next (replaces eslint.config.js)
├── next.config.ts               NEW  reactCompiler: true
├── postcss.config.mjs           NEW  @tailwindcss/postcss
├── tsconfig.json                NEW
├── package.json                 MOD  deps + scripts
├── README.md                    MOD  env var name, stack, scripts, tree
├── public/logoapata.svg         KEEP (favicon)
└── src/
    ├── types.ts                 NEW  Pet, Especie, Sexo, Porte, PetFormValues, PetFilters, LoginPayload, LoginResponse
    ├── lib/
    │   ├── auth.ts              NEW  getToken/setToken/clearToken, useAuthToken(), useIsClient()
    │   ├── api.ts               NEW  axios client: listarPets, criarPet, editarPet, deletarPet, loginAdm, verificarToken
    │   ├── filterPets.ts        NEW  pure filterPets(pets, filters) + EMPTY_FILTERS
    │   └── pets-server.ts       NEW  fetchPetsServer() (native fetch, no-store, timeout)
    ├── app/
    │   ├── globals.css          NEW  index.css + App.css merged, font via CSS var
    │   ├── layout.tsx           NEW  <html lang="pt-BR">, metadata, font, Providers, #root wrapper, Navbar, MFooter, ScrollToTop
    │   ├── providers.tsx        NEW  'use client' QueryClientProvider
    │   ├── loading.tsx          NEW  spinner (replaces Suspense gif fallback)
    │   ├── page.tsx             NEW  server home: shell + <Suspense><PetsFromServer/></Suspense>
    │   ├── painel/page.tsx      NEW  'use client' login (from PainalAdm.jsx)
    │   └── (admin)/
    │       ├── layout.tsx       NEW  <AuthGuard>{children}</AuthGuard>  (from Prorota.jsx)
    │       ├── cadastro/page.tsx NEW renders <Formulario/>
    │       └── gerenciar/page.tsx NEW 'use client' (from gerenciar.jsx)
    ├── components/
    │   ├── About.tsx            (server-safe)
    │   ├── Alert.tsx            'use client'
    │   ├── AuthGuard.tsx        'use client'
    │   ├── Button.tsx           'use client'
    │   ├── CardAside.tsx        (server-safe)
    │   ├── Formulario.tsx       'use client'
    │   ├── Hero.tsx             (server-safe)
    │   ├── HomePets.tsx         'use client'  filters + list, react-query seeded with initialData
    │   ├── HomePetsFallback.tsx (server-safe) Suspense fallback with identical flex-order skeleton
    │   ├── Item.tsx             'use client'
    │   ├── MFooter.tsx          (server-safe)
    │   ├── Navbar.tsx           'use client'
    │   ├── PetFilters.tsx       'use client'  Search + 3 selects (shared by home and gerenciar)
    │   ├── PetsLoadingMessage.tsx (server-safe) spinner + "Procurando..." text
    │   ├── Poup.tsx             'use client'
    │   ├── ScrollToTop.tsx      'use client'
    │   ├── Search.tsx           'use client'
    │   └── Spinner.tsx          (server-safe) next/image load.gif
    └── img/  QRPIX.jpeg catdog.svg load.gif logoapata.png logoct.svg   (others deleted, D1)
```

Deleted: `index.html`, `vite.config.js`, `eslint.config.js`, `vercel.json`, `estrutura.txt`, `src/estrutura.txt`, `src/main.jsx`, `src/App.jsx`, `src/App.css`, `src/index.css`, `src/ContextNavbar.jsx`, `src/paginas/*`, `src/hookapi/*`, `src/assets/`, `public/vite.svg`, `public/ico.png`, unused images.

### `"use client"` audit (why each file needs it)

| File | Needs `'use client'`? | Reason |
|---|---|---|
| `app/providers.tsx` | Yes | `useState`, `QueryClientProvider` (context) |
| `app/painel/page.tsx` | Yes | `useForm`, `useMutation`, `useRouter`, `useState`, `localStorage` via `setToken` |
| `app/(admin)/gerenciar/page.tsx` | Yes | `useQuery`, `useMutation`, `useState`, handlers |
| `app/(admin)/layout.tsx` | No | Only renders `<AuthGuard>` (a client component) |
| `app/(admin)/cadastro/page.tsx` | No | Only renders `<Formulario/>` |
| `app/layout.tsx`, `app/page.tsx`, `app/loading.tsx` | No | Server components |
| `components/AuthGuard.tsx` | Yes | `useAuthToken`, `useIsClient`, `useRouter`, `useEffect` |
| `components/Navbar.tsx` | Yes | `useState`, `useRouter`, `localStorage`, handlers, `next/link` fine either way |
| `components/ScrollToTop.tsx` | Yes | `usePathname`, `useEffect`, `window` |
| `components/Item.tsx` | Yes | `useState`, `useRef`, react-hook-form, `FileReader`, handlers |
| `components/Formulario.tsx` | Yes | react-hook-form, `useRef`, `useState`, `localStorage` (via api), handlers |
| `components/Search.tsx` | Yes | `onChange`/`onSubmit` handlers |
| `components/PetFilters.tsx` | Yes | `onChange` handlers |
| `components/HomePets.tsx` | Yes | `useQuery`, `useState` |
| `components/Button.tsx` | Yes | attaches `onClick` to a DOM element |
| `components/Alert.tsx` | Yes | `onClick` handlers |
| `components/Poup.tsx` | Yes | `onClick` handler on close icon |
| `components/About.tsx`, `Hero.tsx`, `CardAside.tsx`, `MFooter.tsx`, `Spinner.tsx`, `PetsLoadingMessage.tsx`, `HomePetsFallback.tsx` | No | No hooks/handlers/browser APIs. They may render client components (`Button`) — allowed. When imported from a client file (e.g. `Spinner` inside `HomePets`) they simply become part of the client bundle. |
| `lib/auth.ts`, `lib/api.ts`, `lib/filterPets.ts`, `types.ts` | No directive | Plain modules. `auth.ts` guards `window` with `typeof window`. `api.ts` is only ever called from client components. |
| `lib/pets-server.ts` | No | Server-only by usage (called from `app/page.tsx`). |

### Route mapping

| Old (`react-router`) | New (App Router) | Rendering |
|---|---|---|
| `/` → `PagePrincipal` (lazy) | `src/app/page.tsx` | Server component, dynamic (`no-store`), streams the list |
| `/painel` → `PainelAdm` (lazy) | `src/app/painel/page.tsx` | Client page (static shell) |
| `/cadastro` → `Prorota` > `Formulario` (lazy) | `src/app/(admin)/cadastro/page.tsx` under `(admin)/layout.tsx` | Client guard + client form |
| `/gerenciar` → `Prorota` > `Gerenciar` (lazy) | `src/app/(admin)/gerenciar/page.tsx` under `(admin)/layout.tsx` | Client guard + client page |
| `<Suspense fallback={gif}>` around routes | `src/app/loading.tsx` + `<Suspense>` inside `page.tsx` | App Router code-splits per route; `React.lazy` removed |

### react-router API replacement table

| react-router | Next.js |
|---|---|
| `<Link to="/">` | `import Link from 'next/link'` → `<Link href="/">` |
| `useNavigate()` → `navigate('/x')` | `import { useRouter } from 'next/navigation'` → `router.push('/x')` |
| `<Navigate to="/painel" replace/>` | `router.replace('/painel')` inside `useEffect` |
| `useLocation().pathname` | `usePathname()` from `next/navigation` |
| `<Outlet/>` | `children` prop of the route-group `layout.tsx` |
| `<BrowserRouter>/<Routes>/<Route>` | filesystem: `app/**/page.tsx` |

---

### Task 1: Branch, dependency swap, package scripts, .gitignore, dead-file removal

**Files:**
- Modify: `package.json` (full replacement below)
- Modify: `.gitignore`
- Create: `.env.example`
- Delete: `estrutura.txt`, `src/estrutura.txt`, `src/paginas/pagebusca.jsx`, `src/paginas/pagecadastro.jsx`, `src/img/teste.jpg`, `src/img/loading.svg`, `src/img/QRVoluntario.jpeg`, `src/assets/react.svg`, `public/vite.svg`, `public/ico.png`, `package-lock.json` (regenerated)

**Interfaces:**
- Produces: `npm run dev|build|start|lint|typecheck` scripts; `next@16.3.4`, `typescript@5.9`, `eslint-config-next@16.3.4`, `@tailwindcss/postcss@4.3` installed. `NEXT_PUBLIC_URLAPI` documented in `.env.example`.

- [ ] **Step 1: Confirm branch**

Run: `git branch --show-current`
Expected: `feat/nextjs`. If it prints anything else run `git checkout -b feat/nextjs main` (if the branch exists but is not checked out: `git checkout feat/nextjs`). Then run `git status --short` and expect empty output.

- [ ] **Step 2: Delete dead files (D1)**

```bash
git rm -q estrutura.txt src/estrutura.txt \
  src/paginas/pagebusca.jsx src/paginas/pagecadastro.jsx \
  src/img/teste.jpg src/img/loading.svg src/img/QRVoluntario.jpeg \
  src/assets/react.svg public/vite.svg public/ico.png
```

Then verify nothing referenced them: `grep -rn "pagebusca\|pagecadastro\|teste.jpg\|loading.svg\|QRVoluntario\|react.svg\|vite.svg\|ico.png" src index.html || echo "no references"` → expect `no references`.

- [ ] **Step 3: Replace `package.json`**

Write this exact content to `package.json` (D2, D11):

```json
{
  "name": "achados-e-perdidos",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.90.12",
    "axios": "^1.13.2",
    "next": "16.3.4",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.68.0",
    "react-icons": "^5.5.0",
    "react-number-format": "^5.4.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^20.19.0",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "babel-plugin-react-compiler": "^1.0.0",
    "eslint": "^9.39.1",
    "eslint-config-next": "16.3.4",
    "tailwindcss": "^4.3.3",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 4: Reinstall from scratch**

```bash
rm -rf node_modules package-lock.json
npm install
```

Expected: exits 0. Then `node -p "require('next/package.json').version"` → `16.3.4`; `npx tsc -v` → `Version 5.9.x`; `npx eslint -v` → `v9.39.x`.

- [ ] **Step 5: Update `.gitignore`**

Append to the end of `.gitignore`:

```
# next.js
.next/
out/
next-env.d.ts
*.tsbuildinfo

# env
.env*.local

# vercel
.vercel
```

- [ ] **Step 6: Create `.env.example`**

```
# Base URL of the APATA backend API (no trailing slash). Exposed to the browser.
NEXT_PUBLIC_URLAPI=http://localhost:3000
```

Also create an untracked `.env.local` with the real backend URL for local smoke tests. ASSUMPTION: the executor obtains the real URL from the Vercel project's existing `VITE_URLAPI` (Vercel dashboard → Settings → Environment Variables, or `vercel env pull` if the CLI is linked) or from the user. Do not commit `.env.local`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: swap vite/react-router deps for next 16 + typescript, remove dead files

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 2: Next/TS/PostCSS/ESLint config files; remove Vite/SPA config

**Files:**
- Create: `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- Delete: `vite.config.js`, `eslint.config.js`, `vercel.json`

**Interfaces:**
- Produces: `@/*` path alias → `./src/*` used by every later task. ESLint rule set = `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`.

- [ ] **Step 1: Delete Vite-era config**

```bash
git rm -q vite.config.js eslint.config.js vercel.json
```

`vercel.json` contained only the SPA catch-all rewrite `/(.*) → /index.html`. Next serves every route itself, and the rewrite would break Next's routing on Vercel, so it must go (D-user 3).

- [ ] **Step 2: Create `tsconfig.json`**

Values match the defaults Next 16 writes (`target ES2017`, `jsx react-jsx`, `moduleResolution bundler`), plus `strict: true` and the `@/*` alias:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Note: `next-env.d.ts` is **generated** by `next dev`/`next build` (content: `/// <reference types="next" />`, `/// <reference types="next/image-types/global" />`, `import "./.next/types/routes.d.ts";`, `import "./.next/types/root-params.d.ts";`). Do not hand-write it; it is gitignored (Task 1). `tsc --noEmit` only works after the first `next build` (Task 4). Next may also append `.next/dev/types/**/*.ts` to `include` on first run — keep whatever it writes.

- [ ] **Step 3: Create `next.config.ts` (D5)**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Same compiler the Vite build already used (babel-plugin-react-compiler 1.0).
  reactCompiler: true,
}

export default nextConfig
```

- [ ] **Step 4: Create `postcss.config.mjs`**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

- [ ] **Step 5: Create `eslint.config.mjs`**

```js
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
```

`next lint` was removed in Next 16; the `lint` script is the plain ESLint CLI (already set in Task 1).

- [ ] **Step 6: Verify configs load**

Run: `npx eslint --print-config next.config.ts | head -5`
Expected: JSON output starting with `{` (no "config not found"/import errors).

Run: `node -e "import('./next.config.ts').catch(e=>{console.error(e);process.exit(1)})"` is NOT expected to work under Node 20 (no TS loader) — skip. Next itself loads `next.config.ts`; it is validated in Task 4's build.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add next/ts/postcss/eslint config, drop vite and vercel.json

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 3: Typed foundation — `types.ts`, `lib/auth.ts`, `lib/api.ts`, `lib/filterPets.ts`

**Files:**
- Create: `src/types.ts`, `src/lib/auth.ts`, `src/lib/api.ts`, `src/lib/filterPets.ts`
- Delete: `src/hookapi/fetchItem.jsx`, `src/ContextNavbar.jsx`

**Interfaces:**
- Produces (used by every later task):
  - `types.ts`: `Especie`, `Sexo`, `Porte`, `Pet`, `PetFormValues`, `PetFilters`, `LoginPayload`, `LoginResponse`
  - `lib/auth.ts`: `getToken(): string | null`, `setToken(token: string): void`, `clearToken(): void`, `useAuthToken(): string | null`, `useIsClient(): boolean`
  - `lib/api.ts`: `listarPets(): Promise<Pet[]>`, `criarPet(dados: FormData): Promise<Pet>`, `editarPet(id: Pet['id'], dados: FormData): Promise<Pet>`, `deletarPet(id: Pet['id']): Promise<void>`, `loginAdm(dados: LoginPayload): Promise<LoginResponse>`, `verificarToken(): Promise<void>`
  - `lib/filterPets.ts`: `filterPets(pets: Pet[], filters: PetFilters): Pet[]`, `EMPTY_FILTERS: PetFilters`

- [ ] **Step 1: Create `src/types.ts`**

Field shape derived from actual usage: `pageprincipal.jsx`/`gerenciar.jsx` read `pet.id, nome, foto, especie, descricao, porte, sexo, contato`; `formulario.jsx` posts `nome, especie, porte, sexo, descricao, file, contato`; select option values are the literal unions below; `PainalAdm.jsx` posts `{ email, password }` and reads `data.token`.

```ts
export type Especie = 'cachorro' | 'gato'
export type Sexo = 'macho' | 'femea'
export type Porte = 'pequeno' | 'medio' | 'grande'

/** A pet as returned by GET /pets. */
export interface Pet {
  /** ASSUMPTION: the API returns `id` (used as React key and in /pets/:id URLs). If a real response shows a numeric id, change this to `number` — nothing else needs to change. */
  id: string
  nome: string
  /** Absolute URL of the photo (remote host, see D6). */
  foto: string
  especie: Especie
  sexo: Sexo
  porte: Porte
  descricao: string
  /** Phone; may arrive formatted. Always strip non-digits before use. */
  contato: string
}

/** react-hook-form values for create/edit. Empty string = "Selecione". */
export interface PetFormValues {
  nome: string
  descricao: string
  especie: Especie | ''
  porte: Porte | ''
  sexo: Sexo | ''
  contato: string
}

export interface PetFilters {
  busca: string
  especie: Especie | ''
  sexo: Sexo | ''
  porte: Porte | ''
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}
```

- [ ] **Step 2: Create `src/lib/auth.ts` (D4)**

```ts
import { useSyncExternalStore } from 'react'

const TOKEN_KEY = 'token'
const AUTH_EVENT = 'apata-auth-change'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(AUTH_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(AUTH_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function getServerToken(): null {
  return null
}

/**
 * Current JWT (or null). Hydration-safe: the server snapshot is always null,
 * React re-renders with the real value right after hydration.
 */
export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getToken, getServerToken)
}

function noopSubscribe(): () => void {
  return () => {}
}

function clientSnapshot(): boolean {
  return true
}

function serverSnapshot(): boolean {
  return false
}

/** false during SSR and the hydration render, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, clientSnapshot, serverSnapshot)
}
```

- [ ] **Step 3: Create `src/lib/api.ts`**

Ports `src/hookapi/fetchItem.jsx` (`ListarItem`, `EditarItem`, `DeletaItem`, `Loginadm`) plus the two inline axios calls that lived in components (`POST /pets` in `formulario.jsx`, `GET /usuarios` in `Navbar.jsx`). `process.env.NEXT_PUBLIC_URLAPI` must be referenced as that exact full expression so Next inlines it in the client bundle.

```ts
import axios from 'axios'
import type { LoginPayload, LoginResponse, Pet } from '@/types'
import { getToken } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_URLAPI

function authConfig() {
  return { headers: { authorization: `Bearer ${getToken() ?? ''}` } }
}

export async function listarPets(): Promise<Pet[]> {
  const { data } = await axios.get<Pet[]>(`${API_URL}/pets`)
  return data
}

export async function criarPet(dados: FormData): Promise<Pet> {
  const { data } = await axios.post<Pet>(`${API_URL}/pets`, dados, authConfig())
  return data
}

export async function editarPet(id: Pet['id'], dados: FormData): Promise<Pet> {
  const { data } = await axios.put<Pet>(`${API_URL}/pets/${id}`, dados, authConfig())
  return data
}

export async function deletarPet(id: Pet['id']): Promise<void> {
  await axios.delete(`${API_URL}/pets/${id}`, authConfig())
}

export async function loginAdm(dados: LoginPayload): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${API_URL}/login`, dados)
  return data
}

/** Throws (401/403) when the stored token is no longer valid. */
export async function verificarToken(): Promise<void> {
  await axios.get(`${API_URL}/usuarios`, authConfig())
}
```

- [ ] **Step 4: Create `src/lib/filterPets.ts`**

The identical filter expression existed twice (`pageprincipal.jsx`, `gerenciar.jsx`).

```ts
import type { Pet, PetFilters } from '@/types'

export const EMPTY_FILTERS: PetFilters = {
  busca: '',
  especie: '',
  sexo: '',
  porte: '',
}

export function filterPets(pets: Pet[], filters: PetFilters): Pet[] {
  const busca = filters.busca.toLowerCase()
  return pets.filter(
    (pet) =>
      (busca === '' || pet.nome.toLowerCase().includes(busca)) &&
      (filters.especie === '' || pet.especie === filters.especie) &&
      (filters.sexo === '' || pet.sexo === filters.sexo) &&
      (filters.porte === '' || pet.porte === filters.porte),
  )
}
```

- [ ] **Step 5: Delete the old api layer and context**

```bash
git rm -q src/hookapi/fetchItem.jsx src/ContextNavbar.jsx
```

- [ ] **Step 6: Verify (type-only)**

`next-env.d.ts` does not exist yet, so run a scoped check:

```bash
npx tsc --noEmit --strict --jsx react-jsx --module esnext --moduleResolution bundler --target ES2017 --lib dom,dom.iterable,esnext --skipLibCheck --esModuleInterop --baseUrl . --paths null src/types.ts src/lib/auth.ts src/lib/api.ts src/lib/filterPets.ts 2>&1 | grep -v "next-env" ; echo "exit: ${PIPESTATUS[0]}"
```

If `--paths null` is rejected by your tsc, instead temporarily run `npx tsc --noEmit -p tsconfig.json` and accept only errors mentioning `next-env.d.ts`/`.next/types` (missing generated files); any error inside `src/` must be fixed. Also run `npm run lint` → expect 0 errors (warnings allowed).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: typed domain model, auth store and axios api layer

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 4: App shell — layout, providers, global CSS, loading, shell components; first green build

**Files:**
- Create: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/providers.tsx`, `src/app/loading.tsx`, `src/app/page.tsx` (temporary shell, replaced in Task 6), `src/components/Spinner.tsx`
- Rename+rewrite (`git mv`): `src/components/ScrollToTop.jsx`→`ScrollToTop.tsx`, `button.jsx`→`Button.tsx`, `alert.jsx`→`Alert.tsx`, `about.jsx`→`About.tsx`, `hero.jsx`→`Hero.tsx`, `cardaside.jsx`→`CardAside.tsx`, `mfooter.jsx`→`MFooter.tsx`, `Navbar.jsx`→`Navbar.tsx`
- Delete: `index.html`, `src/main.jsx`, `src/App.jsx`, `src/App.css`, `src/index.css`

**Interfaces:**
- Consumes: `useAuthToken`, `getToken`, `clearToken` (auth.ts); `verificarToken` (api.ts)
- Produces: `Button({ name, func?, size?, type?, className?, disabled? })`, `Alert({ titulo, descricao, bty, btn, fbty, fbtn, estado })`, `CardAside({ title, image?, text?, content? })`, `Spinner({ className? })`, `Hero`, `About`, `MFooter`, `Navbar`, `ScrollToTop`, `Providers`

- [ ] **Step 1: Rename files with git so history follows**

```bash
git mv src/components/ScrollToTop.jsx src/components/ScrollToTop.tsx
git mv src/components/button.jsx     src/components/Button.tsx
git mv src/components/alert.jsx      src/components/Alert.tsx
git mv src/components/about.jsx      src/components/About.tsx
git mv src/components/hero.jsx       src/components/Hero.tsx
git mv src/components/cardaside.jsx  src/components/CardAside.tsx
git mv src/components/mfooter.jsx    src/components/MFooter.tsx
git mv src/components/Navbar.jsx     src/components/Navbar.tsx
mkdir -p src/app
```

- [ ] **Step 2: Create `src/app/globals.css`** (merge of `src/index.css` + `src/App.css`; font family now comes from the `next/font` CSS variable `--font-wdxl`; everything else byte-equivalent)

```css
@import "tailwindcss";

:root {
  --bg-color: #ffff;
  --bg-color2: #F0F7E8;
  --text-color: #437900;
  --text-color2: #2E3A1F;
  --primary-color: #B6DA7A;
  --secondary-color: #95b265;
  --tertiary-color: #8FC13E;
}

* {
  box-sizing: border-box;
  outline: 0;
  font-family: var(--font-wdxl), sans-serif;
}

html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: var(--font-wdxl), sans-serif;
  font-weight: 400;
  text-align: center;
}

#root {
  margin-top: 25px;
  min-height: 100vh;
  padding-top: 40px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html {
  font-size: 25px;
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-color);
}

.formlabel {
  color: var(--text-color);
  font-size: 25px;
  text-align: left;
  padding: 30px 0px 10px 0px;
  font-weight: bold;
}

.formerro {
  font-size: 20px;
  color: #8f0404;
  padding: 5px;
  margin: 0px;
}

.navitem {
  color: var(--text-color2);
  cursor: pointer;
  transition: all;
  transition-duration: 200ms;
}
.navitem:hover {
  color: var(--tertiary-color);
}

.textarea {
  resize: vertical;
  min-height: 50px;
}

.input, .textarea {
  width: 90%;
  display: block;
  margin: auto;
  margin-bottom: 0px;
  margin-top: 0px;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff;
  border: 2px solid var(--primary-color);
  font-family: var(--font-wdxl), sans-serif;
  color: black;
  font-size: 18px;
  height: fit-content;
}

@media (max-width: 640px) {
  .input, .textarea { font-size: 18px; }
}

.plogin {
  margin: auto;
  font-size: 25px;
  padding: 10px 0px 0px 0px;
  color: #DA7A4A;
  font-weight: bold;
}

input, button, textarea {
  touch-action: manipulation;
}
```

- [ ] **Step 3: Create `src/components/Spinner.tsx`** (DRY for the five `load.gif` usages; D6)

```tsx
import Image from 'next/image'
import loading from '@/img/load.gif'

interface SpinnerProps {
  className?: string
}

export default function Spinner({ className = '' }: SpinnerProps) {
  return (
    <Image
      src={loading}
      alt="Carregando"
      unoptimized
      className={`w-20 h-auto ${className}`}
    />
  )
}
```

- [ ] **Step 4: Write `src/components/Button.tsx`** (D7b, D8; `type` intentionally has no default so in-form behaviour is unchanged)

```tsx
'use client'

import type { CSSProperties, ReactNode } from 'react'

interface ButtonProps {
  name: ReactNode
  func?: () => void
  size?: number | string
  type?: 'button' | 'submit' | 'reset'
  className?: string
  disabled?: boolean
}

export default function Button({ name, func, size, type, className = '', disabled = false }: ButtonProps) {
  const style: CSSProperties | undefined = size !== undefined ? { fontSize: `${size}pt` } : undefined

  return (
    <button
      type={type}
      disabled={disabled}
      style={style}
      className={`bg-(--primary-color) text-(--text-color) hover:bg-(--tertiary-color) hover:text-(--text-color2) font-bold px-2 py-1 rounded transition-colors duration-200 cursor-pointer my-1 w-full ${className}`}
      onClick={func}
    >
      {name}
    </button>
  )
}
```

- [ ] **Step 5: Write `src/components/Alert.tsx`**

```tsx
'use client'

interface AlertProps {
  titulo: string
  descricao: string
  bty: string
  btn: string
  fbty: () => void
  fbtn: () => void
  estado: boolean
}

export default function Alert({ titulo, descricao, bty, btn, fbty, fbtn, estado }: AlertProps) {
  if (!estado) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-200">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-white p-0 m-0 max-w-62.5 max-h-75 rounded-t-2xl">
        <div>
          <h3 className="rounded-t-xl bg-(--primary-color) text-(--text-color) text-0.8 m-0 py-1 font-extrabold">{titulo}</h3>
          <p className="text-xs p-2.5 m-0 text-(--text-color) max-w-52">{descricao}</p>
        </div>

        <div className="flex flex-row justify-center gap-2 p-2">
          <button
            className="w-full bg-(--primary-color) text-(--text-color) border-0 rounded-md font-bold transition duration-500 py-1 px-2 my-1 text-[20pt] hover:bg-(--text-color) hover:text-white"
            onClick={fbty}
          >
            {bty}
          </button>
          <button
            className="w-full bg-(--primary-color) text-(--text-color) border-0 rounded-md font-bold transition duration-500 py-1 px-2 my-1 text-[20pt] hover:bg-(--text-color) hover:text-white"
            onClick={fbtn}
          >
            {btn}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Write `src/components/CardAside.tsx`**

```tsx
import Image, { type StaticImageData } from 'next/image'
import type { ReactNode } from 'react'

interface CardAsideProps {
  title: string
  image?: StaticImageData
  text?: string
  content?: ReactNode
}

export default function CardAside({ title, image, text, content }: CardAsideProps) {
  return (
    <section className="bg-(--bg-color2) sm:w-32 w-full mx-auto p-2 rounded-xl flex flex-col flex-wrap justify-center items-center">
      <h3 className="text-sm whitespace-nowrap text-[20pt] font-bold text-(--text-color)">{title}</h3>
      {image && <Image src={image} alt={title} className="sm:w-20 w-10/12 h-auto" />}
      {text && <p className="text-[12pt] pt-1">{text}</p>}
      {content}
    </section>
  )
}
```

- [ ] **Step 7: Write `src/components/Hero.tsx`**

```tsx
import Image from 'next/image'
import catdog from '@/img/catdog.svg'
import Button from './Button'

export default function Hero() {
  return (
    <div className="h-fit w-full bg-(--bg-color2) flex lg:flex-row flex-col px-4 mt-8 gap-4 items-center justify-center">
      <div className="lg:order-1 order-2 text-wrap text-sm text-left flex flex-col justify-end">
        <p className="sm:text-2xl text-sm text-(--text-color)">Adote um amigo. Mude uma vida</p>
        <p className="text-(--text-color2) sm:text-sm text-[16pt]">Dezenas de animais esperam um lar com amor. ❤️</p>
        <p className="text-(--text-color2) sm:text-sm text-[16pt]">Seja abrigo e companhia constante.</p>

        <div className="flex sm:flex-row flex-col gap-x-2 my-2">
          <a href="#adotar"><Button name="Adotar" size={20} /></a>
          <a href="#doar"><Button name="Doar" size={20} /></a>
          <a className="flex" href="https://chat.whatsapp.com/CwqD6s5Ft5C9ITPPsE1V7q" target="_blank" rel="noopener noreferrer">
            <Button name="Voluntariar" size={20} />
          </a>
        </div>
      </div>

      <Image src={catdog} alt="Ilustração de um gato e um cachorro" className="lg:order-2 order-1 w-40 my-2 h-auto object-contain" />
    </div>
  )
}
```

- [ ] **Step 8: Write `src/components/About.tsx`**

```tsx
import { TbDog } from 'react-icons/tb'
import { LuCat } from 'react-icons/lu'
import Button from './Button'

export default function About() {
  return (
    <section className="text-(--text-color) text-center md:w-9/12 w-full mx-auto py-8">
      <div className="flex sm:flex-row flex-col items-center justify-center gap-4 p-4">
        <TbDog className="sm:text-[500px] text-[200px] h-fit text-(--primary-color)" />

        <div className="flex flex-col">
          <h2 className="sm:text-xl text-base font-bold text-left">SOBRE NÓS</h2>
          <p className="text-left sm:text-base text-[18pt]">
            Somos da Associação de proteção dos animais e do meio ambiente de Altamira Pará.
            Atuamos de forma voluntária, sem fins lucrativos.
          </p>
        </div>
      </div>

      <div className="flex sm:flex-row flex-col items-start justify-center gap-4 py-8">
        <div className="flex flex-col justify-start p-4">
          <h2 className="text-left sm:text-xl text-base font-bold">SOBRE O SITE</h2>
          <p className="text-left sm:text-base text-[18pt]">
            Foi desenvolvido pela Canoa Tech de maneira gratuíta como uma iniciativa solidária.
          </p>

          <a href="https://canoatech.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex">
            <Button name="CANOA TECH" size={20} />
          </a>
        </div>

        <LuCat className="sm:text-[300px] text-[200px] h-fit mx-auto text-(--primary-color)" />
      </div>
    </section>
  )
}
```

- [ ] **Step 9: Write `src/components/MFooter.tsx`**

```tsx
import Image from 'next/image'
import { AiFillInstagram } from 'react-icons/ai'
import { MdEmail } from 'react-icons/md'
import LogoCanoa from '@/img/logoct.svg'

export default function MFooter() {
  return (
    <div className="bottom-0 mb-0 pb-0 w-full bg-(--primary-color) pt-0.5">
      <footer className="flex lg:flex-row flex-col p-2 justify-center items-center gap-x-8 gap-y-2 text-center sm:text-[12pt] text-[12pt] bg-(--bg-color2) text-(--text-color) pb-4">
        <div className="flex flex-col gap-x-1">
          <p className="font-bold">APATA - Altamira Pará</p>
        </div>

        <div className="flex lg:flex-col flex-row gap-1">
          <div className="flex items-center justify-center">
            <a href="https://www.instagram.com/apataltamira/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-(--text-color2) transition duration-300">
              <AiFillInstagram /> Instagram
            </a>

            <a href="mailto:apatadealtamira@gmail.com" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-(--text-color2) transition duration-300">
              <MdEmail className="ml-2" />
              apatadealtamira@gmail.com
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <a className="flex items-center hover:text-(--text-color2) transition duration-300" href="https://canoatech.vercel.app/" target="_blank" rel="noopener noreferrer">
            <Image src={LogoCanoa} alt="Canoa Tech" className="h-8 w-auto mr-1" />
            <p className="font-bold">Site desenvolvido pela Canoa Tech</p>
          </a>
          <p>
            Colaboradores:
            <a href="https://github.com/willqos15" target="_blank" rel="noopener noreferrer" className="hover:text-(--text-color2) transition duration-300"> William Queiroz</a> e
            <a href="https://github.com/FerMacedo" target="_blank" rel="noopener noreferrer" className="hover:text-(--text-color2) transition duration-300"> Fernando Macedo</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 10: Write `src/components/ScrollToTop.tsx`** (D13)

```tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
```

All routes are static segments (no `[param]`), so `usePathname` needs no Suspense boundary here.

- [ ] **Step 11: Write `src/components/Navbar.tsx`** (D1: `/busca` search removed; D4: `adm` derived from token)

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Alert from './Alert'
import LogoApata from '@/img/logoapata.png'
import { clearToken, getToken, useAuthToken } from '@/lib/auth'
import { verificarToken } from '@/lib/api'

export default function Navbar() {
  const router = useRouter()
  const adm = useAuthToken() !== null
  const [openmenuham, setOpenMenuHam] = useState(false)
  const [poup, setPoup] = useState(false)

  async function telaadm() {
    if (!getToken()) {
      router.push('/painel')
      return
    }

    try {
      await verificarToken()
      router.push('/gerenciar')
    } catch {
      clearToken()
      router.push('/painel')
    }
  }

  function sair() {
    clearToken()
    router.push('/painel')
    setPoup(false)
  }

  function paginacriar() {
    router.push('/cadastro')
  }

  function paginainicial() {
    router.push('/')
  }

  function alternarMenu() {
    setOpenMenuHam((aberto) => !aberto)
    if (!openmenuham) {
      setTimeout(() => setOpenMenuHam(false), 18000)
    }
  }

  return (
    <>
      <header className="flex fixed top-0 justify-between items-center w-full max-h-16 bg-white z-100 px-4 sm:pr-8">
        <div onClick={paginainicial} className="flex flex-row justify-center items-center gap-x-1 cursor-pointer">
          <Image src={LogoApata} alt="APATA" className="h-5 w-auto" />
          <h1 className="text-(--text-color) font-extrabold text-base">APATA</h1>
        </div>

        <nav className="relative flex items-center justify-between">
          <button className="flex flex-col justify-center gap-0.5 sm:hidden p-2" onClick={alternarMenu} aria-label="Abrir menu">
            <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
            <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
            <span className="w-4 h-0.5 bg-(--text-color) transition-all" />
          </button>

          <ul
            className={`
              absolute top-full right-0 mt-0
              w-fit bg-white
              overflow-hidden
              transition-all duration-300
              ${openmenuham ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0'}
              flex flex-col
              sm:gap-2 gap-0 px-2 pb-1 rounded-b-sm
              sm:static sm:mt-0 sm:w-auto sm:bg-transparent
              sm:max-h-none sm:opacity-100
              sm:flex-row sm:p-0
              sm:text-sm text-[15pt]
            `}
          >
            <li className="navitem">
              <Link href="/">Início</Link>
            </li>

            <li onClick={telaadm} className="navitem">
              Gerenciar
            </li>

            {adm && (
              <>
                <li onClick={paginacriar} className="navitem">
                  Cadastrar
                </li>

                <li onClick={() => setPoup(true)} className="navitem">
                  Sair
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <Alert
        titulo="AVISO"
        descricao="Tem certeza que deseja sair da conta?"
        bty="Sim"
        fbty={sair}
        btn="Não"
        fbtn={() => setPoup(false)}
        estado={poup}
      />
    </>
  )
}
```

- [ ] **Step 12: Create `src/app/providers.tsx`**

```tsx
'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export default function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; created lazily so SSR never shares it across requests.
  const [client] = useState(() => new QueryClient())

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

- [ ] **Step 13: Create `src/app/layout.tsx`** (from `index.html` + `main.jsx` + `App.jsx`; D3)

```tsx
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { WDXL_Lubrifont_JP_N } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'
import MFooter from '@/components/MFooter'
import ScrollToTop from '@/components/ScrollToTop'

const wdxl = WDXL_Lubrifont_JP_N({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-wdxl',
})

export const metadata: Metadata = {
  title: 'Apata ATM',
  description:
    'APATA - Associação de proteção dos animais e do meio ambiente de Altamira Pará. Adote um amigo.',
  icons: { icon: '/logoapata.svg' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={wdxl.variable}>
      <body>
        <Providers>
          <div id="root">
            <ScrollToTop />
            <Navbar />
            {children}
            <MFooter />
          </div>
        </Providers>
      </body>
    </html>
  )
}
```

Notes: `<div id="root">` keeps the `#root` CSS rules working unchanged. `<meta charset>` and `<meta viewport>` are emitted by Next automatically. The stale `<link href="/src/style.css">` from `index.html` is dropped (that file never existed — verified). `StrictMode` is Next's default in dev. `Duru Sans` dropped per D3.

- [ ] **Step 14: Create `src/app/loading.tsx`** (replaces the `Suspense` gif fallback from `App.jsx`)

```tsx
import Spinner from '@/components/Spinner'

export default function Loading() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <Spinner className="mx-auto" />
    </div>
  )
}
```

- [ ] **Step 15: Create a temporary `src/app/page.tsx`** (replaced in Task 6; needed so the build has a route)

```tsx
import Hero from '@/components/Hero'
import About from '@/components/About'

export default function HomePage() {
  return (
    <div>
      <Hero />
      <About />
    </div>
  )
}
```

- [ ] **Step 16: Delete the Vite entry files**

```bash
git rm -q index.html src/main.jsx src/App.jsx src/App.css src/index.css
```

- [ ] **Step 17: First build + typecheck + lint**

```bash
npm run build
```
Expected: "Compiled successfully", routes `/`, `/_not-found` listed, `ƒ` or `○` markers, exit 0. This generates `next-env.d.ts` and `.next/types`. Check `git status` — if Next edited `tsconfig.json` (e.g. added `.next/dev/types/**/*.ts` to `include`), keep the change.

```bash
npm run typecheck
npm run lint
```
Expected: both exit 0. Remaining `.jsx` files (`Item`, `poup`, `search`, `formulario`, `paginas/*`) are not imported by anything yet and are not in tsconfig `include`; ESLint may report errors in them — those files are ported in Tasks 5, 7, 8, 9; for this task only errors in `.ts`/`.tsx` files must be zero. Filter with `npx eslint "src/**/*.{ts,tsx}" "*.{ts,mjs}"`.

- [ ] **Step 18: Smoke run**

`npm run dev`, open `http://localhost:3000`: expect fixed white header with APATA logo, "Início/Gerenciar" menu, hero, about section, footer, WDXL font applied (`getComputedStyle(document.body).fontFamily` contains `WDXL`), favicon = logoapata. Clicking "Gerenciar" without token navigates to `/painel` (404 is expected until Task 7). Stop the server.

- [ ] **Step 19: Commit**

```bash
git add -A
git commit -m "feat: next app router shell (layout, providers, fonts, global css, navbar/footer)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 5: Pet card and filter components (`Item`, `Poup`, `Search`, `PetFilters`)

**Files:**
- Rename+rewrite: `src/components/poup.jsx`→`Poup.tsx`, `search.jsx`→`Search.tsx`, `Item.jsx`→`Item.tsx`
- Create: `src/components/PetFilters.tsx`

**Interfaces:**
- Consumes: `Pet`, `PetFormValues`, `PetFilters` (types.ts); `Button`
- Produces: `Item({ pet, admin, onDelete?, onUpdate?, onStart?, onEnd? })`, `Search({ busca, setBusca })`, `PetFilters({ filters, onChange })`, `Poup({ titulo, conteudo, show, setShow })`

- [ ] **Step 1: Rename**

```bash
git mv src/components/poup.jsx   src/components/Poup.tsx
git mv src/components/search.jsx src/components/Search.tsx
git mv src/components/Item.jsx   src/components/Item.tsx
```

- [ ] **Step 2: Write `src/components/Poup.tsx`**

```tsx
'use client'

import type { ReactNode } from 'react'
import { IoClose } from 'react-icons/io5'

interface PoupProps {
  titulo: string
  conteudo: ReactNode
  show: boolean
  setShow: (show: boolean) => void
}

export default function Poup({ titulo, conteudo, show, setShow }: PoupProps) {
  return (
    <div className={show ? 'bg-[rgba(0,0,0,0.8)] fixed flex items-center inset-0 z-200' : 'hidden'}>
      <div className="bg-white max-w-screen mx-auto">
        <div className="flex items-center w-full gap-2 p-1 bg-(--primary-color) font-bold text-(--text-color) text-xl relative">
          <h1 className="w-full text-center">{titulo}</h1>
          <IoClose
            onClick={() => setShow(false)}
            className="cursor-pointer rounded-md font-bold text-white bg-red-600 transition-all duration-300 hover:bg-red-800"
          />
        </div>

        <span className="text-[#21285C] w-full">{conteudo}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `src/components/Search.tsx`** (D7a)

```tsx
'use client'

import type { FormEvent } from 'react'
import { FaSearch } from 'react-icons/fa'

interface SearchProps {
  busca: string
  setBusca: (valor: string) => void
}

export default function Search({ busca, setBusca }: SearchProps) {
  function pesquisar(e: FormEvent<HTMLFormElement>) {
    // Filtering is live (see filterPets); submit only prevents a page reload.
    e.preventDefault()
  }

  return (
    <div className="w-11/12 justify-center items-center">
      <form onSubmit={pesquisar} className="flex flex-nowrap">
        <input
          type="text"
          value={busca}
          placeholder="Buscar por nome."
          onChange={(e) => setBusca(e.target.value)}
          className="border-2 border-(--primary-color) bg-(--bg-color) p-1 h-6 rounded-sm sm:w-40 w-32 sm:text-[24px] text-[18px]"
        />

        <button type="submit" aria-label="Buscar">
          <FaSearch className="ml-2 text-(--text-color)" />
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/PetFilters.tsx`** (the Search + three selects block duplicated in `pageprincipal.jsx` and `gerenciar.jsx`; wrappers stay in the pages)

```tsx
'use client'

import Search from './Search'
import type { Especie, PetFilters as PetFiltersValue, Porte, Sexo } from '@/types'

interface PetFiltersProps {
  filters: PetFiltersValue
  onChange: (filters: PetFiltersValue) => void
}

export default function PetFilters({ filters, onChange }: PetFiltersProps) {
  return (
    <>
      <Search busca={filters.busca} setBusca={(busca) => onChange({ ...filters, busca })} />

      <div className="flex flex-row gap-2 w-full items-center justify-center sm:text-[18pt] text-[12pt]">
        <div className="flex flex-col text-(--text-color)">
          <label htmlFor="filtro-especie">Espécie</label>
          <select
            id="filtro-especie"
            className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color) w-fit"
            value={filters.especie}
            onChange={(e) => onChange({ ...filters, especie: e.target.value as Especie | '' })}
          >
            <option value="">Todas</option>
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
          </select>
        </div>

        <div className="flex flex-col text-(--text-color)">
          <label htmlFor="filtro-sexo">Sexo</label>
          <select
            id="filtro-sexo"
            className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color)"
            value={filters.sexo}
            onChange={(e) => onChange({ ...filters, sexo: e.target.value as Sexo | '' })}
          >
            <option value="">Todos</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>
        </div>

        <div className="flex flex-col text-(--text-color)">
          <label htmlFor="filtro-porte">Porte</label>
          <select
            id="filtro-porte"
            className="bg-white px-1 rounded-sm text-black border-2 border-(--primary-color)"
            value={filters.porte}
            onChange={(e) => onChange({ ...filters, porte: e.target.value as Porte | '' })}
          >
            <option value="">Todos</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
        </div>
      </div>
    </>
  )
}
```

The `as Especie | ''` casts are safe because the only `<option value>`s are those literals.

- [ ] **Step 5: Write `src/components/Item.tsx`** (D6, D9, D14; unused `msg`, `trigger`, `valoresget`, `formatarTelefone` removed)

```tsx
'use client'

import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PatternFormat } from 'react-number-format'
import { MdAddPhotoAlternate } from 'react-icons/md'
import { IoLogoWhatsapp, IoMdFemale, IoMdMale } from 'react-icons/io'
import Button from './Button'
import Poup from './Poup'
import type { Pet, PetFormValues } from '@/types'

interface ItemProps {
  pet: Pet
  admin: boolean
  onDelete?: (id: Pet['id'], nome: string) => void
  onUpdate?: (id: Pet['id'], dados: FormData) => Promise<unknown>
  onStart?: () => void
  onEnd?: () => void
}

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function scrollarParaCentro(e: FocusEvent<HTMLElement>) {
  const alvo = e.target
  setTimeout(() => {
    alvo.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

function capitalizar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
}

export default function Item({ pet, admin, onDelete, onUpdate, onStart, onEnd }: ItemProps) {
  const { id, nome, descricao, especie, foto, porte, sexo, contato } = pet

  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [fotoUp, setFotoUp] = useState<string | null>(null)
  const inputFoto = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<PetFormValues>({
    mode: 'onChange',
    defaultValues: { nome: '', descricao: '', especie: '', porte: '', sexo: '', contato: '' },
  })

  async function salvar(dados: PetFormValues) {
    if (!onUpdate) return
    try {
      onStart?.()

      const formData = new FormData()
      ;(Object.keys(dados) as Array<keyof PetFormValues>).forEach((key) => {
        formData.append(key, dados[key])
      })

      const arquivo = inputFoto.current?.files?.[0]
      if (arquivo) formData.append('file', arquivo)

      await onUpdate(id, formData)
    } catch (erro) {
      console.error(erro)
    } finally {
      onEnd?.()
    }
  }

  function uploading(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    const leitor = new FileReader()
    leitor.onload = () => {
      if (typeof leitor.result === 'string') setFotoUp(leitor.result)
    }
    leitor.readAsDataURL(arquivo)
  }

  function editar() {
    setEditando(!editando)
    reset({ nome, descricao, especie, porte, sexo, contato: somenteDigitos(contato) })
  }

  const linkWhatsapp = `https://wa.me/55${somenteDigitos(contato)}?text=${encodeURIComponent(
    `Quero saber mais sobre o ${especie} ${nome}`,
  )}`

  return (
    <>
      <Poup
        show={zoom}
        setShow={setZoom}
        titulo={`foto ${nome}`}
        conteudo={
          // eslint-disable-next-line @next/next/no-img-element -- remote user-uploaded photo, host not configured (D6)
          <img src={foto} alt={nome} className="w-full h-[calc(100vh-100px)] object-contain" />
        }
      />

      <div className="flex flex-col min-[400px]:rounded-t-[20px] rounded-0 transition-all duration-500 text-[20px] min-[400px]:w-30 w-full">
        <div
          onClick={() => {
            if (!admin) setAberto(!aberto)
            if (admin) editar()
          }}
          className="cursor-pointer select-none min-[400px]:w-fit w-full"
        >
          <div className="bg-(--primary-color) min-[400px]:rounded-t-xl rounded-0 transition min-[400px]:w-fit w-full duration-500">
            <div className="flex justify-center items-center py-2 relative mx-4">
              {admin && editando && (
                <button
                  type="button"
                  className="absolute bg-transparent border-0 text-white text-12.5 cursor-pointer transitionduration-200 z-3 text-4xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    inputFoto.current?.click()
                  }}
                  aria-label="Trocar foto"
                >
                  <MdAddPhotoAlternate />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element -- remote photo or FileReader data URL preview (D6) */}
              <img
                src={fotoUp ?? foto}
                alt={`um ${especie} ${sexo} ${porte}`}
                onClick={() => setZoom(true)}
                className={`${editando ? 'brightness-75' : 'brightness-100'} ${
                  aberto ? 'object-contain rounded-none ' : 'object-cover rounded-full '
                } w-24 h-24 hover:object-contain rounded-full border-8 border-(--bg-color2) hover:rounded-none mx-auto bg-white`}
              />
            </div>

            {admin && (
              <>
                <button
                  type="button"
                  onClick={editar}
                  className="m-1 py-1 px-2 text-[13pt] rounded-xl text-(--text-color) border-0 font-bold transition duration-500 cursor-pointer font-sans hover:text-white bg-white hover:bg-(--secondary-color)"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(id, nome)
                  }}
                  className="m-1 py-1 px-2 text-[13pt] rounded-xl text-(--text-color) border-0 font-bold transition duration-500 cursor-pointer font-sans hover:text-white bg-white hover:bg-(--secondary-color)"
                >
                  Apagar
                </button>
              </>
            )}

            <div className="mt-0.5 p-1 h-fit bg-(--bg-color2) cursor-pointer transition-all duration-300">
              <label className="text-(--text-color) font-extrabold text-base flex justify-center items-center">
                {`${nome} `}
                {sexo === 'macho' ? <IoMdMale className="text-blue-500" /> : <IoMdFemale className="text-pink-500" />}
              </label>

              {!admin ? (
                <p
                  className={`text-(--text-color) overflow-hidden transition-all ease-linear ${
                    aberto ? 'max-h-0 opacity-0 duration-0' : 'max-h-40 opacity-100 duration-300'
                  }`}
                >
                  Clique para me conhecer!
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Visitor view */}
        {!admin ? (
          <div
            className={`w-full bg-(--bg-color2) text-(--text-color2) px-2 py-0 pt-0 flex flex-col ease-linear transition-opacity ${
              aberto ? 'max-h-40 duration-500 opacity-100 overflow-visible' : ' max-h-0  duration-0 overflow-hidden'
            }`}
          >
            <label className="font-bold text-[18px]">
              {especie === 'cachorro' && sexo === 'macho' && ' Cachorro de '}
              {especie === 'cachorro' && sexo === 'femea' && ' Cadela de '}
              {especie === 'gato' && sexo === 'femea' && 'Gata de '}
              {especie === 'gato' && sexo === 'macho' && 'Gato de '}
              porte {porte === 'medio' ? 'médio' : porte}
            </label>
            <p className="text-center text-[18px]">{descricao}.</p>

            <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer">
              <Button
                name={
                  <div className="flex items-center justify-center gap-1">
                    <IoLogoWhatsapp className="p-0 m-0" /> <p>Contato</p>
                  </div>
                }
              />
            </a>
          </div>
        ) : null}

        {/* Admin edit form */}
        {admin ? (
          <div
            className={`p-2 w-full bg-(--bg-color2) text-(--text-color2) ease-linear transition-opacity ${
              editando ? 'max-h-fit duration-500 opacity-100' : 'max-h-0 duration-0 overflow-hidden opacity-0'
            }`}
          >
            <form onSubmit={handleSubmit(salvar)}>
              <input type="file" name="file" onChange={uploading} onFocus={scrollarParaCentro} ref={inputFoto} className="hidden" />

              <label>
                <strong>Nome:</strong>
              </label>
              <input className="input" {...register('nome', { required: true, onChange: capitalizar })} type="text" />
              {errors.nome && <p>Campo obrigatório</p>}

              <label>
                <strong>Espécie:</strong>
              </label>
              <select className="input" {...register('especie', { required: true })}>
                <option value="">Selecione</option>
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
              </select>
              {errors.especie && <p>Campo obrigatório</p>}

              <label>
                <strong>Porte:</strong>
              </label>
              <select className="input" {...register('porte', { required: true })}>
                <option value="">Selecione</option>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
              {errors.porte && <p>Campo obrigatório</p>}

              <label>
                <strong>Sexo:</strong>
              </label>
              <select className="input" {...register('sexo', { required: true })}>
                <option value="">Selecione</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
              {errors.sexo && <p>Campo obrigatório</p>}

              <label>
                <strong>Descrição:</strong>
              </label>
              <textarea className="textarea" {...register('descricao', { required: true, onChange: capitalizar })} />
              {errors.descricao && <p>Campo obrigatório</p>}

              <label>
                <strong>Contato: </strong>
              </label>
              <Controller
                name="contato"
                control={control}
                rules={{
                  required: 'Campo obrigatório',
                  validate: (valor) => {
                    if (!valor) return 'Campo obrigatório'
                    return somenteDigitos(valor).length === 11 || 'Número inválido'
                  },
                }}
                render={({ field: { ref, onChange, ...field } }) => (
                  <PatternFormat
                    {...field}
                    getInputRef={ref}
                    className="input"
                    prefix="+55 "
                    format="(##) # ####-####"
                    placeholder="(XX) X XXXX-XXXX"
                    onFocus={scrollarParaCentro}
                    inputMode="numeric"
                    onValueChange={(valores) => onChange(valores.value)}
                  />
                )}
              />
              {errors.contato && <p>{errors.contato.message}</p>}

              <Button name="Salvar" type="submit" className="mt-2 mx-auto" />
            </form>
          </div>
        ) : null}
      </div>
    </>
  )
}
```

- [ ] **Step 6: Verify**

```bash
npm run typecheck && npx eslint "src/**/*.{ts,tsx}" && npm run build
```
Expected: all exit 0 (nothing imports these yet, but they must compile and lint).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: port Item, Poup, Search to typed client components; add shared PetFilters

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 6: Home page as a Server Component with streamed pet list

**Files:**
- Create: `src/lib/pets-server.ts`, `src/components/PetsLoadingMessage.tsx`, `src/components/HomePetsFallback.tsx`, `src/components/HomePets.tsx`
- Rewrite: `src/app/page.tsx`
- Delete: `src/paginas/pageprincipal.jsx`

**Interfaces:**
- Consumes: `Pet`, `PetFilters`; `listarPets`; `filterPets`, `EMPTY_FILTERS`; `Item`, `PetFilters`, `Spinner`, `CardAside`, `Button`, `Hero`, `About`
- Produces: `fetchPetsServer(): Promise<Pet[] | null>`; `HomePets({ initialPets: Pet[] | null })`

- [ ] **Step 1: Create `src/lib/pets-server.ts`** (D15)

```ts
import type { Pet } from '@/types'

/**
 * Server-side fetch of the pet list for the home page.
 * - cache: 'no-store'  → every request sees admin edits immediately (adoption board).
 * - 10 s timeout        → a cold-starting backend cannot block the streamed shell for long;
 *                         on failure we return null and the client (react-query) retries.
 */
export async function fetchPetsServer(): Promise<Pet[] | null> {
  const base = process.env.NEXT_PUBLIC_URLAPI
  if (!base) return null

  try {
    const res = await fetch(`${base}/pets`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null

    const data: unknown = await res.json()
    return Array.isArray(data) ? (data as Pet[]) : null
  } catch {
    return null
  }
}
```

Tradeoff note (for the user): this reads `NEXT_PUBLIC_URLAPI` on the server. A server-only `URLAPI` var would keep the backend URL out of the client bundle, but the client pages (`/gerenciar`, `/cadastro`, `/painel`, react-query refetch on `/`) need it anyway, so hiding it buys nothing. Default: one public var.

- [ ] **Step 2: Create `src/components/PetsLoadingMessage.tsx`** (D12)

```tsx
import Spinner from './Spinner'

export default function PetsLoadingMessage() {
  return (
    <div className="flex flex-col justify-center items-center mx-2">
      <Spinner />

      <div className="bg-(--bg-color2) text-(--text-color) rounded-2xl text-base p-2.5 mx-auto m-1 text-center">
        <p className="font-bold">Procurando seu novo melhor amigo!</p>
        <p>O carregamento pode demorar alguns segundos.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/HomePetsFallback.tsx`**

Must render the same two flex children (`order-1` header block and `order-3` list section) as `HomePets`, so the CSS `order` layout is identical while streaming.

```tsx
import PetsLoadingMessage from './PetsLoadingMessage'

export default function HomePetsFallback() {
  return (
    <>
      <div className="w-full [@media(min-width:1100px)]:order-1 order-1">
        <p className="text-(--text-color)">Adotar um animal:</p>
      </div>

      <section
        className="scroll-mt-8 [@media(min-width:1100px)]:order-3 order-2 gap-2 xl:w-97.5 items-start flex flex-wrap justify-center mb-4"
        id="adotar"
      >
        <PetsLoadingMessage />
      </section>
    </>
  )
}
```

- [ ] **Step 4: Create `src/components/HomePets.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Item from './Item'
import PetFilters from './PetFilters'
import PetsLoadingMessage from './PetsLoadingMessage'
import { listarPets } from '@/lib/api'
import { EMPTY_FILTERS, filterPets } from '@/lib/filterPets'
import type { Pet, PetFilters as PetFiltersValue } from '@/types'

interface HomePetsProps {
  /** Pets fetched on the server; null when the server fetch failed/timed out. */
  initialPets: Pet[] | null
}

export default function HomePets({ initialPets }: HomePetsProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['itens'],
    queryFn: listarPets,
    initialData: initialPets ?? undefined,
    // Server data is fresh per request; avoid an immediate duplicate client fetch,
    // but refetch on focus/remount after 30 s and on invalidation from /gerenciar.
    staleTime: 30_000,
  })

  const [filters, setFilters] = useState<PetFiltersValue>(EMPTY_FILTERS)
  const petsFiltrados = filterPets(data ?? [], filters)

  return (
    <>
      <div className="w-full [@media(min-width:1100px)]:order-1 order-1">
        <p className="text-(--text-color)">Adotar um animal:</p>

        {!isPending && !isError && (
          <div className="bg-(--bg-color2) w-fit rounded-sm p-4 mx-auto items-center flex flex-col mb-2">
            <PetFilters filters={filters} onChange={setFilters} />
          </div>
        )}
      </div>

      <section
        className="scroll-mt-8 [@media(min-width:1100px)]:order-3 order-2 gap-2 xl:w-97.5 items-start flex flex-wrap justify-center mb-4"
        id="adotar"
      >
        {isError && !isPending && (
          <p className="text-[18pt] font-bold text-red-800 w-full"> Algo deu errado. Tente novamente.</p>
        )}

        {!isError && !isPending && petsFiltrados.length <= 0 && (
          <p className="text-[18pt] text-(--text-color) w-full">Nenhum animal encontrado.</p>
        )}

        {isPending && <PetsLoadingMessage />}

        {!isPending && petsFiltrados.map((pet) => <Item key={pet.id} pet={pet} admin={false} />)}
      </section>
    </>
  )
}
```

- [ ] **Step 5: Rewrite `src/app/page.tsx`** (server component; asides/hero/about are static server HTML; list streams)

```tsx
import { Suspense } from 'react'
import { IoLogoWhatsapp } from 'react-icons/io'
import { CiPill } from 'react-icons/ci'
import { FaTshirt } from 'react-icons/fa'
import imagempix from '@/img/QRPIX.jpeg'
import About from '@/components/About'
import Button from '@/components/Button'
import CardAside from '@/components/CardAside'
import Hero from '@/components/Hero'
import HomePets from '@/components/HomePets'
import HomePetsFallback from '@/components/HomePetsFallback'
import { fetchPetsServer } from '@/lib/pets-server'

async function PetsFromServer() {
  const pets = await fetchPetsServer()
  return <HomePets initialPets={pets} />
}

function BotaoGrupo() {
  return (
    <Button
      name={
        <div className="flex whitespace-nowrap items-center justify-center gap-1">
          Entrar no grupo <IoLogoWhatsapp />
        </div>
      }
      size={15}
    />
  )
}

export default function HomePage() {
  return (
    <div>
      <div className="flex flex-wrap flex-row gap-1 items-start justify-center w-full overflow-x-hidden">
        <Suspense fallback={<HomePetsFallback />}>
          <PetsFromServer />
        </Suspense>

        <aside className="[@media(min-width:1100px)]:order-2 order-3 w-fit">
          <div className="scroll-mt-8 sticky sm:w-fit w-full top-8 flex flex-col gap-2 px-2" id="doar">
            <CardAside
              title="PIX SOLIDÁRIO"
              image={imagempix}
              content={
                <>
                  <p className="text-[12pt] font-bold">19.552.047/0001-43</p>
                  <p className="text-[10pt]">Sua contribuição faz a diferença!</p>
                </>
              }
            />

            <CardAside
              title="VOLUNTARIE-SE"
              text="Faça parte da APATA."
              content={
                <a href="https://chat.whatsapp.com/CwqD6s5Ft5C9ITPPsE1V7q" target="_blank" rel="noopener noreferrer">
                  <BotaoGrupo />
                </a>
              }
            />

            <CardAside
              title="ASSOCIE-SE"
              text="Mensalidade mínima de R$30,00."
              content={
                <a href="https://chat.whatsapp.com/JV5q2ig541o5vcenZdzhZl?mode=gi_t" target="_blank" rel="noopener noreferrer">
                  <BotaoGrupo />
                </a>
              }
            />
          </div>
        </aside>

        <aside className="[@media(min-width:1100px)]:order-4 order-2 flex flex-col gap-5">
          <div className="sticky top-8 flex flex-col gap-2 px-2">
            <CardAside
              title="DOE RAÇÃO:"
              content={
                <div className="flex flex-col gap-1">
                  <p className="text-[12pt] text-left"> Por recomendações veterinárias, aceitamos apenas as marcas abaixo:</p>
                  <ul className="text-[12pt] text-left">
                    <li>
                      <strong>Cachorros </strong> - JAPI
                    </li>
                    <li>
                      <strong>Gatos </strong> - GRAN PLUS e MAGNUS SALMÃO{' '}
                    </li>
                  </ul>

                  <hr className="p-[0.5px] w-full bg-(--text-color) text-(--text-color)" />

                  <div className="flex justify-center items-center gap-2 text-(--text-color)">
                    <CiPill />
                    <p className="font-bold text-[20pt]">APOIE:</p>
                    <FaTshirt />
                  </div>
                  <p className="text-[12pt] text-left">
                    Doe remédios para os animais ou apoie nosso Bazar com roupas, calçados, artesanato, livros ou plantas.
                  </p>

                  <a href="https://forms.gle/jFhi6fvzJgtbiKV68" target="_blank" rel="noopener noreferrer">
                    <Button name={<p className="flex whitespace-nowrap items-center justify-center gap-1"> Quero Doar</p>} size={15} />
                  </a>
                </div>
              }
            />
          </div>
        </aside>
      </div>

      <Hero />
      <About />
    </div>
  )
}
```

DOM-order note: previously the DOM order inside the flex container was `div(order-1), aside-PIX, section(order-3), aside-ração`. Now it is `div, section, aside-PIX, aside-ração`. Below 1100px both `section` and `aside-ração` have `order-2`; ties are broken by DOM order and `section` still precedes `aside-ração`, so the visual result is unchanged at every breakpoint.

- [ ] **Step 6: Delete the old page**

```bash
git rm -q src/paginas/pageprincipal.jsx
```

- [ ] **Step 7: Verify**

```bash
npm run typecheck && npx eslint "src/**/*.{ts,tsx}" && npm run build
```
Expected: exit 0; the build output marks `/` as dynamic (`ƒ`).

Smoke (`npm run dev` with `.env.local` set): open `/` — the header/asides/hero/about appear immediately; "Procurando seu novo melhor amigo!" shows while the API answers; then the cards appear. `curl -s http://localhost:3000 | grep -c 'Clique para me conhecer'` → greater than 0 when the API is up (proves pets are in the server HTML). Search by name and the three selects filter live. Clicking a card opens it, WhatsApp button links to `wa.me/55<digits>`; clicking the photo opens the zoom popup; close icon closes it. PIX QR code renders.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: home page as server component with streamed pet list + react-query hydration

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 7: Admin login page `/painel`

**Files:**
- Create: `src/app/painel/page.tsx`
- Delete: `src/paginas/PainalAdm.jsx`

**Interfaces:**
- Consumes: `loginAdm`, `setToken`, `LoginPayload`, `LoginResponse`, `Button`, `Spinner`

- [ ] **Step 1: Create `src/app/painel/page.tsx`**

Dead code removed: `msglogin` state + its `useEffect` (never set to `"erro"`), unused `queryClient`, `adm`, `watch`. `autocapitalize`/`autocorrect` fixed to React casing.

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import Button from '@/components/Button'
import Spinner from '@/components/Spinner'
import { loginAdm } from '@/lib/api'
import { setToken } from '@/lib/auth'
import type { LoginPayload, LoginResponse } from '@/types'

type EstadoLogin = 'deslogado' | 'carregando' | 'logado' | 'erro'

export default function PainelPage() {
  const router = useRouter()
  const [estlogin, setEstLogin] = useState<EstadoLogin>('deslogado')

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginPayload>({ mode: 'onChange' })

  const mutationLogin = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginAdm,
    onSuccess: (data) => {
      setToken(data.token)
      setEstLogin('logado')
      router.push('/gerenciar')
    },
    onError: () => {
      setEstLogin('erro')
    },
  })

  function login(dados: LoginPayload) {
    setEstLogin('carregando')
    mutationLogin.mutate(dados)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {estlogin === 'carregando' ? (
        <Spinner className="pt-15 mx-auto" />
      ) : (
        <div className="block mx-auto bg-(--bg-color2) sm:rounded-2xl py-1.25 px-5 text-(--text-color) sm:w-60 w-full">
          <h2>Área Restrita</h2>
          <form onSubmit={handleSubmit(login)} className="flex flex-col w-full justify-center items-center gap-2">
            <input
              className="input"
              {...register('email', { required: true })}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Usuário"
            />

            <input className="input" {...register('password', { required: true })} type="password" placeholder="Senha" />

            {(errors.email || errors.password) && <p className="plogin">Campo obrigatório</p>}
            {mutationLogin.isError && <p className="plogin">Login ou Senha incorreto!</p>}

            <Button name="Entrar" type="submit" size={15} className="text-[10pt] mt-2" />
          </form>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Delete the old page**

```bash
git rm -q src/paginas/PainalAdm.jsx
```

- [ ] **Step 3: Verify**

```bash
npm run typecheck && npx eslint "src/**/*.{ts,tsx}" && npm run build
```
Expected: exit 0; `/painel` listed as static (`○`).

Smoke: `/painel` shows "Área Restrita"; submitting empty shows "Campo obrigatório"; wrong password shows "Login ou Senha incorreto!"; correct credentials store `localStorage.token`, the Navbar immediately shows "Cadastrar"/"Sair" (no reload needed — proves `useAuthToken`), and the browser navigates to `/gerenciar` (404 until Task 9 — expected).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: /painel admin login page

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 8: Auth guard route group + `/cadastro` (Formulario)

**Files:**
- Create: `src/components/AuthGuard.tsx`, `src/app/(admin)/layout.tsx`, `src/app/(admin)/cadastro/page.tsx`
- Rename+rewrite: `src/components/formulario.jsx` → `src/components/Formulario.tsx`
- Delete: `src/paginas/Prorota.jsx`

**Interfaces:**
- Consumes: `useAuthToken`, `useIsClient`; `criarPet`; `PetFormValues`; `Button`, `Spinner`
- Produces: `AuthGuard({ children })`; route group `(admin)` used by Task 9

- [ ] **Step 1: Create `src/components/AuthGuard.tsx`** (port of `Prorota.jsx`)

```tsx
'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Spinner from './Spinner'
import { useAuthToken, useIsClient } from '@/lib/auth'

/**
 * Client-side guard for /cadastro and /gerenciar (port of Prorota).
 *
 * LIMITATION: the JWT lives in localStorage, which the server (and Next's
 * proxy/middleware) cannot read, so this guard runs only in the browser after
 * hydration. The server-rendered HTML for guarded routes contains just a
 * spinner; protected data is always fetched with the token anyway. Moving the
 * token to an httpOnly cookie would enable a server-side guard — out of scope.
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const isClient = useIsClient()
  const token = useAuthToken()

  useEffect(() => {
    if (isClient && token === null) {
      router.replace('/painel')
    }
  }, [isClient, token, router])

  if (!isClient || token === null) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spinner className="mx-auto" />
      </div>
    )
  }

  return <>{children}</>
}
```

- [ ] **Step 2: Create `src/app/(admin)/layout.tsx`** (replaces `<Route element={<Prorota/>}>` + `<Outlet/>`)

```tsx
import type { ReactNode } from 'react'
import AuthGuard from '@/components/AuthGuard'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
```

- [ ] **Step 3: Rename and write `src/components/Formulario.tsx`** (D7b, D9; inline axios moved to `criarPet`)

```bash
git mv src/components/formulario.jsx src/components/Formulario.tsx
```

```tsx
'use client'

import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PatternFormat } from 'react-number-format'
import Button from './Button'
import Spinner from './Spinner'
import { criarPet } from '@/lib/api'
import type { PetFormValues } from '@/types'

const TEL_PADRAO = '93991185009'

type Estado = 'inicio' | 'load'
type Msg = '' | 'ok' | 'erro'

const VALORES_INICIAIS: PetFormValues = {
  nome: '',
  especie: '',
  porte: '',
  sexo: '',
  descricao: '',
  contato: TEL_PADRAO,
}

function scrollarParaCentro(e: FocusEvent<HTMLElement>) {
  const alvo = e.target
  setTimeout(() => {
    alvo.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

export default function Formulario() {
  const foto = useRef<File | null>(null)
  const inputFile = useRef<HTMLInputElement>(null)

  const [msgfoto, setMsgFoto] = useState<'' | 'erro'>('')
  const [nomearq, setNomeArq] = useState('')
  const [msg, setMsg] = useState<Msg>('')
  const [estado, setEstado] = useState<Estado>('inicio')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PetFormValues>({ mode: 'all', defaultValues: VALORES_INICIAIS })

  function errofotos(): boolean {
    if (!foto.current) {
      setMsgFoto('erro')
      return true
    }
    setMsgFoto('')
    return false
  }

  async function enviar(dados: PetFormValues) {
    if (estado !== 'inicio') return
    if (errofotos()) return

    setEstado('load')

    const formData = new FormData()
    formData.append('nome', dados.nome)
    formData.append('especie', dados.especie)
    formData.append('porte', dados.porte)
    formData.append('sexo', dados.sexo)
    formData.append('descricao', dados.descricao)
    if (foto.current) formData.append('file', foto.current)
    formData.append('contato', dados.contato)

    try {
      await criarPet(formData)
      reset(VALORES_INICIAIS)
      if (inputFile.current) inputFile.current.value = ''
      foto.current = null
      setNomeArq('')
      setMsgFoto('')
      setEstado('inicio')
      setMsg('ok')
    } catch (erro) {
      console.error(erro)
      setEstado('inicio')
      setMsg('erro')
    }
  }

  function uploading(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    foto.current = arquivo
    setNomeArq(arquivo.name)
    setMsgFoto('')
  }

  return (
    <div className="pt-10 relative min-h-screen">
      <form onSubmit={handleSubmit(enviar)} className="flex flex-col max-w-72 px-5 my-10 mx-auto justify-start rounded-2xl bg-(--bg-color2)">
        <fieldset disabled={estado !== 'inicio'} className="flex flex-col">
          <label className="formlabel"> Nome do animal:</label>
          <input className="input" {...register('nome', { required: true })} type="text" placeholder="Nome do animal." onFocus={scrollarParaCentro} />
          {errors.nome && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Carregue uma imagem:</label>

          <Button name="Escolha sua imagem" func={() => inputFile.current?.click()} size={15} />

          <input type="file" ref={inputFile} onChange={uploading} onFocus={scrollarParaCentro} className="hidden" accept="image/*" />

          <p className="pl-2.5 text-[16px] text-(--text-color)">{nomearq}</p>

          {msgfoto === 'erro' && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel">Espécie</label>
          <select className="input" {...register('especie', { required: true })}>
            <option value="">Selecione</option>
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
          </select>
          {errors.especie && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel">Porte</label>
          <select className="input" {...register('porte', { required: true })}>
            <option value="">Selecione</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
          {errors.porte && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel">Sexo</label>
          <select className="input" {...register('sexo', { required: true })}>
            <option value="">Selecione</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>
          {errors.sexo && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Sobre:</label>
          <textarea
            className="textarea max-h-16"
            {...register('descricao', { required: true })}
            rows={2}
            placeholder="Idade, castrado, deficiência e etc."
            onFocus={scrollarParaCentro}
          />
          {errors.descricao && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Contato:</label>
          <Controller
            name="contato"
            control={control}
            rules={{
              required: 'Campo obrigatório',
              validate: (valor) => valor.replace(/\D/g, '').length === 11 || 'O número precisa ter 11 dígitos',
            }}
            render={({ field: { ref, onChange, ...field } }) => (
              <PatternFormat
                {...field}
                getInputRef={ref}
                className="input"
                prefix="+55 "
                format="(##) # ####-####"
                placeholder="(XX) X XXXX-XXXX"
                onFocus={scrollarParaCentro}
                inputMode="numeric"
                onValueChange={(valores) => onChange(valores.value)}
              />
            )}
          />
        </fieldset>

        {errors.contato && <p className="formerro">{errors.contato.message}</p>}

        <br />
        <Button
          name={estado === 'inicio' ? 'Salvar' : 'Salvando...'}
          type="submit"
          size={20}
          disabled={estado !== 'inicio'}
          className={estado === 'inicio' ? '' : 'cursor-default bg-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-600'}
        />
      </form>

      {estado === 'load' && <Spinner className="mx-auto m-4" />}

      {msg === 'ok' && estado !== 'load' && <p className="p-2 text-base text-green-600 font-bold"> Cadastro feito com sucesso!</p>}
      {msg === 'erro' && estado !== 'load' && <p className="pt-10 text-base text-[rgb(128,0,0)] font-bold"> Erro ao cadastrar!</p>}
    </div>
  )
}
```

Behaviour note: the "Escolha sua imagem" `Button` has no `type`, so inside the `<form>` it is a submit button (as today) — clicking it opens the file picker *and* triggers validation messages. Preserved on purpose (straight port); fix later by passing `type="button"` if desired.

- [ ] **Step 4: Create `src/app/(admin)/cadastro/page.tsx`**

```tsx
import Formulario from '@/components/Formulario'

export default function CadastroPage() {
  return <Formulario />
}
```

- [ ] **Step 5: Delete `Prorota`**

```bash
git rm -q src/paginas/Prorota.jsx
```

- [ ] **Step 6: Verify**

```bash
npm run typecheck && npx eslint "src/**/*.{ts,tsx}" && npm run build
```
Expected: exit 0; `/cadastro` listed.

Smoke: logged out, visiting `/cadastro` shows the spinner briefly then lands on `/painel`. Logged in, `/cadastro` shows the form; submitting without an image shows "Campo obrigatório" under the image button; a complete submission shows "Salvando..." → "Cadastro feito com sucesso!" and the new pet appears on `/` (react-query `['itens']` refetches after 30 s stale or on `/gerenciar` invalidation; a hard reload of `/` shows it immediately via the server fetch).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: (admin) route group with client auth guard and /cadastro form

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 9: `/gerenciar` admin management page

**Files:**
- Create: `src/app/(admin)/gerenciar/page.tsx`
- Delete: `src/paginas/gerenciar.jsx`, `src/paginas/` (now empty), `src/hookapi/` (now empty)

**Interfaces:**
- Consumes: `listarPets`, `editarPet`, `deletarPet`; `filterPets`, `EMPTY_FILTERS`; `Item`, `PetFilters`, `Alert`, `Button`, `Spinner`; `Pet`, `PetFilters` type

- [ ] **Step 1: Create `src/app/(admin)/gerenciar/page.tsx`** (D7c, D14; unused `estado`, `adm`, `isLoading`, `error` removed; delete flow split into `pedirDelete`/`confirmarDelete`)

```tsx
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Item from '@/components/Item'
import PetFilters from '@/components/PetFilters'
import Spinner from '@/components/Spinner'
import { deletarPet, editarPet, listarPets } from '@/lib/api'
import { EMPTY_FILTERS, filterPets } from '@/lib/filterPets'
import type { Pet, PetFilters as PetFiltersValue } from '@/types'

interface AlvoDelete {
  id: Pet['id']
  nome: string
}

export default function GerenciarPage() {
  const queryClient = useQueryClient()

  const [poup, setPoup] = useState(false)
  const [alvoDelete, setAlvoDelete] = useState<AlvoDelete | null>(null)
  const [load, setLoad] = useState(false)
  const [filters, setFilters] = useState<PetFiltersValue>(EMPTY_FILTERS)

  const { data } = useQuery({ queryKey: ['itens'], queryFn: listarPets })

  const mutationUpdate = useMutation({
    mutationFn: ({ id, dados }: { id: Pet['id']; dados: FormData }) => editarPet(id, dados),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['itens'] })
      setLoad(false)
    },
  })

  const mutationDelete = useMutation({
    mutationFn: (id: Pet['id']) => deletarPet(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itens'] }),
  })

  function atualizar(id: Pet['id'], dados: FormData): Promise<Pet> {
    return mutationUpdate.mutateAsync({ id, dados })
  }

  function pedirDelete(id: Pet['id'], nome: string) {
    setAlvoDelete({ id, nome: nome.length > 35 ? `${nome.slice(0, 35)}...` : nome })
    setPoup(true)
  }

  function confirmarDelete() {
    if (alvoDelete) mutationDelete.mutate(alvoDelete.id)
    setPoup(false)
  }

  const petsFiltrados = filterPets(data ?? [], filters)

  return (
    <div className="flex flex-col justify-start items-center">
      <a
        href="https://docs.google.com/spreadsheets/d/1mVn88CCj545VMwyB_zKJeR9mQrwkwHTB9OgM_MO7cm8/edit?usp=sharing"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button name={<p className="flex whitespace-nowrap items-center justify-center gap-1"> Contato de Doadores</p>} size={15} />
      </a>

      {load ? (
        <Spinner className="m-16 mx-auto" />
      ) : (
        <>
          <Alert
            titulo="AVISO"
            descricao={`Tem certeza que deseja excluir o "${alvoDelete?.nome ?? ''}"?`}
            bty="Sim"
            fbty={confirmarDelete}
            btn="Não"
            fbtn={() => setPoup(false)}
            estado={poup}
          />

          <section className="flex flex-wrap m-4 gap-2 justify-center items-start">
            <div className="flex flex-col p-4 flex-wrap gap-2 w-fit items-center justify-center bg-(--bg-color2)">
              <p className="text-(--text-color)">Filtrar</p>
              <PetFilters filters={filters} onChange={setFilters} />
            </div>
          </section>

          <div className="items-start flex flex-wrap justify-center gap-2 mb-4">
            {petsFiltrados.map((pet) => (
              <Item
                key={pet.id}
                pet={pet}
                admin={true}
                onDelete={pedirDelete}
                onUpdate={atualizar}
                onStart={() => setLoad(true)}
                onEnd={() => setLoad(false)}
              />
            ))}

            {petsFiltrados.length <= 0 && <p className="text-[18pt] text-(--text-color)">Nenhum animal encontrado.</p>}
          </div>
        </>
      )}
    </div>
  )
}
```

Note: the original `gerenciar.jsx` showed "Nenhum animal encontrado." also while the initial query was still loading (no loading state was rendered). Preserved.

- [ ] **Step 2: Delete the old page and empty dirs**

```bash
git rm -q src/paginas/gerenciar.jsx
rmdir src/paginas src/hookapi 2>/dev/null; true
ls src   # expect: app components img lib types.ts
```

- [ ] **Step 3: Verify — full lint now applies to the whole repo**

```bash
npm run typecheck && npm run lint && npm run build
```
Expected: all exit 0 with zero errors (warnings acceptable but list them in the task report). `find src -name "*.jsx" -o -name "*.js"` → no output.

Smoke: logged in, `/gerenciar` lists all pets with Editar/Apagar. Filter works. Apagar → Alert "Tem certeza que deseja excluir o "<nome>"?" → Sim removes it and the list refreshes. Editar opens the inline form pre-filled (contato shows as `+55 (XX) X XXXX-XXXX`); change the name, Salvar → spinner → list refreshes with the new name. Navbar "Sair" → Alert → Sim → redirected to `/painel`, menu loses Cadastrar/Sair.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: /gerenciar admin page on app router with react-query v5 invalidation

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 10: README + deployment notes (Vercel)

**Files:**
- Modify: `README.md`

**Interfaces:** none (docs only). Vercel-side actions are a checklist for the human (no CLI required).

- [ ] **Step 1: Edit `README.md`** — apply these content-based replacements (do not rely on line numbers):

1. In "## 🛠 Tecnologias Utilizadas → ### Front-End": replace the line `- React Router DOM` with `- Next.js 16 (App Router, React Server Components)` and delete the line `- Vite`. Add `- TypeScript` after `- React 19`.
2. Replace the whole fenced code block under the "Estrutura" heading (the block containing `├── ContextNavbar.jsx`) with:
   ```text
   src/
   ├── app/
   │   ├── layout.tsx           # html, fonts, metadata, Providers, Navbar, Footer
   │   ├── page.tsx             # Home (Server Component; lista de pets via streaming)
   │   ├── loading.tsx
   │   ├── painel/page.tsx      # Login admin
   │   └── (admin)/             # Rotas protegidas (AuthGuard)
   │       ├── layout.tsx
   │       ├── cadastro/page.tsx
   │       └── gerenciar/page.tsx
   ├── components/              # Item, Navbar, Formulario, PetFilters, ...
   ├── lib/                     # api.ts (axios), auth.ts (JWT em localStorage), pets-server.ts
   ├── img/
   └── types.ts                 # Pet, PetFormValues, ...
   ```
3. Replace both occurrences of `VITE_URLAPI=` with `NEXT_PUBLIC_URLAPI=` (the `https://sua-api.com` and `http://localhost:3000` examples).
4. In "Endpoints utilizados" add the lines `POST   /pets` and `GET    /usuarios` (token check) so the list matches `src/lib/api.ts`.
5. Replace `Crie o arquivo \`.env\`:` with `Crie o arquivo \`.env.local\` (veja \`.env.example\`):`.
6. Under the `npm run dev` instructions add a line: `Build de produção: \`npm run build && npm run start\`.`

- [ ] **Step 2: Vercel checklist (human / dashboard; record what was done in the task report)**

1. Project → Settings → General → **Framework Preset**: Vercel auto-detects Next.js when `next` is in `dependencies`. If the preset was manually set to "Vite", change it to "Next.js". Clear any **Build Command** / **Output Directory** overrides (Vite's `dist` override would break the deploy). Root Directory stays `./`.
2. Settings → Environment Variables: add `NEXT_PUBLIC_URLAPI` with the same value as `VITE_URLAPI` for **Production, Preview and Development**. It is inlined at build time, so it must exist before the first Next build. Keep `VITE_URLAPI` until `feat/nextjs` is merged, then delete it.
3. Node.js version: Vercel default (22.x) satisfies Next 16 (`>=20.9`). No change.
4. Push the branch; Vercel builds a Preview deployment. Confirm the preview URL serves `/`, `/painel`, `/cadastro`, `/gerenciar` (the last two redirect to `/painel` when logged out) — the old `vercel.json` rewrite is gone and no longer needed.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README for next.js app router and NEXT_PUBLIC_URLAPI

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01F41qFJsc6iCMAcJQbSeqtT"
```

---

### Task 11: Final verification, smoke test and push

**Files:** none new (fix-ups only if verification finds something).

- [ ] **Step 1: Clean build from scratch**

```bash
rm -rf .next
npm run typecheck   # exit 0, no output
npm run lint        # exit 0, zero errors
npm run build       # exit 0
```
Record every lint warning in the report (expected: none or only `@next/next/no-img-element` where an eslint-disable comment was missed — fix those).

Confirm no leftovers:
```bash
git ls-files | grep -E "\.jsx$|\.js$|vite|vercel\.json|index\.html|estrutura" ; echo "exit $?"   # expect exit 1 (no matches)
grep -rn "import.meta.env\|VITE_URLAPI\|react-router" src README.md ; echo "exit $?"          # expect exit 1
```

- [ ] **Step 2: Production-mode smoke test** (`.env.local` must point at the real API)

```bash
npm run build && npm run start
```
Open `http://localhost:3000` and walk this checklist; every line must pass:

| # | Route / action | Expected |
|---|---|---|
| 1 | `/` first paint | Header, PIX/Voluntarie/Associe/Ração cards, hero, about render immediately; "Procurando seu novo melhor amigo!" spinner while list streams; then pet cards. `view-source:` contains pet names (SSR). |
| 2 | `/` search + filters | Typing a name filters live; Espécie/Sexo/Porte selects filter; "Nenhum animal encontrado." when nothing matches. |
| 3 | `/` card | Click card → expands with description and green "Contato" button → `wa.me/55<11 digits>?text=...` opens in new tab. Click photo → zoom popup; close icon works. |
| 4 | `/` donation | PIX QR (`QRPIX.jpeg`) renders in "PIX SOLIDÁRIO" with CNPJ `19.552.047/0001-43`; "Quero Doar" opens the Google Form; "Entrar no grupo" links open WhatsApp. Hero "Doar" scrolls to `#doar`, "Adotar" to `#adotar`. |
| 5 | `/painel` | Empty submit → "Campo obrigatório"; bad creds → "Login ou Senha incorreto!"; good creds → redirected to `/gerenciar`, Navbar shows Cadastrar/Sair without reload. |
| 6 | Guard | Logged out: `/cadastro` and `/gerenciar` → spinner → `/painel`. Navbar "Gerenciar" when logged out → `/painel`. With a tampered token (`localStorage.token='x'`) Navbar "Gerenciar" → token cleared, `/painel`. |
| 7 | `/cadastro` create | Missing image → "Campo obrigatório"; phone with ≠11 digits → "O número precisa ter 11 dígitos"; valid submit → "Salvando..." → "Cadastro feito com sucesso!"; hard-reload `/` shows the new pet. |
| 8 | `/gerenciar` edit | Editar → form pre-filled; change name → Salvar → spinner → updated name in list. |
| 9 | `/gerenciar` delete | Apagar → Alert with truncated name (>35 chars gets "...") → Sim → pet gone; Não → nothing happens. |
| 10 | Logout | Sair → Alert → Sim → `/painel`, Cadastrar/Sair gone. |
| 11 | Navigation | Navbar "Início" (`next/link`) → `/` without full reload (check devtools Network: no document request); ScrollToTop: scroll down on `/`, go to `/painel`, page is at top. Mobile width: hamburger opens/closes menu. |
| 12 | Console | No hydration warnings / errors in the browser console on any route (both logged-in and logged-out). |
| 13 | 404 | `/nao-existe` → Next default 404 (previously the SPA rewrite served the home shell). |

- [ ] **Step 3: Push and open PR**

```bash
git push -u origin feat/nextjs
gh pr create --base main --head feat/nextjs --title "feat: migrate to Next.js 16 App Router + TypeScript" --body "$(cat <<'EOF'
## Summary
- In-place migration from Vite + react-router SPA to Next.js 16 App Router (Turbopack), full TypeScript.
- Home (`/`) is a Server Component: pets fetched server-side (`no-store`, streamed via Suspense) and hydrated into react-query; admin pages stay client-side.
- Auth guard for `/cadastro` and `/gerenciar` via `(admin)` route group (client-side, localStorage JWT).
- Removed dead code (`pagebusca`, `pagecadastro`, `/busca` search, unused deps/images), fixed 3 latent bugs (see plan D7).
- `vercel.json` SPA rewrite removed; **set `NEXT_PUBLIC_URLAPI` in Vercel (Production/Preview/Development) before merging.**

## Test plan
See `docs/superpowers/plans/2026-09-03-nextjs-migration.md` Task 11 smoke checklist (all 13 items executed locally against the real API).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Risks, unknowns and ASSUMPTIONS (executor must verify)

1. **ASSUMPTION — API `id` field**: `Pet.id: string`. `pageprincipal.jsx`/`gerenciar.jsx` use `pet.id`; the dead `pagebusca.jsx` used `_id` (Mongo). Check one real `GET /pets` response. If it returns `_id` instead of `id`, the current app would already be broken (keys/URLs undefined) — so `id` is almost certainly right; if it is numeric, change the type to `number`.
2. **ASSUMPTION — pet photo host**: unknown (README screenshots are on Cloudinary). Photos stay `<img>` (D6); nothing to configure. If the team later wants `next/image`, add `images.remotePatterns` in `next.config.ts`.
3. **ASSUMPTION — backend accepts digits-only `contato`** (D9). Verify by creating one pet and viewing its WhatsApp link.
4. **Backend cold start**: the UI text says loading "pode demorar alguns segundos". The server fetch times out at 10 s and hands over to the client (react-query) — home shell is never blocked. If the API is consistently slower than 10 s, raise the timeout in `pets-server.ts` or the shell will always show the client-side spinner path (still functional).
5. **`NEXT_PUBLIC_URLAPI` is inlined at build time**: a missing var in Vercel at build = client calls `undefined/pets`. Task 10 step 2 must happen before the first Vercel build of this branch.
6. **TypeScript 7 / ESLint 10**: npm `latest` for both is a new major (TS 7 is the Go-native compiler). Pinned to `typescript@^5.9` and `eslint@^9` (Next's own check requires TS ≥5.1; `eslint-config-next` peer is `eslint >=9`). Do not "upgrade to latest" during this migration.
7. **`react-hooks` v7 compiler rules** (`set-state-in-effect`, `refs`, `immutability`, `purity` are `error`): the plan's code avoids setState-in-effect by design (D4). If lint flags something unexpected in ported code, fix the code — do not disable the rule.
8. **React Compiler + react-hook-form**: the app already shipped compiled by the same compiler under Vite, so no new risk is expected. If edit/create forms stop showing validation errors, the fallback is `reactCompiler: { compilationMode: 'annotation' }` in `next.config.ts` (flag it in the report).
9. **Fonts need network at build**: `next/font/google` downloads WDXL Lubrifont at build time (fine on Vercel; a sandboxed offline build will fail at this step).
10. **Case-insensitive filesystem renames** (`button.jsx` → `Button.tsx`): extension changes make these non-case-only renames, so `git mv` works on macOS. Never rename `X.tsx` → `x.tsx` in one step.
11. **`tsconfig.json` mutation by Next**: first `next build`/`next dev` may add entries to `include`. Commit them; do not fight it.
12. **Guard is client-side only** (documented in `AuthGuard.tsx`). Next 16 renamed `middleware.ts` → `proxy.ts`; neither can read `localStorage`, so no proxy is added. A cookie-based token would allow a server guard later.
13. **Vercel project settings**: if someone previously set "Framework Preset: Vite"/"Output Directory: dist" manually, the deploy fails until reset (Task 10 step 2). Vercel auto-detects Next otherwise.
14. **Dynamic `/`**: with `no-store` the home is rendered per request (`ƒ` in build output). That is intended (D15). If traffic ever matters, switch `fetchPetsServer` to `next: { revalidate: 60 }` and accept ≤60 s staleness on first paint (react-query still refreshes client-side).
15. **`gerenciar` initial state**: as before, "Nenhum animal encontrado." appears while the first client fetch is in flight (unless the cache was warmed by visiting `/`). Preserved; easy follow-up to add `isPending` handling.

## Self-review

- **Spec coverage**: branch ✔ (T1), dependency swap + scripts ✔ (T1), tsconfig/next.config/postcss/eslint/next-env/.gitignore ✔ (T1–T2, next-env generated), layout from index.html+main.jsx with metadata/font/CSS/Providers ✔ (T4), route mapping + loading.tsx + React.lazy removal ✔ (T4, T6–T9), ScrollToTop with usePathname ✔ (T4), Prorota → client guard with stated limitation ✔ (T8), react-router API removals ✔ (table + T4/T7/T8), "use client" audit ✔ (table), image rule ✔ (D6, Spinner, CardAside, Hero, MFooter, Navbar), RSC home with fetch/cache justification and react-query kept ✔ (T6, D15), TypeScript conversion with `types.ts`/`lib/api.ts`/typed auth store ✔ (T3), React Compiler decision ✔ (D5, T2), deployment (vercel.json, preset, env in 3 environments) ✔ (T2, T10), final verification with build/lint/smoke checklist ✔ (T11), dead code (`pagebusca`/`pagecadastro`) explicitly classified ✔ (D1), risks section ✔.
- **Placeholder scan**: no "TBD/TODO/similar to Task N"; every rewritten file is given in full.
- **Type consistency**: `Pet['id']` used uniformly in `api.ts`, `Item.tsx`, `gerenciar/page.tsx`; `PetFilters` value type imported as `PetFiltersValue` wherever the `PetFilters` component is also imported; `Button` prop is `disabled` everywhere (`Formulario`), `func` for onClick; `Item` callbacks `onDelete(id, nome)`, `onUpdate(id, FormData): Promise<unknown>` match `pedirDelete`/`atualizar` in gerenciar; `Spinner({ className })`; `useAuthToken()`/`useIsClient()` names match between `auth.ts`, `Navbar.tsx`, `AuthGuard.tsx`; `fetchPetsServer` matches `page.tsx`.
