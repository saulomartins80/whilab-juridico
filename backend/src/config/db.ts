// LEGADO: Conexão com MongoDB removida. Projeto 100% Supabase.
// Mantido apenas para compatibilidade com imports antigos.
// Esta função agora é um no-op.

import * as dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  if (process.env.MONGO_URI) {
    console.warn('[connectDB] Aviso: MONGO_URI detectada, mas o projeto usa 100% Supabase. Ignorando conexão MongoDB.');
  }
  return Promise.resolve();
};

export default connectDB;