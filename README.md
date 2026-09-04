# 🐾 APATA - Plataforma de Adoção de Animais

Sistema web desenvolvido para auxiliar a divulgação de animais disponíveis para adoção, permitindo que visitantes encontrem pets através de filtros e que administradores realizem o gerenciamento dos cadastros.

## 📋 Sobre o Projeto

O APATA é uma aplicação full-stack construída em Next.js (App Router) com React e TypeScript. A API (antes um servidor Express separado) agora vive no mesmo projeto como Route Handlers em `src/app/api/`, com Prisma sobre MongoDB e upload de imagens no Cloudinary.

Os usuários podem navegar pelos animais disponíveis, utilizar filtros de busca e visualizar informações importantes sobre cada pet.

Já a área administrativa permite autenticação de usuários autorizados para realizar o gerenciamento dos registros.

---


## Screenshots


![Tela Inicial](https://res.cloudinary.com/drklvmtqp/image/upload/v1775830396/Captura_de_tela_2026-04-10_110953_errvw6.png)

![Tela de Pesquisa](https://res.cloudinary.com/drklvmtqp/image/upload/v1775830396/Captura_de_tela_2026-04-10_110906_ueprqh.png)

![Tela de Cadastro](https://res.cloudinary.com/drklvmtqp/image/upload/v1775830396/Captura_de_tela_2026-04-10_111106_l8ypc2.png)

![Tela de Login](https://res.cloudinary.com/drklvmtqp/image/upload/v1780747263/Captura_de_tela_2026-06-06_090002_gyml2h.png)

![Tela de Edição](https://res.cloudinary.com/drklvmtqp/image/upload/v1775830396/Captura_de_tela_2026-04-10_111044_upvalo.png)
---

## 🚀 Funcionalidades

### Área Pública

- Listagem de animais disponíveis para adoção
- Busca por nome
- Filtro por espécie
- Filtro por sexo
- Filtro por porte
- Exibição de informações detalhadas dos animais
- Navegação responsiva

### Área Administrativa

- Login de administrador
- Proteção de rotas
- Cadastro de novos animais
- Edição de animais cadastrados
- Exclusão de registros
- Gerenciamento dos dados através da API

---

## 🛠 Tecnologias Utilizadas

### Front-End

- Next.js 16 (App Router, React Server Components, Turbopack)
- React 19
- TypeScript 5.9
- React Compiler (`reactCompiler: true`)
- React Hook Form
- React Number Format
- TanStack Query (React Query) v5
- Axios
- Tailwind CSS 4 (via `@tailwindcss/postcss`)
- React Icons

### Back-End (Route Handlers)

- Next.js Route Handlers (`src/app/api/`, runtime Node.js)
- Prisma ORM 6.19 (`mongodb` provider)
- MongoDB (replica set obrigatório)
- Cloudinary (fotos dos pets, pasta `pets_apata`)
- bcryptjs (hash de senha, compatível com hashes `$2b$` do `bcrypt` nativo)
- jsonwebtoken (JWT com validade de 7 dias)

### Ferramentas

- ESLint 9 (flat config + `eslint-config-next`)
- Git
- GitHub
- Vercel

---

## 🧭 Arquitetura de renderização

- **`/` (Home)** — Server Component renderizado dinamicamente a cada requisição. A lista de pets é lida **direto do banco** (`src/lib/pets-server.ts` → `findActivePets()`), sem passar por HTTP, e enviada em *streaming* via `<Suspense>` com `HomePetsFallback` enquanto os dados não chegam. Se o banco não responder em 10 s a Home renderiza mesmo assim e o cliente busca `/api/pets`.
- **`/gerenciar`** — Client Component. A lista é gerenciada pelo TanStack Query (chave `['itens']`), com invalidação do cache após editar ou apagar.
- **`/painel`** (login) e o formulário de `/cadastro` — Client Components que chamam a API interna pelo axios em caminhos relativos (`/api/...`).
- **Proteção de rotas** — feita no servidor por `src/proxy.ts`: as rotas `/cadastro` e `/gerenciar` só renderizam se o cookie httpOnly `apata_token` contiver um JWT válido; caso contrário o servidor redireciona para `/painel` antes de qualquer HTML ser enviado.
- **API** — `src/app/api/pets` e `src/app/api/usuarios`, um `route.ts` por recurso, exportando uma função por verbo HTTP. Segmentos estáticos (`busca`, `login`, `logout`, `atualizatoken`) têm precedência sobre `[id]`.

---

## 📁 Estrutura do Projeto

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

---

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

---

## ⚙️ Instalação

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/apata-frontend.git
```

Entre na pasta:

```bash
cd apata-frontend
```

Instale as dependências:

```bash
npm install
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

Execute o projeto em desenvolvimento:

```bash
npm run dev
```

Build de produção: `npm run build && npm run start`.

### Scripts disponíveis

| Script              | Comando        | Descrição                                  |
| ------------------- | -------------- | ------------------------------------------ |
| `npm run dev`       | `next dev`     | Servidor de desenvolvimento (Turbopack)    |
| `npm run build`     | `next build`   | Build de produção                          |
| `npm run start`     | `next start`   | Serve o build de produção                  |
| `npm run lint`      | `eslint .`     | Lint do projeto                            |
| `npm run typecheck` | `tsc --noEmit` | Checagem de tipos                          |

Requer Node.js `>= 20.9` (Next.js 16).

---

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

## 📸 Telas do Sistema

### Página Inicial

- Lista de animais disponíveis
- Busca por nome
- Filtros por características

### Painel Administrativo

- Autenticação
- Gerenciamento dos animais cadastrados

### Cadastro de Animais

- Formulário para inclusão de novos registros

---

## 🔒 Controle de Acesso

O sistema possui autenticação baseada em JWT (7 dias).

Após o login (`POST /api/usuarios/login`):

- O servidor grava o token em um cookie **httpOnly** (`apata_token`) e também o devolve no corpo; o cliente guarda a cópia no `localStorage`
- `/cadastro` e `/gerenciar` são liberadas pelo `src/proxy.ts` apenas com o cookie válido
- Operações de criação, edição e exclusão de pets aceitam o cookie ou o header `Authorization: Bearer <token>`
- `Sair` chama `POST /api/usuarios/logout` (limpa o cookie) e apaga o token local

---

## 📚 Aprendizados Aplicados

Durante o desenvolvimento foram aplicados conceitos como:

- Componentização em React
- Server Components e streaming com `<Suspense>` no App Router
- Tipagem estática com TypeScript em modo `strict`
- Consumo de APIs REST
- Cache e sincronização de dados com React Query
- Formulários com React Hook Form
- Rotas protegidas por guarda server-side (proxy) e cookie httpOnly
- Route Handlers, Prisma e MongoDB no App Router
- Responsividade utilizando Tailwind CSS

---

## 💡 Melhorias Futuras

- Paginação dos animais
- Upload otimizado de imagens
- Favoritar animais
- Painel com métricas de adoção
- Recuperação de senha
- Dashboard administrativo mais completo
- Testes automatizados

---

## 👨‍💻 Autor

William Queiroz

Desenvolvedor Full Stack e Professor de Tecnologia.

Projeto desenvolvido para apoiar a divulgação e adoção responsável de animais através da tecnologia.