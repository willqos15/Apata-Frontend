# API Routes Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Express + Prisma + MongoDB + Cloudinary backend (14 endpoints, 436 LOC) into Next.js 16 App Router Route Handlers inside this repo, rewire the frontend to call them same-origin, add an httpOnly-cookie auth transport, and replace the client-only `AuthGuard` with a real server-side guard, so the Express backend can be retired.

**Architecture:** Two resource trees under `src/app/api/` (`pets/`, `usuarios/`), eight `route.ts` files exporting one function per HTTP verb, backed by six small server-only modules in `src/server/` (Prisma singleton, JWT, auth extraction + cookie helpers, Cloudinary, body parsing, shared pet query). The home page's server component reads the database directly through the same shared query instead of HTTP-fetching its own route. A `src/proxy.ts` (Next 16's replacement for middleware, Node runtime) verifies the auth cookie for `/cadastro` and `/gerenciar` and redirects to `/painel` otherwise.

**Tech Stack:** Next.js 16.3.4 (App Router, Route Handlers, `proxy.ts`), React 19.2, TypeScript 5.9 strict, `@prisma/client` 6.19.3 + `prisma` 6.19.3 (`mongodb` provider, `prisma-client-js` generator), `bcryptjs` 3.0.3, `jsonwebtoken` 9.0.3 + `@types/jsonwebtoken` 9.0.10, `cloudinary` 2.11.0, axios, `@tanstack/react-query` 5.

**Spec:** There is no separate spec file. The brief that produced this plan is reproduced in the "Decisions already made" section below and is binding. Repo-wide constraints inherited from the frontend migration are recorded in `docs/superpowers/reports/2026-09-03-nextjs-migration-ledger.md`. The backend being ported is the clone at `$SCRATCH/Apata-Backend/` (see "Paths" below); its controllers are the behavioural reference and are quoted where a line matters.

## Paths used throughout

- `REPO=/Users/rodrigoandradebccgmail.com/Dev/Study/Apata-Frontend`
- `SCRATCH=` the executing session's scratchpad directory (the one listed in the session's system prompt). The plan was written from `/private/tmp/claude-501/-Users-rodrigoandradebccgmail-com-Dev-Study-Apata-Frontend/e86b5012-0c83-48dc-8912-c53e83c17591/scratchpad`, which holds the backend clone at `Apata-Backend/`. If the executing session has a different scratchpad, re-clone the backend there first: `git clone https://github.com/willqos15/Apata-Backend "$SCRATCH/Apata-Backend"` (ASSUMPTION: that is the backend remote; the plan only needs its `src/` and `prisma/schema.prisma`, both quoted below, so the clone is optional).

Export both before running any command block: `export REPO=/Users/rodrigoandradebccgmail.com/Dev/Study/Apata-Frontend SCRATCH=<your scratchpad>`.

## Global Constraints

- Branch `feat/api-routes`, created from `feat/nextjs` (HEAD `32440e2`). `main` is not touched.
- `tsc --noEmit` exit 0, `eslint .` exit 0 with zero errors and zero warnings, `next build` exit 0 — after every task.
- `strict: true`; no `any` (explicit or implicit); no `@ts-expect-error` / `@ts-ignore`; no new `eslint-disable`. The only sanctioned disables are the two `@next/next/no-img-element` lines in `src/components/Item.tsx`.
- No explanatory comments in `src`: `grep -rn -- '//' src | grep -v 'https\?://' | grep -v eslint-disable` must keep returning nothing. (`prisma/schema.prisma`, `README.md`, `.env.example` are outside `src` and may carry comments; the schema below is written without any.)
- Portuguese stays: UI text, API field names (`nome`, `especie`, `porte`, `sexo`, `contato`, `foto`, `descricao`), data values (`'cachorro'`, `'gato'`, `'macho'`, `'femea'`, `'pequeno'`, `'medio'`, `'grande'`), routes `painel` / `cadastro` / `gerenciar`, and every response message string from the Express controllers, byte for byte.
- Commits: plain conventional commits. **No** `Co-Authored-By`, **no** `Claude-Session` trailer.
- Node runtime only. Never `export const runtime = 'edge'`. Fluid Compute is the default on Vercel and is correct.
- No test runner is added (justification in "Verification strategy").
- Dependency versions are pinned exactly as listed in Tech Stack.

## Decisions already made (binding, do not re-litigate)

1. **All 14 endpoints are ported one for one.** Two resource directories only (`pets/`, `usuarios/`); the three session endpoints live under `usuarios/`.
2. **Behaviour is ported identically, including its security flaws.** The known flaws (unauthenticated `GET /usuarios` returning bcrypt hashes; unauthenticated user create/update/delete; `PUT`/`DELETE /pets/:id` authenticating but never checking `ownerId`; mass assignment via `dataUpdate = {...req.body}`) are reproduced faithfully and listed in the Risks section. A separate security report is delivered outside this plan. Where a line would be trivially safer written differently, it is noted under Risks, not changed.
3. **Express is retired as soon as this ships**, no parallel run. The Vercel Preview deployment against the real Atlas/Cloudinary is the substitute for a parallel run; the "Before the switch" checklist in Task 9 is the gate.
4. **Auth transport:** `POST /api/usuarios/login` additionally sets an httpOnly cookie `apata_token`; the auth check accepts the cookie first and falls back to `Authorization: Bearer <token>` exactly as today. `POST /api/usuarios/logout` clears the cookie and `POST /api/usuarios/atualizatoken` refreshes it (same rule applied to the two other endpoints that issue or end a session; both currently have zero frontend callers). This is the only deliberate behaviour addition. It enables the server-side guard in Task 7.

## Endpoint mapping (old -> new)

Every path gains the `/api` prefix; the three session endpoints additionally move under `usuarios/`. Request shape, response shape, status codes and side effects stay identical except for the cookie addition in decision 4.

| # | Express (declared order) | Controller | New route file | New URL | Auth | Body |
|---|---|---|---|---|---|---|
| 1 | `GET /pets` | `PetController.listar` | `src/app/api/pets/route.ts` `GET` | `GET /api/pets` | no | - |
| 2 | `GET /pets/busca` | `PetController.listarnome` | `src/app/api/pets/busca/route.ts` `GET` | `GET /api/pets/busca?nome=` | no | - |
| 3 | `GET /pets/:id` | `PetController.listarId` | `src/app/api/pets/[id]/route.ts` `GET` | `GET /api/pets/:id` | no | - |
| 4 | `POST /pets` | `PetController.criar` | `src/app/api/pets/route.ts` `POST` | `POST /api/pets` | yes | multipart (`file` part) or JSON |
| 5 | `PUT /pets/:id` | `PetController.atualizar` | `src/app/api/pets/[id]/route.ts` `PUT` | `PUT /api/pets/:id` | yes | multipart (`file` part) or JSON |
| 6 | `DELETE /pets/:id` | `PetController.deletar` | `src/app/api/pets/[id]/route.ts` `DELETE` | `DELETE /api/pets/:id` | yes | - |
| 7 | `POST /usuarios` | `UserController.criar` | `src/app/api/usuarios/route.ts` `POST` | `POST /api/usuarios` | no | JSON |
| 8 | `POST /login` | `UserController.login` | `src/app/api/usuarios/login/route.ts` `POST` | `POST /api/usuarios/login` | no | JSON |
| 9 | `GET /usuarios` | `UserController.listar` | `src/app/api/usuarios/route.ts` `GET` | `GET /api/usuarios` | no | - |
| 10 | `GET /usuarios/:id` | `UserController.listarId` | `src/app/api/usuarios/[id]/route.ts` `GET` | `GET /api/usuarios/:id` | no | - |
| 11 | `PUT /usuarios/:id` | `UserController.atualizar` | `src/app/api/usuarios/[id]/route.ts` `PUT` | `PUT /api/usuarios/:id` | no | JSON |
| 12 | `DELETE /usuarios/:id` | `UserController.deletar` | `src/app/api/usuarios/[id]/route.ts` `DELETE` | `DELETE /api/usuarios/:id` | no | - |
| 13 | `POST /logout` | `UserController.logout` | `src/app/api/usuarios/logout/route.ts` `POST` | `POST /api/usuarios/logout` | no | - |
| 14 | `POST /atualizatoken` | `UserController.renovarToken` | `src/app/api/usuarios/atualizatoken/route.ts` `POST` | `POST /api/usuarios/atualizatoken` | yes | - |

Frontend call sites today (verified with `grep -rn 'logout\|atualizatoken\|/busca\|usuarios' src`): `src/lib/api.ts` calls `/pets` (GET/POST), `/pets/:id` (PUT/DELETE), `/login`, `/usuarios` (GET, as `verifyToken`). Nothing calls `/logout`, `/atualizatoken`, `/pets/busca`, `/pets/:id` GET, or any `/usuarios/:id` route. Task 6 rewires every call site against this table.

## Route precedence (read before reviewing the tree)

- **`/pets/busca` vs `/pets/[id]`.** In Express this worked only because `petRoutes.js` declares `router.get('/pets/busca')` before `router.get('/pets/:id')` and matching is by declaration order. The App Router has no declaration order: a static segment always takes precedence over a sibling dynamic segment, so `src/app/api/pets/busca/route.ts` wins over `src/app/api/pets/[id]/route.ts`. Same resulting behaviour, different mechanism. Not a bug. Task 5 and Task 9 prove it: `GET /api/pets/busca?nome=x` must return the search handler's array, never `listarId`'s 404/500 with `id="busca"`.
- **`/usuarios/login`, `/usuarios/logout`, `/usuarios/atualizatoken` vs `/usuarios/[id]`.** Same rule: the three static segments win. One visible difference: those three files export only `POST`, so `GET /api/usuarios/login` returns Next's automatic `405 Method Not Allowed`, whereas Express would have routed `GET /usuarios/login` into `listarId` with `id="login"` (a 500 from a malformed ObjectId). No caller depends on that; recorded under Risks as ASSUMPTION.
- **`src/app/(admin)/` route group.** The admin pages already live in a route group. The new `src/app/api/` tree sits alongside it under `src/app/` and does not interact with it: route groups add no URL segment, so `(admin)/gerenciar` serves `/gerenciar` and `api/pets` serves `/api/pets`; no path conflict is possible. Task 7 deletes `(admin)/layout.tsx` (its only job was mounting `AuthGuard`); the group directory stays.

## Documentation confirmed (Context7, 2026-09-03)

- Next.js `v16.2.9` docs (`/vercel/next.js/v16.2.9`): Route Handler `params` is a `Promise` and must be awaited (`docs/01-app/02-guides/upgrading/version-15.mdx`); `RouteContext<'/route'>` helper exists but is only available after `next typegen`/`next build` generate `.next/types`, so this plan types `params` explicitly as `Promise<{ id: string }>` so `tsc --noEmit` passes on a clean checkout. `proxy.ts` replaces `middleware.ts`, must export `proxy` (or default), "defaults to using the Node.js runtime" and the `runtime` option is not available in it (`docs/01-app/03-api-reference/03-file-conventions/proxy.mdx`). `NextResponse.cookies.set({ name, value, httpOnly, path, ... })` and `request.cookies.get(name)?.value` (`next-response.mdx`, `proxy.mdx`). `request.formData()` is native in Node-runtime Route Handlers (`packages/next/src/server/route-modules/app-route/module.ts`). `serverExternalPackages`: "Next.js includes a short list of popular packages that are automatically opted out from bundling ... such as `@prisma/client` and `sharp`" — so no `next.config.ts` change is required for Prisma; `bcrypt` (native) is avoided entirely by using `bcryptjs`.
- Prisma docs (`/prisma/web`): global-singleton pattern for Next.js (`orm/.../troubleshooting/nextjs.mdx`); MongoDB connector requires a replica set, local URL `mongodb://localhost:27017/mydb?replicaSet=rs0&directConnection=true` (`quickstart/mongodb.mdx`); `isSet` filter on optional fields with `OR: [{ f: null }, { f: { isSet: false } }]`; Vercel caches dependencies so `"postinstall": "prisma generate"` is required (`guides/postgres/vercel.mdx`). Verified locally: `prisma@6.19.3` `generate` succeeds with `DATABASE_URL` unset and without any `prisma.config.ts`; the generated client exposes `Prisma.PetWhereInput`, `Prisma.PetUpdateManyMutationInput`, `Prisma.BatchPayload`.
- bcryptjs 3.0.3 (`/dcodeio/bcrypt.js`): pure JS, zero deps, ships its own `index.d.ts` (ESM default export); its test suite asserts `compare` on `$2a$`, `$2b$` and `$2y$` hashes. Verified locally: `compareSync` accepts a `$2b$12$` hash. The Express backend used `bcrypt@6` with `genSalt(12)`, which produces `$2b$12$` — existing stored hashes keep verifying.
- jsonwebtoken 9.0.3 + `@types/jsonwebtoken` 9.0.10: `sign(payload, secret, { expiresIn: '7d' })`, `verify()` returns `string | JwtPayload` where `JwtPayload` has an `[key: string]: any` index signature — the plan narrows `decoded.id` with `typeof` so no `any` leaks.
- cloudinary 2.11.0 (`/cloudinary/cloudinary_npm` + local source): `uploader.upload_stream(options, cb)` returns a writable stream, `UploadApiResponse` has `secure_url` and `public_id`; `uploader.destroy(public_id)` returns a Promise. `lib/utils/index.js:1061` reads the `upload_prefix` config option as the API base URL (`ConfigOptions` accepts it through its `[futureKey: string]: any` index signature). The SDK always uses `https`, so the local stub must be an HTTPS server. Proved end to end: upload + destroy against a self-signed local stub with `NODE_TLS_REJECT_UNAUTHORIZED=0`.
- Vercel Functions skill: Node.js cold starts with DB connections 800ms–2.5s; Fluid Compute reuses one instance for many concurrent invocations (one Prisma client per instance); request bodies up to 100 MB.

