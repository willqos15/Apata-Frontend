# 🐾 APATA - Plataforma de Adoção de Animais

Sistema web desenvolvido para auxiliar a divulgação de animais disponíveis para adoção, permitindo que visitantes encontrem pets através de filtros e que administradores realizem o gerenciamento dos cadastros.

## 📋 Sobre o Projeto

O APATA é uma aplicação Front-End construída em Next.js (App Router) com React e TypeScript, que consome uma API para exibir animais cadastrados para adoção.

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

### Ferramentas

- ESLint 9 (flat config + `eslint-config-next`)
- Git
- GitHub
- Vercel

---

## 🧭 Arquitetura de renderização

- **`/` (Home)** — Server Component renderizado dinamicamente a cada requisição (`fetch` com `cache: 'no-store'`). A lista de pets é buscada no servidor e enviada em *streaming* via `<Suspense>`, com `HomePetsFallback` enquanto os dados não chegam.
- **`/gerenciar`** — Client Component. A lista é gerenciada pelo TanStack Query (chave `['itens']`), com invalidação do cache após editar ou apagar.
- **`/painel`** (login) e o formulário de `/cadastro` — Client Components que chamam a API diretamente pelo axios.
- **Proteção de rotas** — o `AuthGuard` é client-side porque o JWT fica no `localStorage`, que só existe no navegador. As rotas do grupo `(admin)` mostram um spinner e redirecionam para `/painel` quando não há token.

---

## 📁 Estrutura do Projeto

```text
src/
├── app/
│   ├── layout.tsx           # html, fontes, metadata, Providers, Navbar, Footer
│   ├── page.tsx             # Home (Server Component; lista de pets via streaming)
│   ├── loading.tsx
│   ├── providers.tsx        # QueryClientProvider
│   ├── globals.css          # Tailwind + variáveis de tema
│   ├── painel/page.tsx      # Login do administrador
│   └── (admin)/             # Rotas protegidas (AuthGuard)
│       ├── layout.tsx
│       ├── cadastro/page.tsx
│       └── gerenciar/page.tsx
│
├── components/              # Navbar, Hero, Item, PetForm, PetFilters, Alert, Popup, ...
│
├── lib/
│   ├── api.ts               # cliente axios
│   ├── auth.ts              # JWT no localStorage
│   ├── filterPets.ts
│   └── pets-server.ts       # fetch server-side da Home
│
├── img/                     # Recursos visuais
└── types.ts                 # Pet, PetFormValues, ...
```

---

## 🔗 Integração com API

A aplicação realiza comunicação com uma API através do Axios utilizando variáveis de ambiente.

Exemplo:

```env
NEXT_PUBLIC_URLAPI=https://sua-api.com
```

> O prefixo `NEXT_PUBLIC_` é obrigatório: a variável é lida no navegador e é **embutida no bundle durante o build**. Se ela não existir no momento do build, o cliente passa a chamar `undefined/pets`.

Endpoints utilizados:

```text
GET    /pets
POST   /pets
PUT    /pets/:id
DELETE /pets/:id
POST   /login
GET    /usuarios      # verificação do token
```

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

Crie o arquivo `.env.local` (veja `.env.example`):

```env
NEXT_PUBLIC_URLAPI=http://localhost:3000
```

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

O projeto migrou de Vite para Next.js. Os passos abaixo são feitos **manualmente no dashboard da Vercel** e precisam ser concluídos por quem tem acesso ao projeto — em especial o item 2, que deve ser feito **antes do primeiro build desta branch**.

**1. Framework Preset**

`Project → Settings → General`. A Vercel detecta Next.js automaticamente quando `next` está em `dependencies`. Se o preset estiver fixado manualmente em **Vite**, mude para **Next.js**.

Limpe qualquer override de **Build Command** e, principalmente, de **Output Directory**: o valor `dist` usado pelo Vite quebra o deploy do Next (a saída agora é `.next`, gerenciada pela própria plataforma). O **Root Directory** continua `./`.

**2. Variável de ambiente `NEXT_PUBLIC_URLAPI` (obrigatório antes do primeiro build)**

`Project → Settings → Environment Variables`. Adicione `NEXT_PUBLIC_URLAPI` com o mesmo valor que `VITE_URLAPI` tinha, marcando os três ambientes: **Production, Preview e Development**.

Variáveis `NEXT_PUBLIC_*` são **embutidas no bundle em tempo de build**, e não lidas em tempo de execução. Se a variável não existir quando o build rodar, o deploy sobe sem erro e o navegador passa a chamar `undefined/pets` — a listagem de pets simplesmente fica vazia. Por isso ela precisa estar cadastrada **antes** do primeiro build.

Mantenha `VITE_URLAPI` cadastrada até a branch `feat/nextjs` ser mesclada; depois disso pode ser removida.

**3. Node.js**

A versão padrão da Vercel (22.x) atende ao requisito do Next.js 16 (`>= 20.9`). Nenhuma mudança necessária.

**4. `vercel.json` foi removido**

O arquivo continha apenas um rewrite catch-all para SPA (`/(.*)` → `/index.html`), necessário no Vite para que rotas do React Router funcionassem em refresh. O Next.js faz esse roteamento nativamente, então o arquivo foi apagado e **não deve ser recriado**.

**5. Verificação do Preview**

Após o push da branch, a Vercel gera um deployment de Preview. Confirme que a URL serve:

- `/` — página inicial com a lista de pets
- `/painel` — login
- `/cadastro` e `/gerenciar` — redirecionam para `/painel` quando não há sessão

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

O sistema possui autenticação baseada em token.

Após o login:

- O token é armazenado localmente
- Rotas administrativas são liberadas
- Operações de edição e exclusão utilizam autorização via Bearer Token

---

## 📚 Aprendizados Aplicados

Durante o desenvolvimento foram aplicados conceitos como:

- Componentização em React
- Server Components e streaming com `<Suspense>` no App Router
- Tipagem estática com TypeScript em modo `strict`
- Consumo de APIs REST
- Cache e sincronização de dados com React Query
- Formulários com React Hook Form
- Rotas protegidas com guarda client-side
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