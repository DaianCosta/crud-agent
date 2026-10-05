# ADR-001: Manter armazenamento em memória para o campo reminder

## Contexto

O AC-9 exige que o campo `reminder` seja persistido e sobreviva ao reinício do servidor. No entanto, a aplicação atual usa armazenamento em memória (`Map`), sem banco de dados. Os requisitos do PM reconhecem explicitamente essa limitação (ambiguidade #1).

## Decisão

Manter o armazenamento em memória. Não introduzir banco de dados nesta tarefa.

## Alternativas Consideradas

1. **Adicionar PostgreSQL**: satisfaria AC-9 plenamente, mas mudaria a arquitetura significativamente e está fora do escopo solicitado.
2. **Adicionar SQLite/arquivo JSON**: persistência simples, mas introduz dependência e complexidade não solicitadas.
3. **Manter em memória**: consistente com o design atual; o campo `reminder` se comporta exatamente como os demais campos.

## Consequências

- O `reminder`, assim como todos os outros campos, se perde ao reiniciar o servidor. Isso é uma limitação preexistente, não introduzida por esta funcionalidade.
- Se futuramente for adicionada persistência, o campo `reminder` já estará no modelo e será migrado naturalmente.
