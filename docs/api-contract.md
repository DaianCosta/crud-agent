# Contrato da API — Todo com Lembrete

Base URL: `http://localhost:3000`

## Formato de Erro

```json
{
  "error": "Mensagem descritiva do erro"
}
```

## Modelo `Todo` (resposta)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Comprar pão",
  "completed": false,
  "reminder": "2026-10-10T14:30:00Z",
  "createdAt": "2026-10-05T10:00:00.000Z",
  "updatedAt": "2026-10-05T10:00:00.000Z"
}
```

O campo `reminder` é `string | null`. Quando não há lembrete, o valor é `null`.

---

## POST /todos

Cria um novo todo.

### Request

```json
{
  "title": "Comprar pão",
  "reminder": "2026-10-10T14:30:00Z"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `title` | `string` | Sim | Título (não pode ser vazio) |
| `reminder` | `string \| null` | Não | Data/hora ISO 8601 do lembrete. Se ausente ou `null`, o todo é criado sem lembrete. |

### Respostas

| Status | Condição | Body |
|---|---|---|
| `201 Created` | Sucesso | Objeto `Todo` com `reminder` preenchido ou `null` |
| `400 Bad Request` | `title` ausente ou vazio | `{ "error": "Title is required" }` |
| `400 Bad Request` | `reminder` não é string ISO 8601 válida | `{ "error": "Reminder must be a valid ISO 8601 date string" }` |

---

## GET /todos

Lista todos os todos.

### Request

Sem parâmetros.

### Respostas

| Status | Condição | Body |
|---|---|---|
| `200 OK` | Sucesso | Array de objetos `Todo` (cada um com campo `reminder`) |

---

## GET /todos/:id

Retorna um todo pelo ID.

### Request

| Parâmetro | Tipo | Local | Descrição |
|---|---|---|---|
| `id` | `string` | path | UUID do todo |

### Respostas

| Status | Condição | Body |
|---|---|---|
| `200 OK` | Encontrado | Objeto `Todo` com campo `reminder` |
| `404 Not Found` | Não encontrado | `{ "error": "Todo not found" }` |

---

## PUT /todos/:id

Atualiza um todo existente.

### Request

```json
{
  "title": "Comprar pão integral",
  "completed": true,
  "reminder": "2026-10-11T09:00:00Z"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `title` | `string` | Não | Novo título (não pode ser vazio se enviado) |
| `completed` | `boolean` | Não | Novo status de conclusão |
| `reminder` | `string \| null` | Não | Novo lembrete (ISO 8601), ou `null` para remover. Se ausente, o lembrete não é alterado. |

### Respostas

| Status | Condição | Body |
|---|---|---|
| `200 OK` | Sucesso | Objeto `Todo` atualizado com campo `reminder` |
| `400 Bad Request` | `title` enviado mas vazio | `{ "error": "Title must be a non-empty string" }` |
| `400 Bad Request` | `completed` não é boolean | `{ "error": "Completed must be a boolean" }` |
| `400 Bad Request` | `reminder` não é string ISO 8601 válida (e não é `null`) | `{ "error": "Reminder must be a valid ISO 8601 date string" }` |
| `404 Not Found` | Todo não encontrado | `{ "error": "Todo not found" }` |

---

## DELETE /todos/:id

Remove um todo.

### Request

| Parâmetro | Tipo | Local | Descrição |
|---|---|---|---|
| `id` | `string` | path | UUID do todo |

### Respostas

| Status | Condição | Body |
|---|---|---|
| `204 No Content` | Sucesso | Sem body |
| `404 Not Found` | Não encontrado | `{ "error": "Todo not found" }` |
