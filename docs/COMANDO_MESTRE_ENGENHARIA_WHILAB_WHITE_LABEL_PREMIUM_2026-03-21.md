# COMANDO MESTRE DE ENGENHARIA - WHILAB WHITE-LABEL PREMIUM

Data: 2026-03-21
Responsavel: Caio
Projeto: WhiLab
Modo oficial: base SaaS white-label premium com IA operacional
Banco de dados oficial: Supabase
Referencia tecnica: Finnextho
Repositorio de execucao: WhiLab

## Leitura Obrigatoria

Este documento e a ordem operacional completa para fechar o gap atual do WhiLab e levar o produto para um estado vendavel, seguro, premium e escalavel.

Ele deve ser seguido a risca.

Nao trate este arquivo como brainstorming.
Nao trate este arquivo como wish list.
Nao trate este arquivo como lista solta de tarefas.

Trate como contrato de execucao de ponta a ponta.

## Verdade Executiva

Hoje o WhiLab ainda nao esta assinavel.

Os problemas reais atuais sao:

- falhas graves de auth e autorizacao
- build de producao do frontend ainda quebrado
- fluxo de reset de senha inconsistente
- white-label ainda preso a pecuaria em onboarding e shell autenticada
- residuos de Finnextho ainda expostos
- working tree misturando refactor valido com ruido de commit

O objetivo deste comando e transformar o WhiLab em:

- produto white-label premium de ticket alto
- base vendavel na faixa de `R$ 1.997 a R$ 2.497`
- com IA operacional supervisionada
- com rebranding rapido
- com docs honestas
- com setup previsivel
- com arquitetura sustentavel

## Tese Oficial Do Produto

O WhiLab deve ser vendido como:

- base SaaS white-label premium com IA
- shell visual premium e rebrandavel
- autenticacao solida
- dashboard serio
- modulos base reaproveitaveis
- assistente IA contextual
- automacoes supervisionadas
- docs de setup, deploy e rebranding
- demo vertical isolada

O WhiLab nao deve ser vendido como:

- clone da Finnextho
- ERP completo
- plataforma universal pronta para qualquer nicho sem ajuste
- automacao total sem supervisao
- produto sem necessidade de configuracao
- pacote com suporte ilimitado

## Relacao Com A Finnextho

Regra de ouro:

- `Finnextho` e referencia tecnica
- `WhiLab` e produto proprio

O time pode herdar da Finnextho:

- padrao de qualidade
- densidade visual premium
- disciplina de navegacao
- organizacao de modulos
- padrao de assistente IA
- padrao de notificacoes
- padrao de auditoria
- padrao de integracoes
- rigor de validacao e smoke

O time nao pode herdar da Finnextho:

- branding
- naming publico
- promessas comerciais
- residuos de copy
- banco Mongo
- fiscal pesado
- multiempresa monstro por impulso
- qualquer dependencia trazida sem tese clara

Regra tecnica:

- usar Finn como espelho
- construir no WhiLab com Supabase como base de dados oficial

## Arquitetura Canonica

### Frontend

- `Next.js + React + TypeScript`
- shell premium rebrandavel
- paginas publicas e autenticadas separadas com clareza
- roteamento previsivel
- auth UX coerente
- estados de erro visiveis
- zero dependencia de legado acidental

### Backend

- `Node.js + Express + TypeScript`
- backend como camada de orquestracao
- regras de negocio no servidor
- integracoes externas centralizadas
- auth e autorizacao verificadas no backend
- logs e erros com rastreabilidade

### Banco e Infra

- `Supabase Auth`
- `Supabase Postgres`
- `Supabase Storage`
- `Supabase RLS`
- `Supabase migrations` como verdade de schema
- `service_role` apenas no backend e com uso minimizado

### IA e Automacao

- IA contextual no backend
- prompts e ferramentas governadas
- automacao sempre com trilha de auditoria
- sugestao automatica e execucao supervisionada
- nada de prometer autonomia irrestrita

## Definicao De Produto Final

Para eu assinar o produto como premium vendavel, ele precisa entregar:

- home forte e limpa
- fluxo de auth impecavel
- dashboard com cara de produto serio
- configuracao e perfil consistentes
- assistente IA util
- automacoes claras e auditaveis
- docs de setup e deploy
- docs de rebranding
- demo vertical isolada
- narrativa comercial honesta
- zero P0 de seguranca
- zero blocker de build

## O Que Justifica Ticket Alto

O ticket de `R$ 1.997` para cima nao vem de marketing vazio.

Ele so faz sentido quando o comprador percebe:

- que nao e template cru
- que nao e repositorio baguncado
- que nao e demo fake
- que a base reduz meses de trabalho
- que a shell parece produto final
- que a autenticacao e confiavel
- que a IA agrega valor real
- que o rebranding e rapido
- que o setup esta documentado
- que a entrega tem fronteira clara

