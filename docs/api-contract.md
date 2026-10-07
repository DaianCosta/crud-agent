# Contrato da API — Endpoint de saúde com versão

## `GET /version`

Retorna a versão da aplicação e a data do build.

### Parâmetros de query

| Parâmetro | Tipo   | Obrigatório | Valores aceitos | Descrição |
|-----------|--------|-------------|-----------------|-----------|
| `format`  | string | Não         | `short`         | Quando `short`, retorna só a versão em texto puro. Qualquer outro valor (ou ausência) retorna JSON completo. |

### Resposta — JSON (padrão)

**Condição**: `format` ausente ou diferente de `short`.

- **Status**: `200 OK`
- **Content-Type**: `application/json`
- **Corpo**:

```json
{
  "version": "1.0.0",
  "buildDate": "2026-10-07"
}
```

| Campo       | Tipo   | Descrição                                            |
|-------------|--------|------------------------------------------------------|
| `version`   | string | Versão do `package.json`. Sempre não vazia.          |
| `buildDate` | string | Data do build (ISO 8601, `YYYY-MM-DD`). Sempre não vazia. |

### Resposta — texto puro (format=short)

**Condição**: `format=short`.

- **Status**: `200 OK`
- **Content-Type**: `text/plain` (ou `text/plain; charset=utf-8`)
- **Corpo**: somente o número da versão, sem quebra de linha, sem JSON.

Exemplo: `1.0.0`

### Exemplos

```
GET /version
→ 200  application/json  {"version":"1.0.0","buildDate":"2026-10-07"}

GET /version?format=short
→ 200  text/plain  1.0.0

GET /version?format=unknown
→ 200  application/json  {"version":"1.0.0","buildDate":"2026-10-07"}

GET /version?format=
→ 200  application/json  {"version":"1.0.0","buildDate":"2026-10-07"}
```

### Erros

Este endpoint não produz erros de negócio. Em caso de erro interno, a aplicação retorna o tratamento padrão do Express:

- **Status**: `500 Internal Server Error`
- **Content-Type**: `application/json`
- **Corpo**: `{ "error": "Internal Server Error" }`
