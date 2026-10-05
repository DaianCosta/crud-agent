# Modelo de Dados — API CRUD Todo

## Decisão: persistência em memória

Conforme os requisitos, banco de dados externo está **fora de escopo**. A persistência é feita em memória usando um `Map<string, Todo>` no repository. Os dados são perdidos ao reiniciar o servidor.

Ver: [ADR-001 — Persistência em memória](../decisions/ADR-001-in-memory-storage.md)

## Estrutura do Todo

| Campo       | Tipo      | Obrigatório | Descrição |
|-------------|-----------|-------------|-----------|
| `id`        | `string`  | Sim (gerado) | UUID v4 gerado automaticamente |
| `title`     | `string`  | Sim          | Título da tarefa (não vazio) |
| `completed` | `boolean` | Sim (default `false`) | Status de conclusão |
| `createdAt` | `string` (ISO 8601) | Sim (gerado) | Data/hora de criação |
| `updatedAt` | `string` (ISO 8601) | Sim (gerado) | Data/hora da última atualização |

## Armazenamento

```typescript
// Repositório em memória
private todos: Map<string, Todo> = new Map();
```

- **Chave**: `id` (UUID v4)
- **Valor**: objeto `Todo` completo
- **Índices**: nenhum necessário (busca por chave no Map é O(1))
- **Constraints**: `title` não pode ser string vazia (validado no controller)

## Migrations

Não aplicável — sem banco de dados relacional.