## Frentes Inegociaveis

### 1. Seguranca e Auth

Fechar antes de qualquer embelezamento:

- remover endpoints admin publicos ou protege-los com autorizacao real
- alinhar reset de senha ponta a ponta
- alinhar confirmacao de email ponta a ponta
- parar de auto-confirmar email no cadastro
- parar de provisionar assinatura `active` por default
- eliminar IDOR em updates e deletes
- limitar uso de `service_role`
- revisar CORS e seguranca de ambiente

### 2. Build, Runtime e Estabilidade

Fechar antes de chamar o produto de pronto:

- frontend build de producao verde
- backend build verde
- zero rota critica quebrada
- zero fluxo de auth inconsistente
- erro visivel no lugar de falha silenciosa
- route battery executavel

### 3. Extracao White-Label

Fechar antes de vender como white-label:

- tirar pecuaria do onboarding principal
- tirar pecuaria da shell principal
- centralizar marca e naming
- limpar manifesto, sitemap e metadata
- remover residuos de Finnextho
- deixar demo vertical isolada e explicita

### 4. Produto Premium

Fechar antes de empacotar a oferta:

- dashboard premium
- header, footer e sidebar coerentes
- configuracoes e perfil com consistencia
- pagina de suporte sem vazamento de marca
- pricing e docs alinhados
- rebranding facil por tokens e config

### 5. IA Operacional

Fechar antes de vender como IA automatizada:

- assistente contextual funcional
- escopo de IA claramente definido
- automacoes supervisionadas
- sugestoes, analise e copiloto
- trilha de auditoria por acao
- limite claro entre gerar, sugerir e executar

## Mandamentos De Engenharia

1. Nao misturar repositorios.
2. Nao copiar branding da Finnextho.
3. Nao esconder falha real com fallback cosmetico.
4. Nao chamar de automacao total o que ainda depende de humano.
5. Nao deixar rota publica sem necessidade.
6. Nao usar `service_role` para burlar ownership.
7. Nao commitar ruido de lockfile sem motivo.
8. Nao deixar mojibake, copy quebrada ou links errados.
9. Nao vender feature sem fluxo ponta a ponta.
10. Nao declarar pronto sem build, smoke e aceite.

## Ordem Canonica De Execucao

### Fase 0 - Freeze e Higiene

Objetivo:

- separar refactor valido de sujeira

Entregas:

- working tree entendido
- lockfile churn avaliado
- arquivos binarios e prints com finalidade definida
- mojibake eliminado
- estrutura de docs consolidada

### Fase 1 - Blindagem De Auth

Objetivo:

- remover riscos de takeover e fluxo quebrado de credenciais

Entregas:

- endpoints admin protegidos ou removidos
- reset password funcionando
- confirm email funcionando
- cadastro sem `email_confirm: true`
- sem `subscription_status: active` default
- guards consistentes frontend/backend

### Fase 2 - Ownership De Dados

Objetivo:

- impedir acesso cruzado entre usuarios

Entregas:

- reads, updates e deletes escopados por `user_id`
- queries de mutacao revisadas
- RLS definida onde cabivel
- testes de autorizacao cobrindo ownership

### Fase 3 - Build E Runtime

Objetivo:

- fechar producao local e pipeline de deploy

Entregas:

- frontend build verde
- backend build verde
- zero erro de page data
- `_document`, pages e modulos SSR-safe
- smoke de rotas principais

### Fase 4 - White-Label Core

Objetivo:

- transformar o produto em base rebrandavel de verdade

Entregas:

- metadados globais neutros
- manifest e sitemap coerentes
- onboarding neutro
- legal links corretos
- shell autenticada neutra
- copy centralizada

### Fase 5 - Productizacao Premium

Objetivo:

- fazer o comprador enxergar produto serio

Entregas:

- dashboard premium
- paginas publicas consistentes
- suporte limpo
- configuracoes e perfil revisados
- demo vertical isolada da proposta principal

### Fase 6 - IA E Automacao

Objetivo:

- absorver o melhor do Finn sem prometer fantasia

Entregas:

- assistente contextual forte
- sugestoes operacionais
- historico de conversas
- acoes automatizaveis com trilha
- logs de IA e fallback seguro

### Fase 7 - QA E Aceite

Objetivo:

- chegar a um estado assinavel

Entregas:

- route battery
- smoke auth
- smoke dashboard
- smoke rebranding
- validacao docs
- validacao de setup local

### Fase 8 - Embalagem Comercial

Objetivo:

- vender com conviccao sem mentir

Entregas:

- README final
- setup guide final
- deploy guide final
- rebranding guide final
- escopo comercial final
- limites da oferta final

## Estrutura De Banco No Supabase

O Supabase e a base oficial de dados do WhiLab.

Isso exige:

