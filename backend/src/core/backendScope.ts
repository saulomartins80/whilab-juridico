export const backendScopeMap = {
  platformCore: [
    'src/config/runtime.ts',
    'src/config/env.ts',
    'src/config/supabase.ts',
    'src/middlewares/*',
    'src/utils/requestContext.ts',
    'src/routes/index.ts',
    'src/services/SupabaseService.ts',
    'src/services/SupabaseWrapper.ts'
  ],
  pecuariaDomain: [
    'src/routes/bovinextRoutes.ts',
    'src/routes/optimizedChatbotRoutes.ts',
    'src/services/BovinextSupabaseServiceFixed.ts',
    'src/services/BovinextOptimizedAIService.ts',
    'src/services/BovinextAIService.ts',
    'src/controllers/*'
  ],
  legacyPagesApi: [
    'src/config/firebaseAdmin.ts',
    'pages/api/animais/*',
    'pages/api/manejos/*',
    'pages/api/producao/*',
    'pages/api/vendas/*',
    'pages/api/dashboard/*',
    'pages/api/auth/*',
    'pages/api/users/*'
  ]
} as const;

export const getBackendScopeSummary = () => ({
  platformCore: backendScopeMap.platformCore.length,
  pecuariaDomain: backendScopeMap.pecuariaDomain.length,
  legacyPagesApi: backendScopeMap.legacyPagesApi.length
});