## Verification strategy (no credentials)

The developer has no MongoDB URI, no Cloudinary credentials and no JWT secret. Everything is verified against a local stand-in built in Task 3:

- **MongoDB**: `mongo:7` in Docker started as a single-node replica set `rs0` (Prisma's `mongodb` provider requires a replica set). Homebrew fallback given.
- **Cloudinary**: a 40-line self-signed HTTPS stub that answers `/v1_1/<cloud>/image/upload` and `/v1_1/<cloud>/image/destroy`, logging each call in order. The app points at it through the server-only env var `CLOUDINARY_UPLOAD_PREFIX` (read by `src/server/cloudinary.ts`; unset in production, so production hits the real API). Next is started with `NODE_TLS_REJECT_UNAUTHORIZED=0` locally only.
- **JWT**: any local secret in `.env.local`.
- **Seed user**: a `$2b$12$` hash generated by the *native* `bcrypt` package in a scratch project and inserted with `mongosh`, so login proves the bcrypt -> bcryptjs compatibility on a real native hash rather than a bcryptjs-made one.
- **Flows**: curl against `next dev` for the 14 endpoints (dev mode so the cookie is not `Secure` and curl's cookie jar works over http), then real Chrome against `next build && next start` for every frontend flow.

**No test runner is added.** The port is 436 LOC of thin controller code whose behaviour is almost entirely Prisma + Cloudinary + JWT side effects. A Vitest suite would either mock Prisma (proving nothing about the ported queries, e.g. `isSet`) or need the same local Mongo/stub infrastructure the curl checklist already uses. The curl script and browser checklist run against the real Next app with a real MongoDB, which is the evidence that matters for a retire-Express switch. Verification of record is `tsc`, `eslint`, `next build`, the curl checklist and the Chrome checklist.

## File structure

```
prisma/
└── schema.prisma                         copied from the backend, comments stripped

src/server/                               server-only modules (never imported from client components)
├── prisma.ts                             PrismaClient global singleton
├── jwt.ts                                signToken / verifyToken (jsonwebtoken, JWT_SECRET)
├── auth.ts                               AUTH_COOKIE, authenticate(request), setAuthCookie, clearAuthCookie
├── cloudinary.ts                         configured v2 client, uploadPetPhoto(File), destroyPhoto(publicId)
├── body.ts                               readJsonBody(request), readPetBody(request) (multipart or JSON)
└── pets.ts                               ACTIVE_PETS_WHERE, findActivePets()

src/app/api/
├── pets/
│   ├── route.ts                          GET listar, POST criar
│   ├── busca/route.ts                    GET listarnome
│   └── [id]/route.ts                     GET listarId, PUT atualizar, DELETE deletar
└── usuarios/
    ├── route.ts                          GET listar, POST criar
    ├── [id]/route.ts                     GET listarId, PUT atualizar, DELETE deletar
    ├── login/route.ts                    POST login (+ sets cookie)
    ├── logout/route.ts                   POST logout (+ clears cookie)
    └── atualizatoken/route.ts            POST renovarToken (+ refreshes cookie)

src/proxy.ts                              server-side guard for /cadastro and /gerenciar

Modified: package.json, .env.example, src/types.ts, src/lib/api.ts, src/lib/pets-server.ts,
          src/lib/auth.ts, src/components/Navbar.tsx, src/app/(admin)/gerenciar/page.tsx, README.md
Deleted:  src/components/AuthGuard.tsx, src/app/(admin)/layout.tsx
Untouched: next.config.ts (no serverExternalPackages needed), tsconfig.json, eslint.config.mjs, .gitignore
```

---

### Task 1: Branch, dependencies, Prisma schema, generate

**Files:**
- Create: `prisma/schema.prisma`
- Modify: `package.json` (dependencies, devDependencies, `postinstall` script)
- Modify: `.env.example`
- Modify (untracked, not committed): `.env.local`

**Interfaces:**
- Produces: generated `@prisma/client` with models `User` and `Pet`, types `Prisma.PetWhereInput`, `Prisma.PetUpdateManyMutationInput`, `Prisma.BatchPayload`, `Pet`, `User`; packages `bcryptjs`, `jsonwebtoken`, `cloudinary` installed and typed.

- [ ] **Step 1: Create the branch**

```bash
cd "$REPO" && git checkout feat/nextjs && git status --short && git checkout -b feat/api-routes
```
Expected: `git status --short` prints nothing; now on `feat/api-routes`.

- [ ] **Step 2: Install pinned dependencies**

```bash
cd "$REPO" && npm install --save-exact @prisma/client@6.19.3 bcryptjs@3.0.3 cloudinary@2.11.0 jsonwebtoken@9.0.3 && npm install --save-exact --save-dev prisma@6.19.3 @types/jsonwebtoken@9.0.10
```
Expected: exit 0; `package.json` shows the five new entries without `^`.

- [ ] **Step 3: Write the Prisma schema**

`prisma/schema.prisma` (full content — the backend schema with its comments removed, models unchanged):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id       String  @id @default(auto()) @map("_id") @db.ObjectId
  email    String  @unique
  name     String?
  password String

  pets Pet[]
}

model Pet {
  id            String  @id @default(auto()) @map("_id") @db.ObjectId
  foto          String?
  public_idfoto String?
  nome          String
  especie       String
  porte         String
  sexo          String
  descricao     String
  contato       String?

  adotado  Boolean @default(false)
  aprovado Boolean @default(true)
  tutelado Boolean @default(true)

  deleted_at DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner   User   @relation(fields: [ownerId], references: [id])
  ownerId String @db.ObjectId
}
```

The collection names stay `User` and `Pet` (Prisma's default is the model name), so the port reads the same collections the Express app writes. No `prisma.config.ts` is created: Prisma 6.19 does not need one and the backend's copy only restated defaults.

- [ ] **Step 4: Add the postinstall script**

Edit `package.json` `scripts` to exactly:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "postinstall": "prisma generate"
  },
```

`postinstall` is what makes Vercel regenerate the client despite its dependency cache (Prisma docs, "Vercel build dependency caching"). `prisma generate` does not read `DATABASE_URL`, so it is safe on any machine.

- [ ] **Step 5: Generate the client**

```bash
cd "$REPO" && npx prisma generate
```
Expected: `✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client`. `.gitignore` needs no new entry: with the default `prisma-client-js` output the client lives under `node_modules/` (already ignored). `.env` and `.env*.local` are already ignored (lines 11 and 34).

```bash
cd "$REPO" && git status --short
```
Expected: only `package.json`, `package-lock.json`, `prisma/schema.prisma`, `.env.example` (after Step 6). Nothing generated is tracked.

- [ ] **Step 6: Rewrite `.env.example`**

Full content:

```env
# MongoDB connection string. Prisma's mongodb provider requires a replica set.
# Local (docker, see README): mongodb://localhost:27017/apata?replicaSet=rs0&directConnection=true
# Atlas:                      mongodb+srv://user:pass@cluster.mongodb.net/apata
DATABASE_URL="mongodb://localhost:27017/apata?replicaSet=rs0&directConnection=true"

# Secret used to sign and verify the admin JWT (must equal the value the old Express API used,
# so tokens already issued keep verifying).
JWT_SECRET=troque-este-segredo

# Cloudinary credentials (server-only).
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=

# Local development only: point the Cloudinary SDK at a local stub (see README). Leave unset in production.
# CLOUDINARY_UPLOAD_PREFIX=https://localhost:4567
```

- [ ] **Step 7: Update `.env.local` (untracked)**

Replace the file's content with:

```env
DATABASE_URL="mongodb://localhost:27017/apata?replicaSet=rs0&directConnection=true"
JWT_SECRET=segredo-local-apata
CLOUDINARY_NAME=stubcloud
CLOUDINARY_KEY=123456
CLOUDINARY_SECRET=abcdef
CLOUDINARY_UPLOAD_PREFIX=https://localhost:4567
NEXT_PUBLIC_URLAPI=http://localhost:3000
```

`NEXT_PUBLIC_URLAPI` is kept until Task 6 removes its last reader, so the app keeps building between tasks. All five server vars have no `NEXT_PUBLIC_` prefix and never reach the browser bundle.

- [ ] **Step 8: Verify the three gates**

```bash
cd "$REPO" && npx tsc --noEmit && npx eslint . && npx next build
```
Expected: all exit 0; eslint prints nothing; the build route table is unchanged (`/`, `/_not-found`, `/cadastro`, `/gerenciar`, `/painel`).

- [ ] **Step 9: Commit**

```bash
cd "$REPO" && git add package.json package-lock.json prisma/schema.prisma .env.example && git commit -m "chore: add prisma schema, bcryptjs, jsonwebtoken and cloudinary for the api port"
```

---

### Task 2: Server foundation modules

**Files:**
- Create: `src/server/prisma.ts`, `src/server/jwt.ts`, `src/server/auth.ts`, `src/server/cloudinary.ts`, `src/server/body.ts`, `src/server/pets.ts`

**Interfaces:**
- Consumes: `@prisma/client` from Task 1.
- Produces (exact signatures used by Tasks 4–7):
  - `prisma: PrismaClient`
  - `signToken(id: string): string`; `verifyToken(token: string): string` (returns the user id, throws on any failure)
  - `AUTH_COOKIE = 'apata_token'`; `authenticate(request: NextRequest): { userId: string } | { error: NextResponse }`; `setAuthCookie(response: NextResponse, token: string): void`; `clearAuthCookie(response: NextResponse): void`
  - `uploadPetPhoto(file: File): Promise<UploadApiResponse>`; `destroyPhoto(publicId: string): Promise<unknown>`
  - `type Fields = Record<string, unknown>`; `readJsonBody(request: NextRequest): Promise<Fields>`; `readPetBody(request: NextRequest): Promise<{ fields: Fields; file: File | null }>`
  - `ACTIVE_PETS_WHERE: Prisma.PetWhereInput`; `findActivePets(): Promise<PetRecord[]>`

- [ ] **Step 1: Write `src/server/prisma.ts`**

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

This is the Prisma-documented Next.js singleton. In `next dev`, hot reload re-evaluates modules; caching the instance on `globalThis` stops each reload opening a new MongoDB connection pool. In production every Route Handler imports this same module, so one `PrismaClient` exists per function instance; under Fluid Compute that instance serves many concurrent requests with one pool, which is what keeps Atlas connection counts sane. No route ever calls `new PrismaClient()` itself.

- [ ] **Step 2: Write `src/server/jwt.ts`**

```ts
import { sign, verify } from 'jsonwebtoken'

const EXPIRES_IN = '7d'

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET não definido')
  return secret
}

export function signToken(id: string): string {
  return sign({ id }, jwtSecret(), { expiresIn: EXPIRES_IN })
}

export function verifyToken(token: string): string {
  const decoded = verify(token, jwtSecret())
  if (typeof decoded === 'string' || typeof decoded.id !== 'string') throw new Error('Token inválido')
  return decoded.id
}
```

Payload `{ id }` and `expiresIn: '7d'` match `UserController.login` and `renovarToken`. A missing secret throws inside the callers' `try`, which yields the same 500/401 the Express code produced when `process.env.JWT_SECRET` was undefined.

- [ ] **Step 3: Write `src/server/auth.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/server/jwt'

export const AUTH_COOKIE = 'apata_token'
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({ name: AUTH_COOKIE, value: token, maxAge: AUTH_COOKIE_MAX_AGE, ...cookieOptions() })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({ name: AUTH_COOKIE, value: '', maxAge: 0, ...cookieOptions() })
}

export function authenticate(request: NextRequest): { userId: string } | { error: NextResponse } {
  const cookieToken = request.cookies.get(AUTH_COOKIE)?.value
  const authHeader = request.headers.get('authorization')

  if (!cookieToken && !authHeader) {
    return { error: NextResponse.json({ error: 'Token não fornecido' }, { status: 401 }) }
  }

  const token = cookieToken || (authHeader ?? '').split(' ')[1] || ''

  try {
    return { userId: verifyToken(token) }
  } catch {
    return { error: NextResponse.json({ error: 'Token inválido' }, { status: 401 }) }
  }
}
```

Fidelity to `middlewares/auth.js`: no header and no cookie -> `401 {"error":"Token não fornecido"}`; header present but unverifiable (including `Bearer ` with an empty token, which the frontend sends when `localStorage` is empty) -> `401 {"error":"Token inválido"}`. Cookie first, header fallback (decision 4). Cookie `maxAge` equals the JWT's 7-day expiry so the two never disagree about expiry.

- [ ] **Step 4: Write `src/server/cloudinary.ts`**

```ts
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

const PETS_FOLDER = 'pets_apata'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  ...(process.env.CLOUDINARY_UPLOAD_PREFIX ? { upload_prefix: process.env.CLOUDINARY_UPLOAD_PREFIX } : {}),
})

export async function uploadPetPhoto(file: File): Promise<UploadApiResponse> {
  const buffer = Buffer.from(await file.arrayBuffer())

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: PETS_FOLDER }, (error, result) => {
      if (error) reject(error)
      else if (result) resolve(result)
      else reject(new Error('Upload sem resposta'))
    })
    uploadStream.end(buffer)
  })
}

export function destroyPhoto(publicId: string): Promise<unknown> {
  return cloudinary.uploader.destroy(publicId)
}
```

`multer.memoryStorage()` gave the controller `req.file.buffer`; here the `File` from `request.formData()` becomes a `Buffer` via `arrayBuffer()`, and `upload_stream(...).end(buffer)` is the exact call the controller made, with the same `folder: "pets_apata"`. `secure_url` and `public_id` are read by the callers. `upload_prefix` is only set when `CLOUDINARY_UPLOAD_PREFIX` exists (local stub); production is untouched.

- [ ] **Step 5: Write `src/server/body.ts`**

```ts
import type { NextRequest } from 'next/server'

export type Fields = Record<string, unknown>

export interface ParsedBody {
  fields: Fields
  file: File | null
}

function contentType(request: NextRequest): string {
  return request.headers.get('content-type') ?? ''
}

export async function readJsonBody(request: NextRequest): Promise<Fields> {
  if (!contentType(request).includes('application/json')) throw new Error('Body não é JSON')

  const data: unknown = await request.json()
  if (typeof data !== 'object' || data === null) throw new Error('Body não é um objeto JSON')

  return data as Fields
}

export async function readPetBody(request: NextRequest): Promise<ParsedBody> {
  if (contentType(request).startsWith('multipart/form-data')) {
    const formData = await request.formData()
    const fields: Fields = {}
    let file: File | null = null

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') fields[key] = value
      else if (key === 'file') file = value
    }

    return { fields, file }
  }

  if (contentType(request).includes('application/json')) {
    return { fields: await readJsonBody(request), file: null }
  }

  return { fields: {}, file: null }
}
```

This reproduces the Express stack: `express.json()` only parses `application/json` (anything else left `req.body` undefined, and the controllers then threw inside their `try` -> 500; `readJsonBody` throwing gives the same 500). `upload.single('file')` only parsed `multipart/form-data`, put text parts in `req.body` and the part named `file` in `req.file`; `readPetBody` does exactly that. A pet request with neither content type yields `{}`, which is what `{...undefined}` produced in `atualizar`. The multipart file part key **must stay `file`**: both `PetForm.tsx` and `Item.tsx` append it under that name.

- [ ] **Step 6: Write `src/server/pets.ts`**

```ts
import type { Pet as PetRecord, Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'

export const ACTIVE_PETS_WHERE: Prisma.PetWhereInput = {
  OR: [{ deleted_at: null }, { deleted_at: { isSet: false } }],
}

export function findActivePets(): Promise<PetRecord[]> {
  return prisma.pet.findMany({ where: ACTIVE_PETS_WHERE, orderBy: { createdAt: 'desc' } })
}
```

This is `PetController.listar`'s query verbatim (`OR` of `null` and `isSet: false`, `createdAt desc`). It is shared by `GET /api/pets` (Task 5) and the home page's direct DB read (Task 6) so the two can never drift.

- [ ] **Step 7: Verify the gates and the comment rule**

```bash
cd "$REPO" && npx tsc --noEmit && npx eslint . && npx next build && grep -rn -- '//' src | grep -v 'https\?://' | grep -v eslint-disable
```
Expected: tsc/eslint/build exit 0 with no eslint output; the final `grep` prints nothing (exit 1 is the success signal for that grep).

- [ ] **Step 8: Commit**

```bash
cd "$REPO" && git add src/server && git commit -m "feat: server modules for prisma, jwt, auth cookie, cloudinary and body parsing"
```

---

### Task 3: Local verification environment (MongoDB replica set, Cloudinary stub, seed user)

**Files:**
- Create (scratchpad, never committed): `$SCRATCH/apata-local/cloudinary-stub.mjs`, `$SCRATCH/apata-local/key.pem`, `$SCRATCH/apata-local/cert.pem`, `$SCRATCH/bcrypt-probe/`
- Modify (untracked): `.env.local` (already done in Task 1 Step 7)

**Interfaces:**
- Produces: MongoDB at `mongodb://localhost:27017/apata?replicaSet=rs0&directConnection=true` with a `User` document `admin@apata.local` / password `senha123` (native `$2b$12$` hash); an HTTPS Cloudinary stub on `https://localhost:4567`; the commands every later task uses to start the app.

- [ ] **Step 1: Start MongoDB as a single-node replica set**

Docker is installed at `/usr/local/bin/docker` but the daemon was not running when the plan was written; start Docker Desktop first.

```bash
docker run -d --name apata-mongo -p 27017:27017 mongo:7 mongod --replSet rs0 --bind_ip_all
sleep 3
docker exec apata-mongo mongosh --quiet --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
sleep 3
docker exec apata-mongo mongosh --quiet --eval "rs.status().members[0].stateStr"
```
Expected: the last command prints `PRIMARY`.

Fallback without Docker:
```bash
brew tap mongodb/brew && brew install mongodb-community@7
mkdir -p "$SCRATCH/mongo-data"
mongod --dbpath "$SCRATCH/mongo-data" --replSet rs0 --port 27017 --bind_ip localhost --fork --logpath "$SCRATCH/mongod.log"
mongosh --quiet --eval "rs.initiate()"
```
(then replace every `docker exec apata-mongo mongosh` below with plain `mongosh`).

- [ ] **Step 2: Push the schema (creates the unique index on `User.email`)**

```bash
cd "$REPO" && DATABASE_URL="mongodb://localhost:27017/apata?replicaSet=rs0&directConnection=true" npx prisma db push
```
Expected: `Your database indexes are now in sync with your Prisma schema.` (Prisma CLI reads `.env`, not `.env.local`, hence the inline variable.)

- [ ] **Step 3: Generate a native-bcrypt hash and seed the admin user**

```bash
mkdir -p "$SCRATCH/bcrypt-probe" && cd "$SCRATCH/bcrypt-probe" && npm init -y >/dev/null && npm install --silent bcrypt@6 && node -e "console.log(require('bcrypt').hashSync('senha123', 12))"
```
Expected: a 60-char string starting `$2b$12$`. Copy it into the next command as `HASH`:

```bash
HASH='<paste the hash>'
docker exec apata-mongo mongosh --quiet apata --eval "db.User.insertOne({email:'admin@apata.local', name:'Admin', password:'$HASH'})"
docker exec apata-mongo mongosh --quiet apata --eval "db.User.countDocuments({email:'admin@apata.local'})"
```
Expected: `1`. (If `bcrypt@6` fails to build on this Mac, use `npm install bcrypt@5` — any native build works; the point is that the hash was made by the C++ implementation, not by bcryptjs.)

- [ ] **Step 4: Write the Cloudinary HTTPS stub**

```bash
mkdir -p "$SCRATCH/apata-local" && cd "$SCRATCH/apata-local" && openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -subj '/CN=localhost' -days 30 2>/dev/null && ls key.pem cert.pem
```

`$SCRATCH/apata-local/cloudinary-stub.mjs` (full content):

```js
import https from 'node:https'
import { readFileSync } from 'node:fs'

const PORT = 4567
let counter = 0

function publicIdFrom(body) {
  const urlencoded = new URLSearchParams(body).get('public_id')
  if (urlencoded) return urlencoded
  const match = body.match(/name="public_id"\r\n\r\n([^\r\n]+)/)
  return match ? match[1] : null
}

https
  .createServer({ key: readFileSync('key.pem'), cert: readFileSync('cert.pem') }, (req, res) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const body = Buffer.concat(chunks)
      const url = new URL(req.url, `https://localhost:${PORT}`)
      const stamp = new Date().toISOString()

      if (req.method === 'POST' && url.pathname.endsWith('/image/upload')) {
        counter += 1
        const publicId = `pets_apata/stub_${counter}`
        console.log(`${stamp} UPLOAD  ${publicId} (${body.length} bytes)`)
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(
          JSON.stringify({
            public_id: publicId,
            secure_url: `https://stub.local/${publicId}.jpg`,
            url: `http://stub.local/${publicId}.jpg`,
            format: 'jpg',
            resource_type: 'image',
            bytes: body.length,
          }),
        )
        return
      }

      if (req.method === 'POST' && url.pathname.endsWith('/image/destroy')) {
        console.log(`${stamp} DESTROY ${publicIdFrom(body.toString('latin1'))}`)
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ result: 'ok' }))
        return
      }

      console.log(`${stamp} UNHANDLED ${req.method} ${url.pathname}`)
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: { message: 'not found' } }))
    })
  })
  .listen(PORT, () => console.log(`cloudinary stub listening on https://localhost:${PORT}`))
