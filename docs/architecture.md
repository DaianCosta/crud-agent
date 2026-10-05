# Arquitetura — API CRUD Todo

## Visão geral

API REST simples para gerenciamento de tarefas (todos) com operações CRUD completas.
Persistência em memória (sem banco de dados externo). Sem frontend.

## Componentes

```
back-end/
├── src/
│   ├── app.ts              # Configura Express, middlewares e rotas
│   ├── server.ts           # Ponto de entrada — escuta na PORT
│   ├── routes/
│   │   └── todo.routes.ts  # Define rotas /todos e delega ao controller
│   ├── controllers/
│   │   └── todo.controller.ts  # Recebe req/res, valida entrada, chama o service
│   ├── services/
│   │   └── todo.service.ts     # Lógica de negócio (CRUD sobre o repository)
│   ├── repositories/
│   │   └── todo.repository.ts  # Armazena todos em Map<string, Todo> (memória)
│   ├── models/
│   │   └── todo.model.ts       # Interface Todo e tipos auxiliares
│   └── errors/
│       └── not-found.error.ts  # Erro customizado para 404
├── tests/
│   ├── unit/
│   │   ├── todo.service.spec.ts      # Testes unitários do service
│   │   └── todo.repository.spec.ts   # Testes unitários do repository
│   └── integration/
│       └── todo.routes.spec.ts       # Testes de integração (supertest)
├── package.json
├── tsconfig.json
└── jest.config.ts
```

## Camadas

1. **Routes** — mapeia verbos HTTP para métodos do controller.
2. **Controller** — valida entrada (title obrigatório), formata resposta e status codes.
3. **Service** — orquestra a lógica de negócio (criar, listar, buscar, atualizar, excluir).
4. **Repository** — acesso ao armazenamento em memória (`Map<string, Todo>`).
5. **Model** — define a interface `Todo` com `id`, `title`, `completed`, `createdAt`, `updatedAt`.

## Fluxo principal (criar tarefa)

1. `POST /todos` → `todo.routes.ts` → `todo.controller.ts.create()`
2. Controller valida que `title` é string não vazia; se inválido, retorna 400.
3. Controller chama `todoService.create(title)`.
4. Service gera UUID v4, monta o objeto `Todo` com `completed: false` e timestamps, salva via repository.
5. Repository insere no `Map` e retorna o objeto.
6. Controller responde 201 com o JSON da tarefa.

## Mapeamento AC → Componentes

| AC | Componentes |
|----|-------------|
| AC-1 | controller (status 201), service (criação), repository (persistência), model (shape) |
| AC-2 | controller (validação de title) |
| AC-3 | controller + service + repository (listAll) |
| AC-4 | controller + service + repository (findById) |
| AC-5 | controller (404 quando não encontrado) |
| AC-6 | controller + service + repository (update, updatedAt) |
| AC-7 | controller (404 quando não encontrado) |
| AC-8 | controller + service + repository (delete, 204) |
| AC-9 | controller (404 quando não encontrado) |
| AC-10 | app.ts (express.json middleware, Content-Type) |
| AC-11 | tests/ (unit + integration) |
| AC-12 | tsconfig.json (compilação sem erros) |
| AC-13 | jest.config.ts + package.json scripts |

## Front-end

**None: no front-end changes.** Os requisitos pedem apenas a API; frontend está explicitamente fora de escopo.

## Plano de implementação

### Backend (`back-end/`)

Ordem sugerida:

1. **Scaffolding do projeto** — `package.json`, `tsconfig.json`, `jest.config.ts`, instalar dependências (`express`, `uuid`, `@types/*`, `typescript`, `jest`, `ts-jest`, `supertest`, `@types/supertest`).
2. **Model** — `src/models/todo.model.ts` com a interface `Todo`.
3. **Repository** — `src/repositories/todo.repository.ts` com `Map<string, Todo>`.
4. **Erro customizado** — `src/errors/not-found.error.ts`.
5. **Service** — `src/services/todo.service.ts` usando o repository.
6. **Controller** — `src/controllers/todo.controller.ts` com validação.
7. **Routes** — `src/routes/todo.routes.ts`.
8. **App** — `src/app.ts` (Express + middleware JSON + rotas).
9. **Server** — `src/server.ts` (escuta na `PORT`).
10. **Testes unitários** — `tests/unit/todo.service.spec.ts`, `tests/unit/todo.repository.spec.ts`.
11. **Testes de integração** — `tests/integration/todo.routes.spec.ts` (supertest sobre `app`).

### Frontend

Nenhum trabalho de frontend.

## Como executar

### Pré-requisitos

- Node.js >= 18
- npm

### Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT`   | Porta do servidor HTTP | `3000` |

### Comandos

```bash
cd back-end

# Instalar dependências
npm install

# Iniciar o servidor
npm start          # ou: npx ts-node src/server.ts

# Iniciar em modo desenvolvimento (com reload)
npm run dev        # opcional, se configurado com ts-node-dev/nodemon

# Verificação de tipos
npx tsc --noEmit

# Executar testes
npm test

# Lint (se configurado)
npm run lint
```

### Scripts do package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts",
    "test": "jest --verbose",
    "lint": "eslint src/ tests/"
  }
}
```
