import dotenv from 'dotenv';
import path from 'path';

// Carrega variÃ¡veis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// LEGADO: Este script era usado para limpeza de Ã­ndices no MongoDB.
// O projeto WHILAB agora Ã© 100% Supabase. Mantemos o entrypoint
// para compatibilidade, mas nÃ£o executa nenhuma aÃ§Ã£o.
async function cleanupDatabase(): Promise<void> {
  try {
    console.log('[cleanupDatabase] Projeto 100% Supabase - nenhuma limpeza MongoDB necessÃ¡ria.');
  } catch (error) {
    console.error('âŒ Erro durante limpeza:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupDatabase();
}

export { cleanupDatabase };