```

Run it in its own terminal (leave it running for every later task):

```bash
cd "$SCRATCH/apata-local" && node cloudinary-stub.mjs
```

Smoke it:
```bash
curl -sk -X POST https://localhost:4567/v1_1/stubcloud/image/upload -F file=@"$REPO/src/img/logoapata.png"
```
Expected: `{"public_id":"pets_apata/stub_1","secure_url":"https://stub.local/pets_apata/stub_1.jpg",...}` and an `UPLOAD` line in the stub terminal.

- [ ] **Step 5: Define the app start command used from here on**

Development server (used for curl checks in Tasks 4, 5, 6, 7):
```bash
cd "$REPO" && NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev
```
Production mode (used for browser checks in Tasks 7 and 9):
```bash
cd "$REPO" && npm run build && NODE_TLS_REJECT_UNAUTHORIZED=0 npm run start
```
`NODE_TLS_REJECT_UNAUTHORIZED=0` exists only so the Cloudinary SDK accepts the stub's self-signed certificate; it is never set on Vercel.

- [ ] **Step 6: Confirm nothing from this task is tracked**

```bash
cd "$REPO" && git status --short
```
Expected: empty. No commit for this task.

---

### Task 4: `usuarios` Route Handlers (endpoints 7–14)

**Files:**
- Create: `src/app/api/usuarios/route.ts`, `src/app/api/usuarios/[id]/route.ts`, `src/app/api/usuarios/login/route.ts`, `src/app/api/usuarios/logout/route.ts`, `src/app/api/usuarios/atualizatoken/route.ts`

**Interfaces:**
- Consumes: `prisma`, `signToken`, `authenticate`, `setAuthCookie`, `clearAuthCookie`, `readJsonBody` from Task 2.
- Produces: the eight user/session endpoints of the mapping table. `POST /api/usuarios/login` responds `{ message, token, user: { id, name, email } }` plus `Set-Cookie: apata_token=...; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`.

- [ ] **Step 1: Write `src/app/api/usuarios/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/server/prisma'
import { readJsonBody } from '@/server/body'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await readJsonBody(request)

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password as string, salt)

    const novoUsuario = await prisma.user.create({
      data: {
        email: email as string,
        name: name as string | null | undefined,
        password: passwordHash,
      },
    })

    const usuarioSemSenha = { id: novoUsuario.id, email: novoUsuario.email, name: novoUsuario.name }
    return NextResponse.json(usuarioSemSenha, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar usuário', details: error instanceof Error ? error.message : undefined },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const usuarios = await prisma.user.findMany()
    return NextResponse.json(usuarios, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}
```

Fidelity notes: `genSalt(12)` + `hash` mirrors `UserController.criar`; the `as string` assertions reproduce the controller's unvalidated pass-through (`const { email, name, password } = req.body`) — Prisma/bcryptjs validate at runtime and the `catch` returns the same `500 {error, details}`. `usuarioSemSenha` is the same three keys in the same order the object-rest produced. `GET` returns full documents **including the bcrypt hash**, unauthenticated — ported flaw, see Risks.

- [ ] **Step 2: Write `src/app/api/usuarios/[id]/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'
import { readJsonBody } from '@/server/body'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    return NextResponse.json(user, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'ID inválido ou erro no servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { email, name } = await readJsonBody(request)

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: {
        email: email as string | undefined,
        name: name as string | null | undefined,
      },
    })

    return NextResponse.json(usuarioAtualizado, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Usuário não encontrado ou ID inválido' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: 'Usuário deletado com sucesso!' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar usuário' }, { status: 500 })
  }
}
```

`params` is a Promise in Next 15+/16 and is awaited inside the `try`, so a malformed ObjectId surfaces as Prisma's throw and becomes the controller's 500, exactly as before. `PUT` returns the full updated user including `password`, unauthenticated — ported flaw.

- [ ] **Step 3: Write `src/app/api/usuarios/login/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/server/prisma'
import { readJsonBody } from '@/server/body'
import { setAuthCookie } from '@/server/auth'
import { signToken } from '@/server/jwt'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await readJsonBody(request)

    const user = await prisma.user.findUnique({ where: { email: email as string } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const senhaCorreta = await bcrypt.compare(password as string, user.password)
    if (!senhaCorreta) return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })

    const token = signToken(user.id)

    const response = NextResponse.json(
      {
        message: 'Login realizado com sucesso!',
        token,
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 200 },
    )
    setAuthCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ error: 'Erro no servidor ao logar' }, { status: 500 })
  }
}
```

Body and status codes are `UserController.login` verbatim (404 unknown email, 401 wrong password, 500 anything else, 200 `{message, token, user}`); the only addition is `setAuthCookie` (decision 4).

- [ ] **Step 4: Write `src/app/api/usuarios/logout/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/server/auth'

