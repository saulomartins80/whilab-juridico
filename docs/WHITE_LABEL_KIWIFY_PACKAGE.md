# White-Label Kiwify Package

Data: 2026-03-19

Nota: este documento organiza a embalagem comercial do WhiLab e a higiene de entrega. Nao substitui revisao juridica.

## Resumo Do Pacote

O WhiLab deve ser vendido como uma base SaaS white-label media, com autenticacao, dashboard, Supabase, IA basica e docs claras de rebranding.

O objetivo da embalagem e simples:

- mostrar o que o comprador recebe
- mostrar o que o comprador precisa configurar
- mostrar o que nao entra
- mostrar quais upsells fazem sentido

## O Que Entra No Pacote Base

### Entrega tecnica

- codigo-fonte da base
- frontend e backend
- autenticacao
- dashboard e shell de aplicacao
- integracao com Supabase
- camada basica de IA ou assistente
- scripts e guias de setup
- guia de deploy
- guia de rebranding

### Entrega comercial

- README enxuto e honesto
- copia da promessa comercial
- demo vertical de pecuaria
- lista de limites do produto
- FAQ com objeccoes comuns

### Entrega de uso

- login
- cadastro
- reset de senha
- dashboard principal
- perfil e configuracoes
- estados vazios e navegacao base

## O Que O Comprador Precisa Configurar

- nome, logo e cor da propria marca
- dominio e hospedagem
- projeto Supabase proprio
- chaves de API e credenciais de terceiros
- texto final da oferta
- adaptacao da demo para o nicho escolhido

## O Que Nao Entra No Pacote Cru

### Segredos e acessos

- API keys
- service role keys
- JWT secrets
- webhooks
- tokens de OAuth
- credenciais de banco
- conexoes de Redis, SMTP, Twilio, Stripe, DeepSeek ou equivalentes
- service accounts de cloud e Firebase
- acessos de deploy e registro

### Dados e ambientes

- dados de producao
- backups
- exports
- logs reais
- seeds com informacao de cliente
- credenciais de teste que funcionem em ambiente real

### Propriedade intelectual interna

- prompts privados
- regras proprietarias de negocio
- heuristicas internas
- scripts de automacao de uso interno
- playbooks de suporte
- documentos de operacao nao destinados ao comprador

### Marca e ativos visuais

- logos
- fonts
- icones
- imagens
- videos
- screenshots
- depoimentos
- textos de vendas de terceiros sem permissao

### Juridico e comercial

- contratos internos
- textos de licenca nao formalizada
- termos de uso escritos para outra marca
- claims de propriedade ou parceria nao validada

## Estrutura Da Pagina De Venda

1. Hero com promessa de base SaaS white-label media
2. Prova visual com dashboard, auth e demo vertical
3. Bloco "o que voce recebe"
4. Bloco "o que voce precisa configurar"
5. Bloco "o que nao entra"
6. Bloco de precificacao
7. Bloco de upsells
8. FAQ com limites reais

## Upsells Recomendados

- instalacao assistida
- rebranding completo
- adaptacao por nicho
- integracao extra com IA ou automacao
- acompanhamento curto de onboarding

## Regras De Copy

- nao vender como produto pronto para qualquer nicho
- nao prometer suporte infinito
- nao sugerir licenca juridica nao formalizada
- nao esconder que o comprador vai configurar marca e ambiente
- nao misturar demo de pecuaria com identidade permanente do produto

## Checklist De Higiene Antes De Publicar

- trocar toda referencia publica de marca antiga
- sanitizar `env.example` e remover valores reais
- confirmar que links e metatags apontam para a nova marca
- revisar direitos de qualquer asset que acompanhe o pacote
- separar claramente demo de produto base
- garantir que a pagina de vendas nao prometa mais do que a entrega cobre
- deixar a oferta legivel sem depender do contexto historico do repo

## Resultado Esperado

O pacote para a Kiwify deve parecer uma base profissional, enxuta e transparente. O comprador precisa enxergar rebranding, customizacao e limites reais sem receber segredo, confusao de marca ou promessa excessiva.
