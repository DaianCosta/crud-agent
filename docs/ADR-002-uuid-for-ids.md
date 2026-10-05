# ADR-002: UUID v4 para identificadores

## Contexto

Cada tarefa precisa de um identificador único (`id`). É necessário escolher o formato.

## Decisão

Usar UUID v4 (gerado pelo pacote `uuid`) como identificador de cada todo.

## Alternativas consideradas

1. **Inteiro auto-incremental** — simples, mas exige manter um contador global e não é seguro para ambientes distribuídos futuros.
2. **nanoid** — mais curto, mas UUID é mais padronizado e amplamente reconhecido em APIs REST.

## Consequências

- **Positivas**: universalmente único, sem colisões, padrão reconhecido.
- **Negativas**: strings mais longas que inteiros; legibilidade menor em URLs. Para o escopo de uma API em memória, isso é irrelevante.
