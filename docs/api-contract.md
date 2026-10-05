# Contrato da API — API CRUD Todo

Base URL: `http://localhost:{PORT}` (padrão `PORT=3000`)

Todos os endpoints consomem e produzem `application/json`.

---

## Modelo Todo (resposta)

```json
{
  "id": "string (UUID v4)",
  "title": "string",
  "completed": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

## Formato de erro

```json
{
  "error": "string (mensagem descritiva)"
}
```

---

## POST /todos

Cria uma nova tarefa.

**Request body:**

```json
{
  "title": "string (obrigatório, não vazio)"
}
```

| Campo   | Tipo   | Obrigatório | Regras |
|---------|--------|-------------|--------|
| `title` | string | Sim         | Não pode ser vazio nem apenas espaços |

**Respostas:**

| Status | Descrição | Body |
|--------|-----------|------|
| `201 Created` | Tarefa criada com sucesso | Objeto Todo (com `completed: false`, timestamps gerados) |
| `400 Bad Request` | Campo `title` ausente ou vazio | `{ "error": "Title is required" }` |

**Exemplo:**

```
POST /todos
Content-Type: application/json

{ "title": "Comprar leite" }
```

```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Comprar leite",
  "completed": false,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-05T12:00:00.000Z"
}
```

**AC cobertos:** AC-1, AC-2, AC-10

---

## GET /todos

Lista todas as tarefas.

**Request:** sem parâmetros.

**Respostas:**

| Status | Descrição | Body |
|--------|-----------|------|
| `200 OK` | Lista retornada com sucesso | Array de objetos Todo (pode ser vazio `[]`) |

**Exemplo:**

```
GET /todos
```

```
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Comprar leite",
    "completed": false,
    "createdAt": "2026-10-05T12:00:00.000Z",
    "updatedAt": "2026-10-05T12:00:00.000Z"
  }
]
```

**AC cobertos:** AC-3, AC-10

---

## GET /todos/:id

Busca uma tarefa pelo ID.

**Path parameters:**

| Parâmetro | Tipo   | Descrição |
|-----------|--------|-----------|
| `id`      | string | UUID da tarefa |

**Respostas:**

| Status | Descrição | Body |
|--------|-----------|------|
| `200 OK` | Tarefa encontrada | Objeto Todo |
| `404 Not Found` | Tarefa não existe | `{ "error": "Todo not found" }` |

**Exemplo (sucesso):**

```
GET /todos/550e8400-e29b-41d4-a716-446655440000
```

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Comprar leite",
  "completed": false,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-05T12:00:00.000Z"
}
```

**Exemplo (não encontrado):**

```
GET /todos/id-inexistente
```

```
HTTP/1.1 404 Not Found
Content-Type: application/json

{ "error": "Todo not found" }
```

**AC cobertos:** AC-4, AC-5, AC-10

---

## PUT /todos/:id

Atualiza uma tarefa existente. Aceita atualização parcial dos campos `title` e `completed`.

**Path parameters:**

| Parâmetro | Tipo   | Descrição |
|-----------|--------|-----------|
| `id`      | string | UUID da tarefa |

**Request body:**

```json
{
  "title": "string (opcional)",
  "completed": "boolean (opcional)"
}
```

| Campo       | Tipo    | Obrigatório | Regras |
|-------------|---------|-------------|--------|
| `title`     | string  | Não         | Se fornecido, não pode ser vazio |
| `completed` | boolean | Não         | Se fornecido, deve ser boolean |

Pelo menos um dos campos deve ser fornecido.

**Respostas:**

| Status | Descrição | Body |
|--------|-----------|------|
| `200 OK` | Tarefa atualizada com sucesso | Objeto Todo (com `updatedAt` atualizado) |
| `404 Not Found` | Tarefa não existe | `{ "error": "Todo not found" }` |

**Exemplo:**

```
PUT /todos/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{ "completed": true }
```

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Comprar leite",
  "completed": true,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-05T12:05:00.000Z"
}
```

**AC cobertos:** AC-6, AC-7, AC-10

---

## DELETE /todos/:id

Remove uma tarefa.

**Path parameters:**

| Parâmetro | Tipo   | Descrição |
|-----------|--------|-----------|
| `id`      | string | UUID da tarefa |

**Respostas:**

| Status | Descrição | Body |
|--------|-----------|------|
| `204 No Content` | Tarefa removida com sucesso | Sem corpo |
| `404 Not Found` | Tarefa não existe | `{ "error": "Todo not found" }` |

**Exemplo (sucesso):**

```
DELETE /todos/550e8400-e29b-41d4-a716-446655440000
```

```
HTTP/1.1 204 No Content
```

**Exemplo (não encontrado):**

```
DELETE /todos/id-inexistente
```

```
HTTP/1.1 404 Not Found
Content-Type: application/json

{ "error": "Todo not found" }
```

**AC cobertos:** AC-8, AC-9, AC-10
