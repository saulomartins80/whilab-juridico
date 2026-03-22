# Deploy no Render - WhiLab Frontend

## Configuracao principal

- Servico: `whilab-frontend`
- Environment: `Node`
- Build Command: `npm install && npm run build:render`
- Start Command: `npm start`
- Health Check: `/`

## Variaveis obrigatorias

- `NODE_ENV=production`
- `NEXT_PUBLIC_BRAND_NAME=WhiLab`
- `NEXT_PUBLIC_BRAND_SLUG=whilab`
- `NEXT_PUBLIC_CANONICAL_HOST=whilab.com.br`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Observacoes de producao

- O frontend nao deve publicar links com fallback para `localhost`.
- O dominio canonico deve apontar para `https://whilab.com.br`.
- Se houver backend separado, defina `NEXT_PUBLIC_API_URL` para a URL publica real.
- Revise favicon, capa e assets antes do go-live final.
