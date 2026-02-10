# Achados e Perdidos — Frontend

Frontend do projeto **Achados e Perdidos**, desenvolvido em **React + Vite**, focado no consumo de **API REST**, autenticação via JWT e separação clara entre área pública e área administrativa.

O sistema foi pensado para pequenas empresas ou escolas, onde **um único administrador** gerencia os itens e o público apenas visualiza.

---

## Screenshots


![Tela Inicial](https://res.cloudinary.com/drklvmtqp/image/upload/v1766695024/Captura_de_tela_2025-12-25_173422_lyyhb2.png)


![Tela de Login](https://res.cloudinary.com/drklvmtqp/image/upload/v1766695023/Captura_de_tela_2025-12-25_173555_nwdhrr.png)


![Painel Administrativo](https://res.cloudinary.com/drklvmtqp/image/upload/v1766695024/Captura_de_tela_2025-12-25_173519_lexfba.png)


![Cadastrando Item](https://res.cloudinary.com/drklvmtqp/image/upload/v1766695024/Captura_de_tela_2025-12-25_173534_mhv4to.png)

![Deletando Item](https://res.cloudinary.com/drklvmtqp/image/upload/v1766695220/Captura_de_tela_2025-12-25_174003_wudqhw.png)

---

## Backend

Este repositório contém apenas o **frontend** da aplicação.

O código do **backend (API, autenticação, banco de dados e regras de negócio)** está disponível em um repositório separado no GitHub:

 **Backend – Achados e Perdidos**  
(https://github.com/willqos15/API-AEPerdidos)

O frontend consome essa API para autenticação, listagem e gerenciamento dos itens.

---

## Funcionalidades

### Público
- Visualização dos itens perdidos
- Busca de itens
- Não requer autenticação

### Administrador
- Login com autenticação JWT
- Cadastro, edição e exclusão de itens
- Upload e remoção de imagens
- Acesso controlado por rotas protegidas

---

## Tecnologias

- React + Vite
- Axios
- React Router DOM
- React Hook Form
- @tanstack/react-query
- CSS Modules
- JWT (Bearer Token)
- LocalStorage
- Cloudinary

---

## Dependências

Principais dependências utilizadas no frontend:

- **react / react-dom** — biblioteca base da aplicação
- **vite** — bundler e servidor de desenvolvimento
- **axios** — consumo da API REST
- **react-router-dom** — gerenciamento de rotas
- **@tanstack/react-query** — controle de requisições, cache e mutações
- **react-hook-form** — formulários e validações
- **react-number-format / react-imask** — mascaramento de inputs
- **react-icons** — ícones

---

## Como Rodar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Gerenciador de pacotes npm ou yarn
- Backend da API rodando e acessível

### 1º Passo: Clone o repositório

```bash
git clone https://github.com/willqos15/Achados-e-Perdidos.git
cd Achados-e-Perdidos
```

### 2º Passo: Instale as dependências
`npm install
`

### 3º Passo: Configure o arquivo .env
Entre no arquivo .env e configure o VITE_URLAPI

### 4º Passo: Rode o projeto
`npm run dev
`

---

## Estrutura do Projeto

O frontend foi organizado para separar claramente **componentes reutilizáveis**, **páginas**, **consumo de API** e **configurações globais**, facilitando manutenção e evolução do projeto.

### Diretórios principais


### `/src`
Diretório principal do código da aplicação React.

#### `/src/components`
Componentes reutilizáveis da aplicação.
Inclui:
- Componentes visuais (Item, Navbar, Footer)
- Componentes funcionais (Alert, Formulário)
- Cada componente possui seu próprio **CSS Module**, garantindo escopo isolado de estilos.

#### `/src/paginas`
Páginas que representam **rotas da aplicação**.

- `pageprincipal.jsx`  
  Página pública principal com listagem de itens.

- `pagebusca.jsx`  
  Página de busca de itens perdidos.

- `pagecadastro.jsx`  
  Tela de cadastro de itens (acesso administrativo).

- `gerenciar.jsx`  
  Tela de gerenciamento de itens (editar e excluir).

- `PainelAdm.jsx`  
  Tela de login do administrador.

- `Prorota.jsx`  
  Componente de proteção de rotas.  
  Verifica a existência de token JWT no `localStorage` e controla o acesso às rotas administrativas.


#### `/src/hookapi`
Centraliza toda a comunicação com a API.

- `fetchItem.jsx`  
  Contém funções Axios para:
  - Listar itens (público)
  - Criar, editar e excluir itens (admin)
  - Login do administrador  
  As requisições protegidas utilizam **Bearer Token** no header.


#### `/src/img`
Imagens internas do projeto, como loaders e imagens usadas para teste da interface.


#### `/src/ContextNavbar.jsx`

Context API responsável por **centralizar estados globais da aplicação** e controle visual do menu.

Suas principais responsabilidades incluem:

- Controle do **estado do usuário**:
  - Usuário público
  - Usuário administrador
- Alternância dinâmica das opções exibidas na **Navbar**, de acordo com o tipo de usuário logado
- Controle do **estado da barra de busca**
- Armazenamento e sincronização da lista de itens exibidos
- Auxílio no controle de **estados de carregamento** durante requisições

Esse contexto é consumido principalmente pela `Navbar`, permitindo:
- Exibir ações diferentes para usuários comuns e administradores
- Reagir a mudanças de autenticação (login/logout)
- Manter consistência visual e funcional entre páginas sem prop drilling

---

#### Arquivos principais

- `App.jsx`  
  Define as rotas da aplicação utilizando React Router DOM.

- `main.jsx`  
  Ponto de entrada da aplicação React.

- `index.css` / `App.css`  
  Estilos globais da aplicação.

---

### Arquivos de configuração

- `.env`  
  Variáveis de ambiente (API).

- `vite.config.js`  
  Configuração do Vite.

- `vercel.json`  
  Configuração de deploy na Vercel.

- `package.json`  
  Dependências e scripts do projeto.

---


### Rotas do projeto
```
├── public/
│   ├── ico.png
│   └── vite.svg
│
├── src/
│   ├── assets/
│   │   └── react.svg
│   │
│   ├── components/
│   │   ├── alert.jsx
│   │   ├── alert.module.css
│   │   ├── formulario.jsx
│   │   ├── formulario.module.css
│   │   ├── Item.jsx
│   │   ├── Item.module.css
│   │   ├── mfooter.jsx
│   │   ├── mfooter.module.css
│   │   ├── Navbar.jsx
│   │   └── Navbar.module.css
│   │
│   ├── hookapi/
│   │   └── fetchItem.jsx
│   │
│   ├── img/
│   │   ├── load.gif
│   │   ├── loading.svg
│   │   └── teste.jpg
│   │
│   ├── paginas/
│   │   ├── pageprincipal.jsx
│   │   ├── pageprincipal.module.css
│   │   ├── pagebusca.jsx
│   │   ├── pagebusca.module.css
│   │   ├── pagecadastro.jsx
│   │   ├── pagecadastro.module.css
│   │   ├── gerenciar.jsx
│   │   ├── gerenciar.module.css
│   │   ├── PainelAdm.jsx
│   │   ├── PainelAdm.module.css
│   │   └── Prorota.jsx
│   │
│   ├── ContextNavbar.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
│
├── .env
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```
---

## 👨‍💻 Sobre o autor

Desenvolvido por William Queiroz
🔗 Portfólio: (https://queirozdeveloper.vercel.app/)


