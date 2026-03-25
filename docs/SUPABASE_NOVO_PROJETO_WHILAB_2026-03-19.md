# SUPABASE NOVO PROJETO - WHILAB

Data: 2026-03-19
Responsavel: Caio

## Decisao

O WhiLab deve usar um projeto Supabase novo e exclusivo.

Nao vamos reaproveitar projeto antigo nem misturar credenciais com outro ativo.

## Objetivo Do Ambiente

O ambiente Supabase existe para sustentar a versao white-label media do WhiLab com isolamento de marca, seguranca e previsibilidade de entrega.

## Contrato De Variaveis

### Frontend

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

### Observacao

As chaves publicas e privadas devem ser documentadas separadamente e nunca compartilhadas no pacote cru.

## URLs E Redirects

Use URLs de desenvolvimento somente como referencia local. Em producao, a oferta precisa apontar para o dominio final do comprador.

Exemplo de configuracao local usada no setup atual:

- `site_url`: `http://localhost:3001`
- allow list com:
  - `http://localhost:3001`
  - `http://127.0.0.1:3001`
  - `http://localhost:3001/auth/update-password`
  - `http://127.0.0.1:3001/auth/update-password`
  - `http://localhost:3001/auth/complete-registration`
  - `http://127.0.0.1:3001/auth/complete-registration`
  - `http://localhost:3001/auth/change-password`
  - `http://127.0.0.1:3001/auth/change-password`

## O Que Deve Ser Documentado Para Handoff

- nome do projeto Supabase
- URL publica e anon key
- service role key isolada
- schema aplicado
- regras de auth
- rotas de reset e confirmacao
- estrategia de seeds de demo
- limites de acesso por ambiente

## Politica De Seguranca

- nao incluir dados reais de producao
- nao embutir secrets em README
- nao reutilizar service accounts de outro projeto
- nao misturar seed de demo com dados verdadeiros
- nao publicar credenciais de teste que tenham impacto real em ambiente externo

## Checklist De Validacao

Antes de entregar a base:

- auth precisa responder corretamente
- o schema precisa estar aplicado
- as tabelas principais precisam responder via API
- o fluxo de reset de senha precisa bater com a rota do frontend
- o comprador precisa entender o que vem pronto e o que ainda depende de setup

## Nota De Operacao

O retorno comercial do WhiLab depende de o Supabase parecer parte do produto, nao um bloqueio silencioso.

Por isso, a documentacao precisa deixar muito claro:

- o que e do projeto
- o que e do comprador
- o que e do ambiente local
- o que e da producao final