- migrations versionadas
- tipos sincronizados
- tabelas core separadas da demo vertical
- RLS planejada
- indices minimamente bons
- storage organizado

### Core Minimo Esperado

- `users`
- `profiles`
- `workspaces`
- `brands`
- `settings`
- `activities`
- `notifications`
- `documents`
- `subscriptions`
- `audit_logs`
- `ai_sessions`
- `ai_messages`
- `automation_runs`

### Vertical Demo

Toda tabela de nicho deve ser isolada como vertical demo.

Exemplo:

- `animais`
- `manejos`
- `producao`
- `vendas`

Essas tabelas nao podem mais definir a identidade principal do produto.

## Herdar Do Finn Com Inteligencia

O time deve puxar do Finn:

- estrutura de shell forte
- padrao de copiloto
- padrao de notificacao
- padrao de documento e auditoria
- disciplina de rotas
- densidade de dashboard
- rigor de validacao final

O time nao deve puxar do Finn:

- peso estrutural desnecessario
- naming de negocio que nao pertence ao WhiLab
- fiscal, business e multiempresa sem tese
- UX inchada
- claims de produto que o WhiLab ainda nao sustenta

## Modelo De Trabalho Dos Engenheiros

### Engenheiro 1 - Seguranca e Auth Backend

Dono de:

- `backend/src/routes/authRoutes.ts`
- `backend/src/controllers/authController.ts`
- `backend/src/services/authService.ts`
- `backend/src/middlewares/auth.ts`
- ownership e autorizacao

Entrega:

- fechar P0 de auth
- alinhar recovery flow backend
- remover defaults inseguros
- fechar IDOR

### Engenheiro 2 - Supabase, Dados e Contratos

Dono de:

- `backend/src/services/*Supabase*`
- `supabase/migrations/*`
- tipos de auth e banco
- contratos API x frontend

Entrega:

- ownership por `user_id`
- RLS e schema canonicamente alinhados
- contratos consistentes
- cleanup de legado fora do fluxo principal

### Engenheiro 3 - Frontend Core e White-Label

Dono de:

- `frontend/pages/*`
- `frontend/components/*`
- `frontend/content/*`
- `frontend/public/*`
- rotas, metadata e shell

Entrega:

- build verde
- onboarding limpo
- links legais corretos
- metadados neutros
- shell white-label coerente

### Engenheiro 4 - IA, Automacao, Produto e QA

Dono de:

- assistente IA
- automacoes
- docs de setup/deploy/rebranding
- route battery
- smoke e criterio de aceite

Entrega:

- camada IA clara e auditavel
- testes executaveis
- docs finais
- checklist de assinatura

## Criterios De Aceite Por Qualidade

So considerar o produto pronto para assinatura quando:

- `backend npm run build` passar
- `frontend npm run type-check` passar
- `frontend npm run build` passar
- auth funcionar ponta a ponta
- reset de senha funcionar
- confirmacao de email funcionar
- zero P0 de auth/autorizacao
- zero resido publico relevante de Finnextho
- onboarding principal neutro
- shell principal neutra
- demo vertical claramente isolada
- route battery passar
- docs finais sustentarem a entrega

## Checklist Final De CTO

- [ ] working tree limpo e inteligivel
- [ ] build backend verde
- [ ] build frontend verde
- [ ] route battery principal verde
- [ ] auth e recovery flow validados
- [ ] ownership validado
- [ ] white-label validado
- [ ] IA operacional validada
- [ ] docs finais validadas
- [ ] produto vendavel sem mentira

## O Que Nao Pode Faltar Na Oferta Final

- posicionamento premium claro
- escopo claro
- limite claro
- demo vertical clara
- setup claro
- rebranding claro
- IA clara
- narrativa comercial honesta

## O Que Mata O Produto

- build quebrado
- auth quebrada
- takeover possivel
- vazamento de marca antiga
- onboarding contradizendo a oferta
- shell principal ainda vertical
- docs vendendo algo que o app nao sustenta
- prometer IA total sem trilha nem governanca

## Veredito Operacional

O WhiLab so podera ser chamado de:

- `premium`
- `white-label`
- `vendavel por ticket alto`

quando este comando inteiro tiver sido executado, validado e assinado.

A referencia emocional e comercial pode ser o Finn.

A referencia tecnica de rigor tambem pode ser o Finn.

Mas a execucao deve respeitar:

- produto proprio
- arquitetura propria
- Supabase como base oficial
- narrativa honesta
- qualidade assinavel

## Ordem Final

Se houver conflito entre:

- velocidade e qualidade
- demo bonita e seguranca
- narrativa larga e verdade tecnica
- vender facil e sustentar o produto

escolha sempre:

- qualidade
- seguranca
- verdade tecnica
- produto sustentavel

Esse e o comando mestre oficial do WhiLab.