export async function POST() {
  const response = NextResponse.json({ msg: 'Logout realizado com sucesso' }, { status: 200 })
  clearAuthCookie(response)
  return response
}
```

- [ ] **Step 5: Write `src/app/api/usuarios/atualizatoken/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { authenticate, setAuthCookie } from '@/server/auth'
import { signToken } from '@/server/jwt'

export async function POST(request: NextRequest) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const novoToken = signToken(auth.userId)
    const response = NextResponse.json({ msg: 'Token atualizado com sucesso', token: novoToken }, { status: 200 })
    setAuthCookie(response, novoToken)
    return response
  } catch {
    return NextResponse.json({ error: 'Erro ao renovar token' }, { status: 401 })
  }
}
```

- [ ] **Step 6: Gates**

```bash
cd "$REPO" && npx tsc --noEmit && npx eslint . && npx next build && grep -rn -- '//' src | grep -v 'https\?://' | grep -v eslint-disable
```
Expected: exit 0 ×3, no eslint output, build route table now also lists `ƒ /api/usuarios`, `ƒ /api/usuarios/[id]`, `ƒ /api/usuarios/atualizatoken`, `ƒ /api/usuarios/login`, `ƒ /api/usuarios/logout`; grep prints nothing.

- [ ] **Step 7: Exercise endpoints 7–14 with curl (dev server + stub running, Task 3)**

Run `cd "$REPO" && NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev` in a terminal, then:

```bash
B=http://localhost:3000/api; J='content-type: application/json'; CJ="$SCRATCH/cookies.txt"; rm -f "$CJ"

# 8 login (seeded native-bcrypt user) -> 200, token, Set-Cookie apata_token HttpOnly
curl -si -c "$CJ" -X POST $B/usuarios/login -H "$J" -d '{"email":"admin@apata.local","password":"senha123"}' | tee "$SCRATCH/login.txt" | grep -i 'HTTP/\|set-cookie\|"token"'
TOKEN=$(grep -o '"token":"[^"]*"' "$SCRATCH/login.txt" | cut -d'"' -f4); echo "TOKEN=${TOKEN:0:20}..."

# 8 login wrong password -> 401 {"error":"Senha incorreta"}; unknown email -> 404 {"error":"Usuário não encontrado"}
curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/usuarios/login -H "$J" -d '{"email":"admin@apata.local","password":"errada"}'
curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/usuarios/login -H "$J" -d '{"email":"nao@existe.local","password":"x"}'

# 7 create user -> 201 {id,email,name} without password
curl -s -X POST $B/usuarios -H "$J" -d '{"email":"segundo@apata.local","name":"Segundo","password":"abc123"}'; echo
# 7 duplicate email -> 500 {"error":"Erro ao criar usuário","details":"..."}
curl -s -o /dev/null -w '%{http_code}\n' -X POST $B/usuarios -H "$J" -d '{"email":"segundo@apata.local","name":"Dup","password":"abc123"}'

# 9 list users, unauthenticated -> 200 array with "password":"$2b$..." (ported flaw, expected)
curl -s $B/usuarios | grep -o '"password":"\$2[ab]\$12\$[^"]\{0,10\}' 
UID2=$(curl -s $B/usuarios | grep -o '"id":"[0-9a-f]\{24\}","email":"segundo@apata.local"' | cut -d'"' -f4); echo "UID2=$UID2"

# 10 get by id -> 200; unknown but valid ObjectId -> 404; malformed id -> 500
curl -s -o /dev/null -w '%{http_code}\n' $B/usuarios/$UID2
curl -s -o /dev/null -w '%{http_code}\n' $B/usuarios/000000000000000000000000
curl -s -o /dev/null -w '%{http_code}\n' $B/usuarios/nao-e-objectid

# 11 update, unauthenticated -> 200 full user (including password hash); malformed id -> 500
curl -s -X PUT $B/usuarios/$UID2 -H "$J" -d '{"name":"Segundo Editado"}' | grep -o '"name":"Segundo Editado"'
curl -s -o /dev/null -w '%{http_code}\n' -X PUT $B/usuarios/nao-e-objectid -H "$J" -d '{"name":"x"}'

# 14 renew token: cookie -> 200 + new token + refreshed cookie; header only -> 200; neither -> 401 "Token não fornecido"; garbage -> 401 "Token inválido"
curl -si -b "$CJ" -X POST $B/usuarios/atualizatoken | grep -i 'HTTP/\|set-cookie\|"token"'
curl -s -X POST $B/usuarios/atualizatoken -H "authorization: Bearer $TOKEN" | grep -o '"msg":"[^"]*"'
curl -s -X POST $B/usuarios/atualizatoken; echo
curl -s -X POST $B/usuarios/atualizatoken -H "authorization: Bearer abc.def.ghi"; echo

# 13 logout -> 200 {"msg":"Logout realizado com sucesso"} + Set-Cookie apata_token=; Max-Age=0
curl -si -X POST $B/usuarios/logout | grep -i 'HTTP/\|set-cookie\|msg'

# 12 delete second user -> 200; again -> 500
curl -s -X DELETE $B/usuarios/$UID2; echo
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE $B/usuarios/$UID2

# precedence: static segments beat [id]; GET on a POST-only file is 405
curl -s -o /dev/null -w '%{http_code}\n' $B/usuarios/login
```
Expected, in order: `HTTP/1.1 200`, a `set-cookie: apata_token=...; Path=/; Max-Age=604800; HttpOnly; SameSite=lax` line (no `Secure` in dev), a `"token"` line; `401`; `404`; a JSON with `id`, `email`, `name` and no `password`; `500`; a `"password":"$2b$12$..."` fragment; a 24-hex `UID2`; `200`, `404`, `500`; `"name":"Segundo Editado"`; `500`; `HTTP/1.1 200` + `set-cookie` + `"token"`; `"msg":"Token atualizado com sucesso"`; `{"error":"Token não fornecido"}`; `{"error":"Token inválido"}`; `HTTP/1.1 200`, `set-cookie: apata_token=; Path=/; Max-Age=0; HttpOnly; SameSite=lax`, `{"msg":"Logout realizado com sucesso"}`; `{"message":"Usuário deletado com sucesso!"}`; `500`; `405`.

- [ ] **Step 8: Commit**

```bash
cd "$REPO" && git add src/app/api/usuarios && git commit -m "feat: usuarios route handlers with login cookie, logout and token renewal"
```

---

### Task 5: `pets` Route Handlers (endpoints 1–6)

**Files:**
- Create: `src/app/api/pets/route.ts`, `src/app/api/pets/busca/route.ts`, `src/app/api/pets/[id]/route.ts`

**Interfaces:**
- Consumes: `prisma`, `authenticate`, `readPetBody`, `uploadPetPhoto`, `destroyPhoto`, `findActivePets` from Task 2; login from Task 4 for auth.
- Produces: the six pet endpoints. `PUT /api/pets/:id` responds with Prisma's `updateMany` result `{ "count": n }` — not the pet — exactly as Express did (see Task 6 for the frontend type).

- [ ] **Step 1: Write `src/app/api/pets/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/server/prisma'
import { authenticate } from '@/server/auth'
import { readPetBody } from '@/server/body'
import { uploadPetPhoto } from '@/server/cloudinary'
import { findActivePets } from '@/server/pets'

