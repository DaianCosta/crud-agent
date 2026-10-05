# Arquitetura — Lembrete de Todo

## Visão Geral

Adicionar um campo opcional `reminder` (data/hora ISO 8601) ao modelo `Todo` existente, propagando-o por todas as camadas da aplicação: model → repository → service → controller → routes. A persistência continua em memória (Map), conforme o design atual.

## Componentes Afetados

| Camada | Arquivo | Mudança |
|---|---|---|
| Model | `back-end/src/models/todo.model.ts` | Adicionar `reminder: string \| null` a `Todo`, `CreateTodoInput` e `UpdateTodoInput` |
| Repository | `back-end/src/repositories/todo.repository.ts` | Nenhuma — o repositório já é genérico (salva/atualiza o objeto `Todo` inteiro) |
| Service | `back-end/src/services/todo.service.ts` | Propagar `reminder` em `create()` e `update()` |
| Controller | `back-end/src/controllers/todo.controller.ts` | Validar `reminder`: se presente, deve ser `null` ou string ISO 8601 válida; rejeitar com 400 caso contrário |
| Routes | `back-end/src/routes/todo.routes.ts` | Nenhuma mudança — os endpoints já existem |
| Testes | `back-end/tests/**` | Adicionar cenários para reminder em cada nível |

## Fluxo Principal

```
Cliente → POST /todos { title, reminder? }
       → Controller.create(): valida title, valida reminder (ISO 8601 ou ausente)
       → Service.create(): monta Todo com reminder (ou null)
       → Repository.save(): grava no Map
       → Resposta 201 { id, title, completed, reminder, createdAt, updatedAt }
```

```
Cliente → PUT /todos/:id { reminder: "2026-10-10T14:30:00Z" }
       → Controller.update(): valida reminder (ISO 8601, null, ou ausente)
       → Service.update(): aplica reminder ao todo existente
       → Repository.update(): grava no Map
       → Resposta 200 { id, title, completed, reminder, createdAt, updatedAt }
```

## Validação de `reminder`

- **Ausente / `undefined`**: campo não é alterado (em update) ou fica `null` (em create).
- **`null`**: remove o lembrete (campo fica `null`).
- **String ISO 8601 válida**: armazenada como recebida. Validação via `new Date(value)` — se resultar em `Invalid Date` ou `isNaN`, retorna 400.
- **Qualquer outro tipo**: retorna 400.
- Datas no passado são aceitas (AC-8).

## Mapeamento de Critérios de Aceitação

| AC | Componente(s) |
|---|---|
| AC-1 | Controller.create + Service.create + Model |
| AC-2 | Controller.create + Service.create (default `null`) |
| AC-3 | Controller.update + Service.update |
| AC-4 | Controller.update + Service.update (aceitar `null`) |
| AC-5 | Controller.findById (já devolve o objeto inteiro) |
| AC-6 | Controller.listAll (já devolve o array inteiro) |
| AC-7 | Controller.create + Controller.update (validação) |
| AC-8 | Controller (não rejeitar datas passadas) |
| AC-9 | Repository (in-memory Map — limitação documentada) |

## Plano de Implementação

### Backend (`back-end/`)

1. **Model** (`src/models/todo.model.ts`):
   - Adicionar `reminder: string | null` à interface `Todo`.
   - Adicionar `reminder?: string | null` a `CreateTodoInput` e `UpdateTodoInput`.

2. **Service** (`src/services/todo.service.ts`):
   - Em `create()`: inicializar `reminder` com `input.reminder ?? null`.
   - Em `update()`: se `input.reminder !== undefined`, aplicar o valor (pode ser `null` ou string).

3. **Controller** (`src/controllers/todo.controller.ts`):
   - Em `create()`: extrair `reminder` do body; se presente e não `null`, validar como ISO 8601; se inválido, retornar 400 `{ error: "Reminder must be a valid ISO 8601 date string" }`.
   - Em `update()`: mesma validação de `reminder`; aceitar `null` para remoção.
   - Função auxiliar privada ou inline: `isValidIsoDate(value: string): boolean` → `!isNaN(new Date(value).getTime())`.

4. **Testes unitários** (`tests/unit/todo.service.spec.ts`):
   - Criar todo com reminder.
   - Criar todo sem reminder (deve ser `null`).
   - Atualizar reminder.
   - Remover reminder (`null`).

5. **Testes unitários** (`tests/unit/todo.repository.spec.ts`):
   - Salvar e recuperar todo com reminder.

6. **Testes de integração** (`tests/integration/todo.routes.spec.ts`):
   - POST com reminder válido → 201 com reminder.
   - POST sem reminder → 201 com reminder `null`.
   - POST com reminder inválido → 400.
   - PUT com reminder → 200 com reminder atualizado.
   - PUT com `reminder: null` → 200 com reminder `null`.
   - PUT com reminder inválido → 400.
   - GET /:id → resposta contém reminder.
   - GET / → cada item contém reminder.

7. **Teste de aceitação** (`tests/qa_acceptance.spec.ts`):
   - Verificar cenários correspondentes a cada AC.

### Frontend

**None: no front-end changes.** O repositório não possui front-end; os requisitos explicitamente excluem interface de usuário.

## Como Rodar

| Comando | O que faz |
|---|---|
| `cd back-end && npm install` | Instala dependências |
| `cd back-end && npm test` | Roda todos os testes (Jest) |
| `cd back-end && npx tsc --noEmit` | Verifica tipos |
| `cd back-end && npm run dev` | Inicia o servidor (ts-node) |
| `cd back-end && npm run build && npm start` | Build + start em produção |

## Variáveis de Ambiente

| Variável | Descrição | Default |
|---|---|---|
| `PORT` | Porta do servidor HTTP | `3000` |

## Como o Sistema Inicia

`npm start` executa `node dist/server.js`, que importa `app.ts` (Express configurado com JSON parser e rotas `/todos`), e escuta na porta `PORT`.
