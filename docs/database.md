# Modelo de dados — Endpoint de saúde com versão

## Decisão

Não há persistência de dados. O endpoint `GET /version` lê a versão do `package.json` e a data do build
de uma variável de ambiente. Nenhuma tabela, migration ou conexão com banco é necessária.
