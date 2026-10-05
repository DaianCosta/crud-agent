# Modelo de Dados — Lembrete de Todo

## Persistência

A aplicação utiliza armazenamento **em memória** (`Map<string, Todo>`). Não há banco de dados relacional.

## Estrutura do Objeto `Todo`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | `string` (UUID v4) | Sim | Identificador único |
| `title` | `string` | Sim | Título da tarefa |
| `completed` | `boolean` | Sim | Se a tarefa foi concluída |
| `reminder` | `string \| null` | Sim (default `null`) | Data/hora ISO 8601 do lembrete, ou `null` se não definido |
| `createdAt` | `string` (ISO 8601) | Sim | Data de criação |
| `updatedAt` | `string` (ISO 8601) | Sim | Data da última atualização |

## Plano de Migração

Não aplicável — sem banco de dados. A adição do campo `reminder` é retrocompatível: todos existentes na memória teriam o campo desde a criação. Não há dados persistidos entre reinícios.
