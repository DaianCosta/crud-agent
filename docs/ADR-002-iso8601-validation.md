# ADR-002: Validação de data ISO 8601 via Date nativo

## Contexto

O campo `reminder` aceita strings no formato ISO 8601. Precisamos validar que o valor enviado é uma data válida.

## Decisão

Usar `new Date(value)` nativo do JavaScript para validação. Se `isNaN(new Date(value).getTime())`, o valor é inválido.

## Alternativas Consideradas

1. **Regex para ISO 8601**: complexo, propenso a falhas em edge cases (fusos, frações de segundo), e ainda precisaria de `new Date()` para validar se a data é real (ex.: 30 de fevereiro).
2. **Biblioteca (dayjs, date-fns, luxon)**: adicionaria dependência desnecessária para uma validação simples.
3. **`new Date()` nativo**: simples, sem dependências, aceita o formato ISO 8601 conforme a spec ECMAScript. Aceita também alguns formatos não-ISO (ex.: `"Oct 10 2026"`), mas isso é aceitável — o contrato da API documenta ISO 8601 como formato esperado, e formatos extras não causam problema.

## Consequências

- Zero dependências adicionais.
- `new Date()` é ligeiramente permissivo (aceita formatos além de ISO 8601), mas o contrato da API documenta o formato esperado. Clientes que enviam formatos não-ISO fazem por sua conta.
- Datas no passado são aceitas conforme AC-8.
