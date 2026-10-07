# ADR-001 — Sem persistência para o endpoint de versão

## Contexto

O endpoint `GET /version` precisa devolver a versão da aplicação e a data do build.
O projeto usa Node.js + Express + TypeScript e a stack prevê PostgreSQL somente se os requisitos exigirem persistência.

## Decisão

Manter os dados em memória: a versão vem do `package.json` (importado em tempo de compilação com `resolveJsonModule`)
e a data do build vem da variável de ambiente `BUILD_DATE` (com fallback para a data corrente).

## Alternativas consideradas

1. **Tabela no banco**: desnecessário — a informação já existe no código e no ambiente.
2. **Arquivo de versão gerado no build**: adiciona um passo de build sem benefício; `package.json` já contém a versão.

## Consequências

- Sem conexão com banco, sem migration, sem dependência externa.
- O endpoint serve também como health check leve (se responde 200, o processo está vivo).
- A data do build depende de `BUILD_DATE` ser definida no CI/CD; sem ela, usa a data atual como fallback seguro.
