const https = require('https');

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

if (!SUPABASE_PROJECT_REF) {
  throw new Error('Configure SUPABASE_PROJECT_REF antes de executar este script.');
}

// SQL para criar as tabelas
const sql = `
-- Criar tabela users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    fazenda_nome VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'fazendeiro',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_chat_id ON public.chat_messages(chat_id);
`;

async function executeSQL() {
  console.log('🚀 Executando SQL no Supabase...\n');

  // Usar a conexão direta via pg (PostgreSQL)
  // Vamos tentar usar o endpoint de database do Supabase
  try {
    // Tentar usar pg se disponível
    const { Client } = require('pg');

    if (!process.env.SUPABASE_DB_PASSWORD) {
      throw new Error('Configure SUPABASE_DB_PASSWORD antes de executar este script.');
    }

    const client = new Client({
      connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres`,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    console.log('✅ Conectado ao banco de dados!');
    
    // Executar cada comando separadamente
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (const cmd of commands) {
      try {
        await client.query(cmd);
        console.log('✅ Comando executado com sucesso');
      } catch (err) {
        console.log('⚠️  Erro no comando:', err.message);
      }
    }
    
    await client.end();
    console.log('\n🏁 Configuração concluída!');
    
  } catch (err) {
    console.log('❌ Erro:', err.message);
    console.log('\n📋 O módulo pg não está instalado ou houve erro de conexão.');
    console.log('Instalando pg...');
  }
}

executeSQL().catch(console.error);
