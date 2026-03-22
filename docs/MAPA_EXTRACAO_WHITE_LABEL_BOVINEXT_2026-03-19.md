# MAPA DE EXTRACAO WHITE-LABEL - BOVINEXT

Data: 2026-03-19
Responsavel: Caio

## Objetivo

Transformar o BoviNext em uma base SaaS white-label media, reaproveitando o que tem valor de plataforma e isolando o que ainda esta preso ao nicho pecuaria.

## Regra De Decisao

- manter o que serve como infraestrutura generica
- adaptar o que ainda carrega marca, texto ou contexto antigo
- aposentar o que expoe risco comercial, juridico ou tecnico

## Manter

### Plataforma

- stack `Next.js + React + TypeScript`
- stack `Node.js + Express + TypeScript`
- integracao com `Supabase`
- base de autenticacao
- shell de dashboard
- camada de IA ou assistente
- scripts genericos de banco e configuracao
- docs de setup, deploy e rebranding

### Operacao

- estrutura de monorepo com `frontend/` e `backend/`
- padrao de config por ambiente
- guias de onboarding tecnico
- documentos de venda e embalagem comercial

## Adaptar

### Superficie publica

- nome do produto
- home e hero
- beneficios e prova
- pricing
- FAQ
- CTAs
- metatags e compartilhamento

### App

- header, footer e sidebar
- tokens de tema
- textos de login e onboarding
- perfil e configuracoes
- mensagens de estado vazio
- textos da demo

### Comercial

- README
- pacote Kiwify
- escopo da oferta
- estrutura de upsell
- garantia e limites de suporte

## Aposentar

- residuos de marcas antigas fora do contexto de demo
- promessa de licenca indefinida
- claims de que o produto serve para qualquer nicho sem ajuste
- mocks e placeholders que parecam producao
- segredos e chaves no codigo
- qualquer texto que misture propriedade intelectual sem definicao
- docs internos que nao devam ir para o comprador

## Teste Pratico De Extracao

Se um comprador trocar o nome, a cor e o nicho em poucas horas e continuar entendendo o pacote, a extracao esta boa.

Se o texto ainda depender de contexto antigo, a extracao ainda nao acabou.

## Ordem De Execucao

1. limpeza de marca, licenca e narrativa publica
2. unificacao da shell visual white-label
3. separacao entre core e demo vertical
4. saneamento da superficie de API
5. consolidacao da oferta comercial final

## Supabase

Para o BoviNext nascer separado da Finnextho, a recomendacao correta e usar credenciais exclusivas.

O conjunto minimo esperado e:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Opcional conforme operacao:

- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_SQL_EDITOR_URL`

## Decisao Executiva

O projeto deve continuar como extracao orientada por plataforma, nao como remendo em cima do BoviNext bruto.
