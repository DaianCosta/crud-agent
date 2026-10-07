# Arquitetura — Endpoint de saúde com versão

## Visão geral

Adicionar o endpoint `GET /version` à API Express existente. É uma rota pura, sem estado, sem banco de dados,
sem autenticação. Lê a versão do `package.json` e a data do build de uma variável de ambiente (`BUILD_DATE`).

## Componentes

### 1. Rota `version.routes.ts`

Arquivo: `back-end/src/routes/version.routes.ts`

Registra `GET /version` no Express. Importa `versionController`.

### 2. Controlador `version.controller.ts`

Arquivo: `back-end/src/controllers/version.controller.ts`

Contém o handler do endpoint. Lógica:

1. Lê `version` do `package.json` (importado com `resolveJsonModule`).
2. Lê `buildDate` de `process.env.BUILD_DATE` (fallback: data atual em ISO 8601, só o dia: `YYYY-MM-DD`).
3. Se `req.query.format === 'short'`, responde `text/plain` com a versão apenas (sem quebra de linha).
4. Caso contrário (inclusive `format=unknown`), responde JSON `{ version, buildDate }`.

Não há camada de serviço nem repositório — o endpoint é simples demais para justificar essa indireção.

### 3. Registro em `app.ts`

Adicionar `import { versionRouter } from './routes/version.routes'` e `app.use(versionRouter)` (sem prefixo,
a rota já é `/version`).

## Fluxo principal

```
Cliente  ──GET /version──▶  Express  ──▶  version.routes  ──▶  version.controller
                                                                   ├─ lê package.json (version)
                                                                   ├─ lê process.env.BUILD_DATE
                                                                   └─ responde JSON ou text/plain
```

## Mapeamento AC → componente

| AC   | Componente(s)                      |
|------|------------------------------------|
| AC-1 | version.controller (res.json)      |
| AC-2 | version.controller (campos version e buildDate) |
| AC-3 | version.controller (import package.json) |
| AC-4 | version.controller (res.type('text/plain')) |
| AC-5 | version.controller (res.send sem \n) |
| AC-6 | version.controller (else → JSON)   |

## Front-end

Nenhum: não há alterações de front-end.

## Plano de implementação

### Backend (back-end/)

1. Criar `src/controllers/version.controller.ts` com o handler descrito acima.
2. Criar `src/routes/version.routes.ts` registrando `GET /version`.
3. Alterar `src/app.ts` para importar e montar `versionRouter`.
4. Criar `tests/integration/version.routes.spec.ts` com testes para AC-1 a AC-6.

### Frontend

Sem alterações.

## Como rodar

### Testes

```bash
cd back-end
npm test
```

### Verificação de tipos

```bash
cd back-end
npx tsc --noEmit
```

### Iniciar a aplicação

```bash
cd back-end
npm run dev
# ou em produção:
npm run build && npm start
```

## Variáveis de ambiente

| Variável     | Obrigatória | Padrão           | Descrição                        |
|-------------|-------------|------------------|----------------------------------|
| `PORT`      | Não         | `3000`           | Porta do servidor HTTP           |
| `BUILD_DATE`| Não         | Data atual (ISO) | Data do build, definida no CI/CD |