export async function GET() {
  try {
    const pets = await findActivePets()
    return NextResponse.json(pets, { status: 200 })
  } catch (error) {
    console.error('Erro ao listar:', error)
    return NextResponse.json({ error: 'Erro ao buscar animais' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const { fields, file } = await readPetBody(request)
    const { nome, especie, porte, sexo, descricao, tutelado, contato } = fields

    let fotoUrl: string | null = null
    let publicId: string | null = null

    if (file) {
      const resultado = await uploadPetPhoto(file)
      fotoUrl = resultado.secure_url
      publicId = resultado.public_id
    }

    const novoPet = await prisma.pet.create({
      data: {
        nome: nome as string,
        especie: especie as string,
        porte: porte as string,
        sexo: sexo as string,
        descricao: descricao as string,
        contato: contato as string | undefined,
        tutelado: tutelado === 'true' || tutelado === true,
        aprovado: true,
        adotado: false,
        foto: fotoUrl,
        public_idfoto: publicId,
        ownerId: auth.userId,
        deleted_at: null,
      },
    })

    return NextResponse.json(novoPet, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao cadastrar pet', details: error instanceof Error ? error.message : undefined },
      { status: 500 },
    )
  }
}
```

`criar` verbatim: the 5-pet limit stays commented out in Express (never enforced) so it is absent here; `aprovado: true`, `adotado: false`, `deleted_at: null`, `tutelado === "true" || tutelado === true`, `ownerId` from the token. Upload happens before the insert, as before. The `as string` assertions again mirror the unvalidated destructure; a missing required field makes Prisma throw and the response is the controller's `500 {error, details}`.

- [ ] **Step 2: Write `src/app/api/pets/busca/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'

export async function GET(request: NextRequest) {
  try {
    const nome = request.nextUrl.searchParams.get('nome')

    const where: Prisma.PetWhereInput = { deleted_at: null }
    if (nome) where.nome = { contains: nome, mode: 'insensitive' }

    const pets = await prisma.pet.findMany({ where })
    return NextResponse.json(pets, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar animais' }, { status: 500 })
  }
}
```

`listarnome` verbatim: `deleted_at: null` only (no `isSet` clause here — the two list endpoints differ in Express and the difference is preserved), no `orderBy`, case-insensitive `contains` only when `nome` is truthy.

- [ ] **Step 3: Write `src/app/api/pets/[id]/route.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/server/prisma'
import { authenticate } from '@/server/auth'
import { readPetBody } from '@/server/body'
import { destroyPhoto, uploadPetPhoto } from '@/server/cloudinary'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const pet = await prisma.pet.findFirst({ where: { id, deleted_at: null } })
    if (!pet) return NextResponse.json({ message: 'Animal não encontrado' }, { status: 404 })
    return NextResponse.json(pet, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar detalhes' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    const dadosAtuais = await prisma.pet.findFirst({ where: { id, deleted_at: null } })
    if (!dadosAtuais) return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 })

    const { fields, file } = await readPetBody(request)
    const dataUpdate: Record<string, unknown> = { ...fields }

    if (file) {
      if (dadosAtuais.public_idfoto) await destroyPhoto(dadosAtuais.public_idfoto)

      const resultado = await uploadPetPhoto(file)
      dataUpdate.foto = resultado.secure_url
      dataUpdate.public_idfoto = resultado.public_id
    }

    const petAtualizado = await prisma.pet.updateMany({
      where: { id, deleted_at: null },
      data: dataUpdate as Prisma.PetUpdateManyMutationInput,
    })

    return NextResponse.json(petAtualizado, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar pet' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = authenticate(request)
  if ('error' in auth) return auth.error

  try {
    const { id } = await params
    const pet = await prisma.pet.findUnique({ where: { id } })
    if (!pet) return NextResponse.json({ error: 'Pet não encontrado' }, { status: 404 })

    if (pet.public_idfoto) await destroyPhoto(pet.public_idfoto)

    await prisma.pet.update({
      where: { id },
      data: { deleted_at: new Date(), foto: null, public_idfoto: null },
    })

    return NextResponse.json({ message: 'Animal e imagem removidos com sucesso!' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 })
  }
}
```

Fidelity notes, each deliberate:
- `PUT`: `dataUpdate = { ...fields }` **is the mass-assignment flaw** (`dataUpdate = {...req.body}`); every body key, including `ownerId`, `adotado`, `aprovado`, `deleted_at`, reaches `updateMany`. The single `as Prisma.PetUpdateManyMutationInput` assertion is the typed spelling of that pass-through; Prisma still validates unknown keys at runtime and throws -> `500 {"error":"Erro ao atualizar pet"}`, as Express did. Destroy-then-upload order and `foto`/`public_idfoto` overwrite are preserved. The response is `updateMany`'s `{ count }`, not the pet.
- `PUT`/`DELETE` authenticate but never compare `pet.ownerId` with `auth.userId` — ported flaw.
- `DELETE` uses `findUnique` with no `deleted_at` filter (an already soft-deleted pet can be "deleted" again; its `public_idfoto` is already `null`, so Cloudinary is not called twice) and clears `foto`/`public_idfoto` — verbatim.
- `GET` uses `deleted_at: null` only, not the `isSet` form — verbatim.

- [ ] **Step 4: Gates**

```bash
cd "$REPO" && npx tsc --noEmit && npx eslint . && npx next build && grep -rn -- '//' src | grep -v 'https\?://' | grep -v eslint-disable
```
Expected: exit 0 ×3, no eslint output, route table adds `ƒ /api/pets`, `ƒ /api/pets/[id]`, `ƒ /api/pets/busca`; grep prints nothing.

- [ ] **Step 5: Exercise endpoints 1–6 with curl (dev server + stub running)**

```bash
B=http://localhost:3000/api; J='content-type: application/json'; CJ="$SCRATCH/cookies.txt"; IMG="$REPO/src/img/logoapata.png"
curl -s -c "$CJ" -X POST $B/usuarios/login -H "$J" -d '{"email":"admin@apata.local","password":"senha123"}' > "$SCRATCH/login.json"
TOKEN=$(grep -o '"token":"[^"]*"' "$SCRATCH/login.json" | cut -d'"' -f4)

# 4 create, no auth -> 401 Token não fornecido; garbage header -> 401 Token inválido
curl -s -X POST $B/pets -F nome=Rex; echo
curl -s -X POST $B/pets -H 'authorization: Bearer x.y.z' -F nome=Rex; echo

# 4 create with photo via cookie -> 201, foto = stub secure_url, public_idfoto = pets_apata/stub_N, aprovado true, adotado false, tutelado false
curl -s -b "$CJ" -X POST $B/pets -F nome=Rex -F especie=cachorro -F porte=medio -F sexo=macho -F descricao='Dois anos' -F contato=93991185009 -F file=@"$IMG" | tee "$SCRATCH/pet1.json"; echo
PET1=$(grep -o '"id":"[0-9a-f]\{24\}"' "$SCRATCH/pet1.json" | head -1 | cut -d'"' -f4); echo "PET1=$PET1"

# 4 create without photo via Bearer header, tutelado=true -> 201, foto null, tutelado true
curl -s -X POST $B/pets -H "authorization: Bearer $TOKEN" -F nome=Mimi -F especie=gato -F porte=pequeno -F sexo=femea -F descricao='Castrada' -F tutelado=true | tee "$SCRATCH/pet2.json"; echo
PET2=$(grep -o '"id":"[0-9a-f]\{24\}"' "$SCRATCH/pet2.json" | head -1 | cut -d'"' -f4)

# 4 create missing required field -> 500 {"error":"Erro ao cadastrar pet","details":"..."}
curl -s -b "$CJ" -X POST $B/pets -F nome=SemDescricao; echo

# 1 list -> 200, two pets, newest first (Mimi before Rex)
curl -s $B/pets | grep -o '"nome":"[^"]*"'

# 2 search (static segment beats [id]) -> 200 array containing only Rex; no match -> []; no query -> both
curl -s "$B/pets/busca?nome=re" | grep -o '"nome":"[^"]*"'
curl -s "$B/pets/busca?nome=zzz"; echo
curl -s "$B/pets/busca" | grep -o '"nome":"[^"]*"'

# 3 get by id -> 200; unknown valid ObjectId -> 404 {"message":"Animal não encontrado"}; malformed -> 500
curl -s -o /dev/null -w '%{http_code}\n' $B/pets/$PET1
curl -s $B/pets/000000000000000000000000; echo
curl -s -o /dev/null -w '%{http_code}\n' $B/pets/nao-e-objectid

# 5 update text only (multipart) -> 200 {"count":1}; the stub logs nothing
curl -s -b "$CJ" -X PUT $B/pets/$PET1 -F nome='Rex Editado' -F descricao='Três anos'; echo
# 5 update with new photo -> 200 {"count":1}; stub logs DESTROY pets_apata/stub_1 THEN UPLOAD pets_apata/stub_2
curl -s -b "$CJ" -X PUT $B/pets/$PET1 -F file=@"$IMG"; echo
curl -s $B/pets/$PET1 | grep -o '"foto":"[^"]*"\|"public_idfoto":"[^"]*"\|"nome":"[^"]*"'
# 5 update JSON body -> 200 {"count":1}; mass assignment (ported flaw): adotado flips to true
curl -s -b "$CJ" -X PUT $B/pets/$PET1 -H "$J" -d '{"adotado":true}'; echo
curl -s $B/pets/$PET1 | grep -o '"adotado":[a-z]*'
# 5 update unknown key -> 500 {"error":"Erro ao atualizar pet"}; unknown id -> 404 {"error":"Pet não encontrado"}; no auth -> 401
curl -s -b "$CJ" -X PUT $B/pets/$PET1 -H "$J" -d '{"campoInexistente":1}'; echo
curl -s -b "$CJ" -X PUT $B/pets/000000000000000000000000 -F nome=x; echo
curl -s -o /dev/null -w '%{http_code}\n' -X PUT $B/pets/$PET1 -F nome=x

# 6 delete -> 200 message; stub logs DESTROY pets_apata/stub_2; pet vanishes from GET /pets and GET /pets/:id -> 404; delete again -> 200 (no deleted_at filter, no second DESTROY)
curl -s -b "$CJ" -X DELETE $B/pets/$PET1; echo
curl -s $B/pets | grep -o '"nome":"[^"]*"'
curl -s -o /dev/null -w '%{http_code}\n' $B/pets/$PET1
curl -s -b "$CJ" -X DELETE $B/pets/$PET1; echo
# 6 no auth -> 401; unknown id -> 404
curl -s -X DELETE $B/pets/$PET2; echo
curl -s -b "$CJ" -X DELETE $B/pets/000000000000000000000000; echo
```
Expected, in order: `{"error":"Token não fornecido"}`; `{"error":"Token inválido"}`; a pet JSON with `"foto":"https://stub.local/pets_apata/stub_1.jpg"`, `"public_idfoto":"pets_apata/stub_1"`, `"aprovado":true`, `"adotado":false`, `"tutelado":false`, `"deleted_at":null`, `"ownerId":"<admin id>"`; a `PET1`; Mimi JSON with `"foto":null`, `"tutelado":true`; `{"error":"Erro ao cadastrar pet","details":"..."}`; `Mimi` then `Rex`; `Rex` only; `[]`; `Mimi` and `Rex`; `200`; `{"message":"Animal não encontrado"}`; `500`; `{"count":1}`; `{"count":1}` with the stub terminal showing `DESTROY pets_apata/stub_1` before `UPLOAD pets_apata/stub_2`; `foto` now `.../stub_2.jpg`, `public_idfoto` `pets_apata/stub_2`, `nome` `Rex Editado`; `{"count":1}`; `"adotado":true`; `{"error":"Erro ao atualizar pet"}`; `{"error":"Pet não encontrado"}`; `401`; `{"message":"Animal e imagem removidos com sucesso!"}` with `DESTROY pets_apata/stub_2` in the stub; only `Mimi`; `404`; the same success message again with no new stub line; `{"error":"Token não fornecido"}`; `{"error":"Pet não encontrado"}`.

Also confirm in Mongo that the soft delete kept the document:
```bash
docker exec apata-mongo mongosh --quiet apata --eval "db.Pet.countDocuments({deleted_at:{\$ne:null}})"
```
Expected: `1`.

- [ ] **Step 6: Commit**

```bash
cd "$REPO" && git add src/app/api/pets && git commit -m "feat: pets route handlers with cloudinary upload and soft delete"
```

---

### Task 6: Rewire the frontend to the internal API

**Files:**
- Modify: `src/types.ts`, `src/lib/api.ts`, `src/lib/pets-server.ts`, `src/components/Navbar.tsx`, `src/app/(admin)/gerenciar/page.tsx`
- Modify (untracked): `.env.local` (drop `NEXT_PUBLIC_URLAPI`)

**Interfaces:**
- Consumes: `findActivePets()` from Task 2; the URL mapping table.
- Produces: `updatePet(id, formData): Promise<UpdateResult>`, `logoutAdmin(): Promise<void>`, `loginAdmin` at `/api/usuarios/login`; `fetchPetsServer()` reading the database directly; `UpdateResult` type.

Old -> new for every call site (the reviewer checks each against the mapping table):

| Function | Old | New |
|---|---|---|
| `listPets` | `GET ${NEXT_PUBLIC_URLAPI}/pets` | `GET /api/pets` |
| `createPet` | `POST ${NEXT_PUBLIC_URLAPI}/pets` | `POST /api/pets` |
| `updatePet` | `PUT ${NEXT_PUBLIC_URLAPI}/pets/:id` (typed `Promise<Pet>`, wire is `{count}`) | `PUT /api/pets/:id`, typed `Promise<UpdateResult>` |
| `deletePet` | `DELETE ${NEXT_PUBLIC_URLAPI}/pets/:id` | `DELETE /api/pets/:id` |
| `loginAdmin` | `POST ${NEXT_PUBLIC_URLAPI}/login` | `POST /api/usuarios/login` |
| `logoutAdmin` (new) | — (Express `/logout` had no caller) | `POST /api/usuarios/logout` |
| `verifyToken` | `GET ${NEXT_PUBLIC_URLAPI}/usuarios` | `GET /api/usuarios` |
| `fetchPetsServer` | `fetch(${NEXT_PUBLIC_URLAPI}/pets)` from the server component | `findActivePets()` (direct Prisma, no HTTP) |
| unused | `/pets/busca`, `/pets/:id` GET, `/usuarios/:id` *, `/atualizatoken` | still no frontend caller |

- [ ] **Step 1: Add `UpdateResult` to `src/types.ts`**

Append after `LoginResponse`:

```ts
export interface UpdateResult {
  count: number
}
```

This resolves the response-shape mismatch without touching the wire: `PUT /api/pets/:id` keeps returning `updateMany`'s `{ count }` (decision 2); the frontend type stops claiming it is a `Pet`. Nothing reads the value (`gerenciar` only awaits it and invalidates `['itens']`).

- [ ] **Step 2: Rewrite `src/lib/api.ts`**

Full content:

```ts
import axios from 'axios'
import type { LoginPayload, LoginResponse, Pet, UpdateResult } from '@/types'
import { getToken } from '@/lib/auth'

const API_URL = '/api'

function authConfig() {
  return { headers: { authorization: `Bearer ${getToken() ?? ''}` } }
}

export async function listPets(): Promise<Pet[]> {
  const { data } = await axios.get<Pet[]>(`${API_URL}/pets`)
  return data
}

export async function createPet(formData: FormData): Promise<Pet> {
  const { data } = await axios.post<Pet>(`${API_URL}/pets`, formData, authConfig())
  return data
}

export async function updatePet(id: Pet['id'], formData: FormData): Promise<UpdateResult> {
  const { data } = await axios.put<UpdateResult>(`${API_URL}/pets/${id}`, formData, authConfig())
  return data
}

export async function deletePet(id: Pet['id']): Promise<void> {
  await axios.delete(`${API_URL}/pets/${id}`, authConfig())
}

export async function loginAdmin(credentials: LoginPayload): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${API_URL}/usuarios/login`, credentials)
  return data
}

export async function logoutAdmin(): Promise<void> {
  await axios.post(`${API_URL}/usuarios/logout`)
}

export async function verifyToken(): Promise<void> {
  await axios.get(`${API_URL}/usuarios`, authConfig())
}
```

Same-origin relative paths: the browser sends the `apata_token` cookie automatically and axios still adds the Bearer header, so both transports are exercised by the real app. `NEXT_PUBLIC_URLAPI` has no reader left after this step.

- [ ] **Step 3: Update `src/app/(admin)/gerenciar/page.tsx`**

Change the type import line and `handleUpdate`'s return type:

```ts
import type { Pet, PetFilters as PetFiltersValue, UpdateResult } from '@/types'
```

```ts
  function handleUpdate(id: Pet['id'], formData: FormData): Promise<UpdateResult> {
    return updateMutation.mutateAsync({ id, formData })
  }
```

`Item`'s `onUpdate` prop is typed `Promise<unknown>`, so no change there.

- [ ] **Step 4: Rewrite `src/lib/pets-server.ts` to read the database directly**

Full content:

```ts
import type { Pet } from '@/types'
import { findActivePets } from '@/server/pets'

const TIMEOUT_MS = 10_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let handle: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    handle = setTimeout(() => reject(new Error('Tempo esgotado ao buscar animais')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(handle))
}

export async function fetchPetsServer(): Promise<Pet[] | null> {
  try {
    const rows = await withTimeout(findActivePets(), TIMEOUT_MS)
    const data: unknown = JSON.parse(JSON.stringify(rows))
    return Array.isArray(data) ? (data as Pet[]) : null
  } catch {
    return null
  }
}
```

A server component fetching its own Route Handler would be a wasted HTTP round trip (and, on Vercel, a second function invocation). It now runs the exact query `GET /api/pets` runs. The `JSON.parse(JSON.stringify(...))` round trip reproduces what `res.json()` delivered (Dates become ISO strings, plain objects cross the RSC boundary) and keeps the `Array.isArray` guard the ledger's review required. The 10 s timeout preserves the migration's guarantee that the home shell renders even when the database is down (`null` -> client-side `useQuery` takes over).

- [ ] **Step 5: Make `Navbar` logout call the API**

In `src/components/Navbar.tsx` change the api import and the `logout` function:

```ts
import { logoutAdmin, verifyToken } from '@/lib/api'
```

```ts
  async function logout() {
    await logoutAdmin().catch(() => undefined)
    clearToken()
    router.push('/painel')
    setLogoutAlertOpen(false)
  }
```

The cookie is cleared server-side even if the request fails (`.catch`), then `localStorage` is cleared and the `apata-auth-change` event fires from `clearToken()` exactly as today. `Alert`'s `onConfirm: () => void` accepts the async function.

- [ ] **Step 6: Remove `NEXT_PUBLIC_URLAPI` from `.env.local`**

Delete the `NEXT_PUBLIC_URLAPI=...` line from `.env.local`. Then:

```bash
cd "$REPO" && grep -rn 'NEXT_PUBLIC_URLAPI' src .env.example; echo "exit=$?"
```
Expected: no matches, `exit=1`. (README still mentions it until Task 8.)

- [ ] **Step 7: Gates**

```bash
cd "$REPO" && npx tsc --noEmit && npx eslint . && npx next build && grep -rn -- '//' src | grep -v 'https\?://' | grep -v eslint-disable
```
Expected: exit 0 ×3, no eslint output, grep prints nothing. `/` remains `ƒ` (dynamic).

- [ ] **Step 8: Exercise in the browser (dev server + stub running)**

Open `http://localhost:3000/`: the pet list shows `Mimi` (seeded in Task 5) streamed from the server (view source: the name is present in the HTML). `/painel`: log in `admin@apata.local` / `senha123` -> lands on `/gerenciar` (the client `AuthGuard` is still in place in this task); DevTools > Application > Cookies shows `apata_token` HttpOnly. Edit Mimi's name -> save -> the list refetches and shows the new name; the network tab shows `PUT /api/pets/<id>` responding `{"count":1}` with both `Cookie` and `authorization: Bearer` request headers. `/cadastro`: create a pet with a photo -> "Cadastro feito com sucesso!" and the stub logs an `UPLOAD`. Navbar "Sair" -> confirm -> `POST /api/usuarios/logout` in the network tab, cookie gone, redirected to `/painel`, Navbar no longer shows Cadastrar/Sair.

- [ ] **Step 9: Commit**

```bash
cd "$REPO" && git add src/types.ts src/lib/api.ts src/lib/pets-server.ts src/components/Navbar.tsx "src/app/(admin)/gerenciar/page.tsx" && git commit -m "feat: call the internal api same-origin and read pets directly from the database on the home page"
```

---

### Task 7: Server-side auth guard for `/cadastro` and `/gerenciar`

**Files:**
- Create: `src/proxy.ts`
- Modify: `src/lib/auth.ts` (remove `useIsClient` and its helpers)
- Delete: `src/components/AuthGuard.tsx`, `src/app/(admin)/layout.tsx`

**Interfaces:**
- Consumes: `AUTH_COOKIE` from `src/server/auth.ts`, `verifyToken` from `src/server/jwt.ts`.
- Produces: unauthenticated requests to `/cadastro*` and `/gerenciar*` are redirected to `/painel` before any rendering; `src/lib/auth.ts` keeps exporting `getToken`, `setToken`, `clearToken`, `useAuthToken`.

What happens to each piece:
- **`AuthGuard.tsx` is deleted.** Its job (spinner + client redirect when `localStorage` has no token) is replaced by `proxy.ts`, which redirects on the server using the httpOnly cookie. No protected markup is ever sent to an unauthenticated browser, and there is no spinner flash.
- **`src/app/(admin)/layout.tsx` is deleted.** It only mounted `AuthGuard`. The `(admin)` route group directory stays; a group needs no layout.
- **`src/lib/auth.ts` keeps the `localStorage` token store.** It still feeds the `Authorization: Bearer` header (header fallback, decision 4) and is the client's "am I logged in" signal for `Navbar` (`useAuthToken`). Only `useIsClient` (used solely by `AuthGuard`) and its three helper functions are removed.
- **The `apata-auth-change` event is unchanged.** `setToken`/`clearToken` still dispatch it, `useAuthToken` still subscribes to it and to `storage`, so `Navbar` updates instantly on login/logout exactly as before.
- Cookie and `localStorage` are set together at login (`setAuthCookie` server-side, `setToken` in `painel/page.tsx`) and cleared together at logout (Task 6 Step 5). If they ever diverge — e.g. the cookie expires after 7 days while `localStorage` still holds the token — the proxy redirects to `/painel` and one login realigns them. Today's behaviour in that case was worse (AuthGuard let the page render, then every API call failed 401).

- [ ] **Step 1: Write `src/proxy.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE } from '@/server/auth'
import { verifyToken } from '@/server/jwt'

function hasValidSession(token: string | undefined): boolean {
  if (!token) return false
  try {
    verifyToken(token)
    return true
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  if (hasValidSession(request.cookies.get(AUTH_COOKIE)?.value)) return NextResponse.next()
  return NextResponse.redirect(new URL('/painel', request.url))
}

export const config = {
  matcher: ['/cadastro/:path*', '/gerenciar/:path*'],
}
```

`proxy.ts` lives at `src/proxy.ts` (next to `src/app`), exports `proxy` and runs on the Node.js runtime by default in Next 16 (the `runtime` option is not allowed in it), so `jsonwebtoken` works. The matcher never touches `/api/*`, `/`, or `/painel`. The signature is verified, not just the cookie's presence, so a forged cookie does not unlock the UI.

- [ ] **Step 2: Rewrite `src/lib/auth.ts`**

Full content:

```ts
import { useSyncExternalStore } from 'react'

const TOKEN_KEY = 'token'
const AUTH_EVENT = 'apata-auth-change'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
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

export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getToken, getServerToken)
}
```

- [ ] **Step 3: Delete the client guard and the admin layout**

```bash
cd "$REPO" && git rm -q src/components/AuthGuard.tsx "src/app/(admin)/layout.tsx" && grep -rn 'AuthGuard\|useIsClient' src; echo "exit=$?"
```
Expected: no matches, `exit=1`.

- [ ] **Step 4: Gates**

```bash
cd "$REPO" && npx tsc --noEmit && npx eslint . && npx next build && grep -rn -- '//' src | grep -v 'https\?://' | grep -v eslint-disable
```
Expected: exit 0 ×3, no eslint output; the build output lists `ƒ Proxy (proxy.ts)` (or `Middleware`, depending on the Next 16.3 label); grep prints nothing.

- [ ] **Step 5: Verify the guard with curl (dev server running)**

```bash
B=http://localhost:3000; CJ="$SCRATCH/cookies.txt"; rm -f "$CJ"
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' $B/gerenciar
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' $B/cadastro
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' --cookie 'apata_token=forged.token.value' $B/gerenciar
curl -s -c "$CJ" -X POST $B/api/usuarios/login -H 'content-type: application/json' -d '{"email":"admin@apata.local","password":"senha123"}' > /dev/null
curl -s -o /dev/null -w '%{http_code}\n' -b "$CJ" $B/gerenciar
curl -s -o /dev/null -w '%{http_code}\n' -b "$CJ" $B/cadastro
curl -s -o /dev/null -w '%{http_code}\n' $B/painel
curl -s -o /dev/null -w '%{http_code}\n' $B/
curl -s -b "$CJ" $B/gerenciar | grep -c 'Contato de Doadores'
curl -s $B/gerenciar | grep -c 'Contato de Doadores'
```
Expected: `307 http://localhost:3000/painel` three times (no cookie, no cookie, forged cookie); `200`, `200` with the cookie; `200` for `/painel` and `/` without it; `1` (protected markup present when authenticated); `0` (none when not).

- [ ] **Step 6: Verify in real Chrome, production mode**

Stop the dev server; run `cd "$REPO" && npm run build && NODE_TLS_REJECT_UNAUTHORIZED=0 npm run start` (stub still running). In Chrome (which accepts `Secure` cookies on `http://localhost`):
1. Fresh profile / cleared site data. Open `/gerenciar` -> immediately at `/painel`, no spinner, no flash of the admin page. Same for `/cadastro`.
2. Log in -> `/gerenciar` renders with the list; Navbar shows Cadastrar and Sair.
3. Open `/cadastro` in a new tab -> renders directly.
4. DevTools > Application > Cookies > delete `apata_token` (simulating expiry) -> reload `/gerenciar` -> redirected to `/painel` even though `localStorage.token` is still set. Log in again -> works.
5. Sair -> confirm -> at `/painel`; back button to `/gerenciar` -> redirected to `/painel`.
6. Console: zero errors on every route, logged in and out.

- [ ] **Step 7: Commit**

```bash
cd "$REPO" && git add src/proxy.ts src/lib/auth.ts && git commit -m "feat: server-side auth guard via proxy, drop client AuthGuard"
```
(`git rm` in Step 3 already staged the two deletions.)

---

### Task 8: README and deploy documentation

**Files:**
- Modify: `README.md`

**Interfaces:** none (docs only).

- [ ] **Step 1: Replace the "Sobre o Projeto" paragraph**

Replace
```
O APATA é uma aplicação Front-End construída em Next.js (App Router) com React e TypeScript, que consome uma API para exibir animais cadastrados para adoção.
```
with
```
O APATA é uma aplicação full-stack construída em Next.js (App Router) com React e TypeScript. A API (antes um servidor Express separado) agora vive no mesmo projeto como Route Handlers em `src/app/api/`, com Prisma sobre MongoDB e upload de imagens no Cloudinary.
```

- [ ] **Step 2: Add the back-end stack under "Tecnologias Utilizadas"**

Insert after the "### Front-End" list and before "### Ferramentas":

```
### Back-End (Route Handlers)

- Next.js Route Handlers (`src/app/api/`, runtime Node.js)
- Prisma ORM 6.19 (`mongodb` provider)
- MongoDB (replica set obrigatório)
- Cloudinary (fotos dos pets, pasta `pets_apata`)
- bcryptjs (hash de senha, compatível com hashes `$2b$` do `bcrypt` nativo)
- jsonwebtoken (JWT com validade de 7 dias)
```

- [ ] **Step 3: Replace the "Arquitetura de renderização" section body**

Replace the four bullets with:

```
- **`/` (Home)** — Server Component renderizado dinamicamente a cada requisição. A lista de pets é lida **direto do banco** (`src/lib/pets-server.ts` → `findActivePets()`), sem passar por HTTP, e enviada em *streaming* via `<Suspense>` com `HomePetsFallback` enquanto os dados não chegam. Se o banco não responder em 10 s a Home renderiza mesmo assim e o cliente busca `/api/pets`.
- **`/gerenciar`** — Client Component. A lista é gerenciada pelo TanStack Query (chave `['itens']`), com invalidação do cache após editar ou apagar.
- **`/painel`** (login) e o formulário de `/cadastro` — Client Components que chamam a API interna pelo axios em caminhos relativos (`/api/...`).
- **Proteção de rotas** — feita no servidor por `src/proxy.ts`: as rotas `/cadastro` e `/gerenciar` só renderizam se o cookie httpOnly `apata_token` contiver um JWT válido; caso contrário o servidor redireciona para `/painel` antes de qualquer HTML ser enviado.
- **API** — `src/app/api/pets` e `src/app/api/usuarios`, um `route.ts` por recurso, exportando uma função por verbo HTTP. Segmentos estáticos (`busca`, `login`, `logout`, `atualizatoken`) têm precedência sobre `[id]`.
```

- [ ] **Step 4: Replace the "Estrutura do Projeto" tree**

Replace the whole ```text block with:

```text
prisma/
└── schema.prisma            # Modelos User e Pet (MongoDB)

src/
├── proxy.ts                 # Guarda server-side de /cadastro e /gerenciar
├── app/
│   ├── layout.tsx           # html, fontes, metadata, Providers, Navbar, Footer
│   ├── page.tsx             # Home (Server Component; lista de pets via streaming)
│   ├── loading.tsx
│   ├── error.tsx
│   ├── providers.tsx        # QueryClientProvider
│   ├── globals.css          # Tailwind + variáveis de tema
│   ├── painel/page.tsx      # Login do administrador
│   ├── (admin)/             # Rotas protegidas pelo proxy
│   │   ├── cadastro/page.tsx
│   │   └── gerenciar/page.tsx
│   └── api/
│       ├── pets/
│       │   ├── route.ts           # GET lista, POST cria
│       │   ├── busca/route.ts     # GET ?nome=
│       │   └── [id]/route.ts      # GET, PUT, DELETE
│       └── usuarios/
│           ├── route.ts           # GET lista, POST cria
│           ├── [id]/route.ts      # GET, PUT, DELETE
│           ├── login/route.ts     # POST (JWT + cookie httpOnly)
│           ├── logout/route.ts    # POST (limpa o cookie)
│           └── atualizatoken/route.ts  # POST (renova o JWT)
│
├── server/                  # Módulos server-only usados pela API e pela Home
│   ├── prisma.ts            # PrismaClient singleton
│   ├── jwt.ts               # signToken / verifyToken
│   ├── auth.ts              # cookie apata_token + autenticação (cookie, depois Bearer)
│   ├── cloudinary.ts        # upload_stream / destroy
│   ├── body.ts              # multipart ou JSON
│   └── pets.ts              # consulta de pets ativos (soft delete)
│
├── components/              # Navbar, Hero, Item, PetForm, PetFilters, Alert, Popup, ...
│
├── lib/
│   ├── api.ts               # cliente axios (caminhos relativos /api)
│   ├── auth.ts              # token no localStorage (header Bearer + estado da Navbar)
│   ├── filterPets.ts
│   └── pets-server.ts       # leitura direta do banco para a Home
│
├── img/                     # Recursos visuais
└── types.ts                 # Pet, PetFormValues, UpdateResult, ...
```

- [ ] **Step 5: Replace the "Integração com API" section**

Replace everything from `## 🔗 Integração com API` up to (not including) `## ⚙️ Instalação` with:

```
## 🔗 API interna

A API roda no próprio Next.js. O front chama caminhos relativos, sem variável de ambiente pública.

| Método | Rota | Auth | Descrição |
| --- | --- | --- | --- |
| GET | `/api/pets` | não | Lista pets ativos (mais recentes primeiro) |
| GET | `/api/pets/busca?nome=` | não | Busca por nome (case-insensitive) |
| GET | `/api/pets/:id` | não | Detalhe de um pet |
| POST | `/api/pets` | sim | Cria pet (`multipart/form-data`, foto no campo `file`) |
| PUT | `/api/pets/:id` | sim | Atualiza pet (troca a foto se `file` vier); responde `{ count }` |
| DELETE | `/api/pets/:id` | sim | Soft delete + remove a foto do Cloudinary |
| POST | `/api/usuarios` | não | Cria usuário (`email`, `name`, `password`) |
| GET | `/api/usuarios` | não | Lista usuários |
| GET | `/api/usuarios/:id` | não | Usuário por id |
| PUT | `/api/usuarios/:id` | não | Atualiza `email`/`name` |
| DELETE | `/api/usuarios/:id` | não | Remove usuário |
| POST | `/api/usuarios/login` | não | `{ message, token, user }` + cookie httpOnly `apata_token` |
| POST | `/api/usuarios/logout` | não | Limpa o cookie |
| POST | `/api/usuarios/atualizatoken` | sim | Novo token (+ cookie renovado) |

Rotas com **auth** aceitam o cookie `apata_token` (enviado automaticamente pelo navegador) ou, na falta dele, o header `Authorization: Bearer <token>`.

> O comportamento é o mesmo da API Express anterior, endpoint por endpoint, incluindo códigos de status e mensagens. Os caminhos ganharam o prefixo `/api` e as três rotas de sessão passaram a viver em `/api/usuarios/*`.

```

- [ ] **Step 6: Replace the environment part of "Instalação"**

Replace
```
Crie o arquivo `.env.local` (veja `.env.example`):

```env
NEXT_PUBLIC_URLAPI=http://localhost:3000
```
```
with
```
Suba um MongoDB local **em replica set** (exigência do Prisma para MongoDB):

```bash
docker run -d --name apata-mongo -p 27017:27017 mongo:7 mongod --replSet rs0 --bind_ip_all
docker exec apata-mongo mongosh --quiet --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

Crie o arquivo `.env.local` (veja `.env.example`). Nenhuma variável tem o prefixo `NEXT_PUBLIC_`; todas ficam só no servidor:

```env
DATABASE_URL="mongodb://localhost:27017/apata?replicaSet=rs0&directConnection=true"
JWT_SECRET=um-segredo-local
CLOUDINARY_NAME=...
CLOUDINARY_KEY=...
CLOUDINARY_SECRET=...
```

Aplique os índices do schema e gere o client (o `postinstall` já roda `prisma generate` a cada `npm install`):

```bash
DATABASE_URL="mongodb://localhost:27017/apata?replicaSet=rs0&directConnection=true" npx prisma db push
```

Sem credenciais do Cloudinary, defina `CLOUDINARY_UPLOAD_PREFIX=https://localhost:4567`, rode um stub HTTPS local que responda `POST /v1_1/<cloud>/image/upload` e `/image/destroy`, e inicie o Next com `NODE_TLS_REJECT_UNAUTHORIZED=0` (somente em desenvolvimento).
```

- [ ] **Step 7: Rewrite the "Deploy na Vercel" section**

Replace everything from `## ☁️ Deploy na Vercel` up to (not including) `## 📸 Telas do Sistema` with:

```
## ☁️ Deploy na Vercel

A API Express separada foi desativada; este projeto é o único servidor. Passos feitos **manualmente no dashboard da Vercel** por quem tem acesso ao projeto, **antes do primeiro build desta branch**:

**1. Variáveis de ambiente** (`Project → Settings → Environment Variables`, ambientes Production e Preview):

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | a mesma string `mongodb+srv://...` que a API Express usava |
| `JWT_SECRET` | **o mesmo segredo** da API Express, para que tokens já emitidos continuem válidos |
| `CLOUDINARY_NAME` / `CLOUDINARY_KEY` / `CLOUDINARY_SECRET` | as mesmas credenciais da API Express |

Remova `NEXT_PUBLIC_URLAPI` e `VITE_URLAPI`: não têm mais leitor. Não defina `CLOUDINARY_UPLOAD_PREFIX` nem `NODE_TLS_REJECT_UNAUTHORIZED` na Vercel.

**2. MongoDB Atlas → Network Access**: as funções da Vercel não têm IP fixo. Libere `0.0.0.0/0` (ou contrate IPs dedicados). Sem isso o deploy sobe verde e toda rota responde 500.

**3. Build**: o preset Next.js detecta o projeto; `postinstall` executa `prisma generate` a cada instalação, contornando o cache de dependências da Vercel. `prisma` está em `devDependencies` — a Vercel instala devDependencies por padrão; não defina `NODE_ENV=production` nas variáveis de build.

**4. Runtime**: Node.js (Fluid Compute, padrão). Nenhum handler usa `runtime = 'edge'` — Prisma precisa de Node.

**5. Verificação do Preview** (este é o "teste em paralelo" antes de desligar a Express): na URL de Preview confirme `/` com a lista real, `/api/pets` respondendo JSON, login em `/painel` com um administrador real, edição/cadastro/remoção em `/gerenciar` e `/cadastro`, e `/gerenciar` redirecionando para `/painel` em uma janela anônima. Só então faça o merge e desligue o host da API Express.

**6. Primeiro acesso após o deploy**: administradores já logados têm o token no `localStorage` mas ainda não têm o cookie; `/gerenciar` os leva a `/painel` para um novo login (uma única vez).

---

```

- [ ] **Step 8: Replace "Controle de Acesso"**

Replace the section body with:

```
O sistema possui autenticação baseada em JWT (7 dias).

Após o login (`POST /api/usuarios/login`):

- O servidor grava o token em um cookie **httpOnly** (`apata_token`) e também o devolve no corpo; o cliente guarda a cópia no `localStorage`
- `/cadastro` e `/gerenciar` são liberadas pelo `src/proxy.ts` apenas com o cookie válido
- Operações de criação, edição e exclusão de pets aceitam o cookie ou o header `Authorization: Bearer <token>`
- `Sair` chama `POST /api/usuarios/logout` (limpa o cookie) e apaga o token local
```

Also, in "📚 Aprendizados Aplicados", replace `- Rotas protegidas com guarda client-side` with `- Rotas protegidas por guarda server-side (proxy) e cookie httpOnly` and add `- Route Handlers, Prisma e MongoDB no App Router`.

- [ ] **Step 9: Verify and commit**

```bash
cd "$REPO" && grep -n 'NEXT_PUBLIC_URLAPI\|VITE_URLAPI\|AuthGuard' README.md
```
Expected: only the two lines in the Vercel section telling the operator to remove the variables; no `AuthGuard`.

```bash
cd "$REPO" && npx eslint . && git add README.md && git commit -m "docs: document the internal api, env vars, local mongodb and vercel deploy"
```

---

### Task 9: Final verification, clean install, and hand-off

**Files:** none modified (fixes found here get their own small commits).

**Interfaces:** none.

- [ ] **Step 1: Clean install from scratch**

```bash
cd "$REPO" && rm -rf node_modules .next && npm ci && npx tsc --noEmit && npx eslint . && npx next build && git status --short
```
Expected: `npm ci` runs `postinstall` -> `prisma generate` (visible in output); tsc/eslint/build exit 0, eslint prints nothing; `git status --short` is empty (nothing generated is tracked, `tsconfig.json` untouched).

- [ ] **Step 2: Repo-rule greps**

```bash
cd "$REPO" && grep -rn -- '//' src | grep -v 'https\?://' | grep -v eslint-disable; echo "comments exit=$?"
grep -rn 'eslint-disable' src; echo "(expect exactly the two Item.tsx lines)"
grep -rn "runtime = 'edge'\|runtime: 'edge'" src; echo "edge exit=$?"
grep -rn 'NEXT_PUBLIC_URLAPI' src .env.example; echo "urlapi exit=$?"
grep -rn ': any\|<any>\|as any\|@ts-ignore\|@ts-expect-error' src; echo "any exit=$?"
git log --format='%B' feat/nextjs..HEAD | grep -n 'Co-Authored-By\|Claude-Session'; echo "trailers exit=$?"
```
Expected: `comments exit=1`, exactly two `@next/next/no-img-element` lines in `src/components/Item.tsx`, `edge exit=1`, `urlapi exit=1`, `any exit=1`, `trailers exit=1`.

- [ ] **Step 3: Reset local data and run the full API checklist (dev mode)**

```bash
docker exec apata-mongo mongosh --quiet apata --eval "db.Pet.deleteMany({}); db.User.deleteMany({email:{\$ne:'admin@apata.local'}})"
```
Start `cd "$REPO" && NODE_TLS_REJECT_UNAUTHORIZED=0 npm run dev` and the stub, then re-run **Task 4 Step 7** and **Task 5 Step 5** in full and tick each expected line. Every one of the 14 endpoints must produce its expected status and body:

| # | Endpoint | Proven by |
|---|---|---|
| 1 | `GET /api/pets` | 200 array, newest first, soft-deleted excluded |
| 2 | `GET /api/pets/busca?nome=` | search handler answers (never `[id]` with `busca`), case-insensitive, `[]` on no match |
| 3 | `GET /api/pets/:id` | 200 / 404 `{message}` / 500 on malformed id |
| 4 | `POST /api/pets` | 401 ×2 messages, 201 with stub `secure_url` + `public_id`, `aprovado:true`, `adotado:false`, `tutelado` parsing, 500 `{error, details}` |
| 5 | `PUT /api/pets/:id` | `{count:1}`, DESTROY-then-UPLOAD order in the stub log, mass assignment of `adotado`, 500 on unknown key, 404, 401 |
| 6 | `DELETE /api/pets/:id` | 200 message, DESTROY in the stub, `deleted_at` set in Mongo, repeat delete 200, 401, 404 |
| 7 | `POST /api/usuarios` | 201 without password, 500 on duplicate email |
| 8 | `POST /api/usuarios/login` | 200 + `Set-Cookie apata_token HttpOnly` on the **native-bcrypt** seeded hash, 401 wrong password, 404 unknown email |
| 9 | `GET /api/usuarios` | 200 array including `password` hashes (ported flaw) |
| 10 | `GET /api/usuarios/:id` | 200 / 404 / 500 |
| 11 | `PUT /api/usuarios/:id` | 200 full user, 500 malformed id |
| 12 | `DELETE /api/usuarios/:id` | 200 message, 500 on repeat |
| 13 | `POST /api/usuarios/logout` | 200 `{msg}` + `Set-Cookie apata_token=; Max-Age=0` |
| 14 | `POST /api/usuarios/atualizatoken` | 200 via cookie, 200 via Bearer, 401 `Token não fornecido`, 401 `Token inválido` |
| — | precedence | `GET /api/usuarios/login` -> 405; `/api/pets/busca` never reaches `[id]` |

- [ ] **Step 4: Full frontend checklist in real Chrome (production mode)**

Stop the dev server. `cd "$REPO" && npm run build && NODE_TLS_REJECT_UNAUTHORIZED=0 npm run start`, stub running, Chrome with cleared site data for `localhost:3000`:

1. `/` renders the pet list streamed from the server (page source contains a pet name); filters by name/species/sex/size work; each card expands and the WhatsApp link uses `wa.me/55<contato>`.
2. `/gerenciar` and `/cadastro` while logged out -> instant redirect to `/painel`, no admin markup in the response.
3. `/painel` wrong password -> "Login ou Senha incorreto!"; correct -> `/gerenciar`; cookie `apata_token` present with HttpOnly (and `Secure`, since `next start` is production); `localStorage.token` set; Navbar shows Cadastrar and Sair.
4. `/cadastro`: submit without photo -> "Campo obrigatório" under the image button and no request; with photo -> "Cadastro feito com sucesso!", stub logs `UPLOAD`, the form resets, the new pet appears on `/` and `/gerenciar`.
5. `/gerenciar`: Editar -> change name -> Salvar -> spinner -> list refetch shows the new name (`PUT` response `{count:1}` in the network tab); Editar + Trocar foto + Salvar -> stub logs `DESTROY` then `UPLOAD`; Apagar -> "Tem certeza..." -> Sim -> pet disappears from `/gerenciar` and `/`, stub logs `DESTROY`.
6. Navbar "Gerenciar" while logged in -> `/gerenciar` (the `verifyToken` `GET /api/usuarios` call succeeds); while logged out -> `/painel`.
7. Sair -> confirm -> `POST /api/usuarios/logout`, cookie gone, `localStorage.token` gone, at `/painel`, Navbar without Cadastrar/Sair; back to `/gerenciar` -> `/painel`.
8. Kill the Mongo container (`docker stop apata-mongo`): `/` still returns 200 within ~10 s with "Nenhum animal encontrado." or the client error message, never a crash; `/api/pets` returns `500 {"error":"Erro ao buscar animais"}`. Restart it (`docker start apata-mongo`) and confirm `/` recovers.
9. Console: zero errors and zero warnings on `/`, `/painel`, `/gerenciar`, `/cadastro`, logged in and out.

- [ ] **Step 5: Before the switch (gate for retiring Express) — hand to the project owner**

These cannot be done from this session and must all be true before merging `feat/api-routes` and stopping the Express host:

1. Vercel env vars set for Production and Preview: `DATABASE_URL`, `JWT_SECRET` (identical to Express's), `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`. `NEXT_PUBLIC_URLAPI` and `VITE_URLAPI` deleted.
2. Atlas Network Access allows Vercel (`0.0.0.0/0` unless dedicated IPs are purchased).
3. Preview deployment of this branch passes the Task 9 Step 4 checklist against the **real** database and Cloudinary (this is the only run against production data before the switch; it is the parallel-run substitute).
4. Vercel build log shows `prisma generate` ran during `npm install` (postinstall) and `next build` succeeded with the eight `/api/*` routes and the proxy listed.
5. Only then: merge, confirm production `/api/pets` returns the real list, then stop the Express host. Keep the Express repo untouched for rollback (re-point nothing; rolling back means redeploying `feat/nextjs` with `NEXT_PUBLIC_URLAPI` restored while Express is restarted).

- [ ] **Step 6: Hand off**

No push and no PR from this plan (same ruling as the frontend migration ledger: outward-facing side effects are the human's). Report: branch `feat/api-routes`, commit list (`git log --oneline feat/nextjs..HEAD`), the checklist results from Steps 1–4, and the Step 5 gate.

---

## Risks and ASSUMPTIONS

### Retiring Express with no parallel run
- **Risk:** the first request against real Atlas/Cloudinary happens on Vercel, not locally. Mitigation: the Preview deployment gate (Task 9 Step 5.3) is a full checklist against production data before merge; rollback is redeploying `feat/nextjs` and restarting Express. The blast radius of a wrong `DATABASE_URL` or missing Atlas allowlist is "every write and the admin area fail"; the home page still renders (`fetchPetsServer` returns `null`, the client shows an error message) — but note the client's `listPets` now also hits this app, so pets would be empty rather than served by Express.
- **Risk:** `JWT_SECRET` on Vercel differs from Express's -> every existing admin token is invalid. Mitigation: documented in README step 1; symptom is one re-login, not data loss.
- **One-time re-login:** admins with a `localStorage` token but no cookie are redirected to `/painel` once after the deploy (Task 7 rationale, README step 6).

### Ported security flaws (deliberate, decision 2)
1. `GET /api/usuarios` and `GET /api/usuarios/:id` are unauthenticated and return bcrypt password hashes; `PUT /api/usuarios/:id` also returns the hash.
2. `POST`, `PUT`, `DELETE /api/usuarios[/:id]` are unauthenticated: anyone can create an admin account, rename one, or delete one.
3. `PUT`/`DELETE /api/pets/:id` verify a token but never check `pet.ownerId === auth.userId`; any admin edits any pet. The trivially safer line — `if (dadosAtuais.ownerId !== auth.userId) return 403` — is deliberately absent.
4. Mass assignment in `PUT /api/pets/:id`: `{ ...fields }` is passed straight to `updateMany`, so a client can set `ownerId`, `aprovado`, `adotado`, `deleted_at`, `foto`, `public_idfoto`. The trivially safer line would be an allow-list of the six form fields.
5. No input validation anywhere (the `as string` assertions in the handlers are the typed form of the Express destructures); Prisma's runtime validation is the only check, and its error text is echoed in `details` on `POST /api/pets` and `POST /api/usuarios`.
6. `POST /api/usuarios/login` distinguishes "user not found" (404) from "wrong password" (401) — a username-enumeration oracle.
7. The new cookie is `SameSite=Lax`, `HttpOnly`, `Secure` in production; that part is not a ported flaw. The Bearer fallback keeps the token readable by any script on the page (XSS -> token theft), as today.
8. `verifyToken()` in `Navbar` "verifies" by calling the unauthenticated `GET /api/usuarios`, so it always succeeds — as today.

### Vercel / Fluid Compute
- **Cold starts:** Prisma's query engine load plus the Atlas TLS handshake is ~1–2.5 s on a cold instance (Vercel Functions skill). The home page's 10 s timeout covers it; the admin pages simply wait. Fluid Compute keeps instances warm under traffic.
- **Connection limits:** one `PrismaClient` per instance (Task 2 singleton); with Fluid concurrency an instance serves many requests over one pool, so connection counts stay far below Atlas M0's 500-connection cap. ASSUMPTION: the project is on Atlas M0/M2/M5-class tiers; if traffic spikes create many instances, the pool default (Prisma's MongoDB driver `maxPoolSize`, unset here) is the lever.
- **IP allowlist:** Vercel has no fixed egress IPs; Atlas must allow `0.0.0.0/0` (README step 2). A deploy with a restrictive allowlist goes green and every route 500s.
- **`prisma` in devDependencies:** Vercel installs devDependencies by default; setting `NODE_ENV=production` as a build env var would break `postinstall`. Documented.
- **Node.js proxy on Vercel:** Next 16 runs `proxy.ts` on the Node runtime; ASSUMPTION: the Vercel project has Fluid Compute enabled (the default for projects created or migrated since 2025), which is what hosts Node-runtime proxy. If the build log shows the proxy failing to deploy, the fallback is to move the guard into `src/app/(admin)/layout.tsx` as a server layout that awaits `cookies()` and calls `redirect('/painel')` — same behaviour, same modules, one file.
- **Body size:** photo uploads go through the function (multipart in memory, as multer did); Vercel's limit is 100 MB on Fluid, well above any phone photo.
- **`next build` engine binary:** `prisma generate` runs on Vercel's build image so the engine target matches; the `.node` engine file is included by output tracing for the default `node_modules/.prisma/client` output. ASSUMPTION: no custom `output` path is ever added to the generator (that would require `outputFileTracingIncludes`).

### Behavioural micro-differences (all judged harmless; listed for the reviewer)
- ASSUMPTION: no third-party consumer of the Express API exists. Consequences if wrong: no `Access-Control-Allow-Origin` headers are emitted (Express had `cors()` wide open), all paths gained `/api`, and `/login`, `/logout`, `/atualizatoken` moved under `/usuarios/`.
- Malformed JSON: Express's `express.json()` answered 400 before the controller; here `request.json()` throws inside the handler's `try` -> the controller's 500. The frontend never sends malformed JSON.
- `GET /api/usuarios/login|logout|atualizatoken` -> 405 (POST-only files) instead of Express routing into `listarId` with a non-ObjectId (500).
- A multipart file part under a key other than `file` was a multer `Unexpected field` error (500) in Express; here it is ignored and the text parts are processed.
- `?nome=a&nome=b`: Express passed an array into `contains` (500); `searchParams.get` takes the first value.
- A JWT whose `id` claim is not a string was accepted by the Express middleware (then `ownerId: undefined` failed later); `verifyToken` rejects it with 401. Only login-issued tokens exist, all carry a string `id`.
- `details` on 500s is `error.message` when the throw is an `Error` and omitted otherwise, matching `error.message` on a non-Error being `undefined` (dropped by JSON).
- `PUT /api/pets/:id` reads the pet before parsing the body (Express parsed the body first, in middleware). Visible effect only when both the body is unparseable and the id is unknown (500 vs 404).
- `fetchPetsServer` now fails on DB errors rather than HTTP errors; both return `null` and the client takes over.
- The frontend `Pet.foto` type is still `string` while the API may return `null` (pet created without a photo). Pre-existing type lie, unchanged; `Item` renders `<img src={null}>` as no `src`, as before.

### Local verification
- `NODE_TLS_REJECT_UNAUTHORIZED=0` and `CLOUDINARY_UPLOAD_PREFIX` are local-only; Task 9 Step 5 tells the operator not to set them on Vercel.
- ASSUMPTION: Chrome accepts `Secure` cookies on `http://localhost` (true since Chrome 89), which is what makes the production-mode browser checks work without HTTPS. If a different browser is used and login "does nothing", that is why — use Chrome or run the browser checks against `next dev`.
- ASSUMPTION: the `mongo:7` image includes `mongosh` (it does in the official image); Homebrew fallback given.
- The native `bcrypt` install in `$SCRATCH/bcrypt-probe` needs a working Xcode CLT / prebuilt binary; any bcrypt version works, the goal is a C++-generated `$2b$` hash.

## Self-review

- **Coverage:** 14 endpoints -> Tasks 4 and 5 (mapping table rows 1–14 each have a file, a handler and a curl proof). Cookie addition -> Task 2 `auth.ts`, Task 4 login/logout/atualizatoken. Server-side guard -> Task 7, with `AuthGuard.tsx`, `src/lib/auth.ts` and `apata-auth-change` each addressed by name. Prisma singleton -> Task 2. bcrypt decision -> Task 1/Docs confirmed (bcryptjs, `$2b$` verified). multer -> `readPetBody` + `uploadPetPhoto` (`file` key preserved). `params` Promise -> Tasks 4/5 (`Promise<{ id: string }>`, awaited). Schema location/generate/postinstall/.gitignore/`DATABASE_URL` -> Task 1. Env vars incl. fate of `NEXT_PUBLIC_URLAPI` -> Tasks 1, 6, 8. `pets-server.ts` direct DB -> Task 6. `{count}` mismatch -> Task 6 Step 1 (`UpdateResult`). Soft delete `OR/isSet` -> Task 2 `pets.ts` and Task 5. Cloudinary folder/`secure_url`/`public_id`/destroy-then-upload/destroy-on-delete -> Tasks 2 and 5. Local Mongo replica set, Cloudinary stub, native-hash seed, browser flows -> Tasks 3, 7, 9. Route precedence + `(admin)` group note -> dedicated section plus checklist items. Old->new URL table -> Task 6. Risks/ASSUMPTIONS -> section above.
- **Placeholders:** none; every file is given in full or as exact replacement text.
- **Type consistency:** `authenticate` returns `{ userId } | { error }` and every caller uses `'error' in auth` / `auth.userId`; `readPetBody` returns `{ fields, file }`; `findActivePets(): Promise<PetRecord[]>` is consumed by `GET /api/pets` and `fetchPetsServer`; `UpdateResult` is defined in `types.ts` before `api.ts` and `gerenciar/page.tsx` import it; `AUTH_COOKIE`, `setAuthCookie`, `clearAuthCookie` names match between `auth.ts`, the three session routes and `proxy.ts`; `logoutAdmin` is defined in `api.ts` before `Navbar.tsx` imports it.
