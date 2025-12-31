import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// LEGADO: Este script era usado para limpeza de índices no MongoDB.
// O projeto BOVINEXT agora é 100% Supabase. Mantemos o entrypoint
// para compatibilidade, mas não executa nenhuma ação.
async function cleanupDatabase(): Promise<void> {
  try {
    console.log('[cleanupDatabase] Projeto 100% Supabase - nenhuma limpeza MongoDB necessária.');
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupDatabase();
}

export { cleanupDatabase };