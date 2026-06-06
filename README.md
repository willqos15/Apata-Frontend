# 🐾 APATA - Plataforma de Adoção de Animais

Sistema web desenvolvido para auxiliar a divulgação de animais disponíveis para adoção, permitindo que visitantes encontrem pets através de filtros e que administradores realizem o gerenciamento dos cadastros.

## 📋 Sobre o Projeto

O APATA é uma aplicação Front-End construída em React que consome uma API para exibir animais cadastrados para adoção.

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

- React 19
- React Router DOM
- React Hook Form
- TanStack Query (React Query)
- Axios
- Tailwind CSS
- React Icons
- Vite

### Ferramentas

- ESLint
- Git
- GitHub
- Vercel

---

## 📁 Estrutura do Projeto

```text
src/
│
├── components/
│   ├── Navbar
│   ├── Hero
│   ├── Item
│   ├── Formulario
│   ├── Alert
│   └── Outros componentes reutilizáveis
│
├── paginas/
│   ├── pageprincipal
│   ├── PainelAdm
│   ├── gerenciar
│   └── Prorota
│
├── hookapi/
│   └── fetchItem.jsx
│
├── img/
│   └── Recursos visuais
│
├── ContextNavbar.jsx
├── App.jsx
└── main.jsx
```

---

## 🔗 Integração com API

A aplicação realiza comunicação com uma API através do Axios utilizando variáveis de ambiente.

Exemplo:

```env
VITE_URLAPI=https://sua-api.com
```

Endpoints utilizados:

```text
GET    /pets
POST   /login
PUT    /pets/:id
DELETE /pets/:id
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

Crie o arquivo `.env`:

```env
VITE_URLAPI=http://localhost:3000
```

Execute o projeto:

```bash
npm run dev
```

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
- Gerenciamento de estado com Context API
- Consumo de APIs REST
- Cache e sincronização de dados com React Query
- Formulários com React Hook Form
- Rotas protegidas
- Lazy Loading com React Lazy e Suspense
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