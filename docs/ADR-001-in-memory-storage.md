# ADR-001: Persistência em memória

## Contexto

Os requisitos pedem uma API CRUD de todos. O documento de produto declara explicitamente que banco de dados externo está **fora de escopo** e que persistência em memória é aceitável.

## Decisão

Usar um `Map<string, Todo>` em memória no repository, sem banco de dados externo (PostgreSQL ou outro).

## Alternativas consideradas

1. **PostgreSQL via `DATABASE_URL`** — padrão do stack Node.js + Express da Squad. Descartado porque os requisitos dizem explicitamente "banco de dados externo fora de escopo".
2. **SQLite em arquivo** — leve, mas adiciona dependência desnecessária para o escopo pedido.

## Consequências

- **Positivas**: setup zero, sem dependência de infra, testes rápidos sem container.
- **Negativas**: dados são perdidos ao reiniciar o servidor; não escalável para produção.
- A arquitetura usa o padrão Repository, então migrar para um banco real no futuro exige apenas trocar a implementação do repository.
