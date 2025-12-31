const { Client } = require('pg');

// Configuração do Supabase Database
// Você pode encontrar essas credenciais em: Supabase Dashboard > Settings > Database
const SUPABASE_PROJECT_REF = 'jygspicbqnbriafmcufc';

// Tentar diferentes métodos de conexão
async function createTables() {
  console.log('🚀 Criando tabelas no Supabase BOVINEXT...\n');

  // SQL para criar as tabelas
  const createUsersTable = `
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
    )
  `;

  const createChatMessagesTable = `
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
    )
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users(firebase_uid);
    CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
    CREATE INDEX IF NOT EXISTS idx_chat_user_id ON public.chat_messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_chat_id ON public.chat_messages(chat_id)
  `;

  // Tentar conectar usando a connection string do pooler
  // A senha do banco está disponível no Dashboard > Settings > Database > Connection string
  
  // Usar variável de ambiente ou pedir ao usuário
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
  
  if (!dbPassword) {
    console.log('❌ Senha do banco de dados não fornecida.\n');
    console.log('📋 Para obter a senha do banco:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/jygspicbqnbriafmcufc/settings/database');
    console.log('   2. Copie a senha do banco (Database password)');
    console.log('   3. Execute: node scripts/create-tables.js SUA_SENHA_AQUI\n');
    console.log('Ou defina a variável: $env:SUPABASE_DB_PASSWORD = "230689Scm@saulo"');
    return;
  }

  // Connection string usando Transaction Pooler (recomendado para serverless)
  const connectionString = `postgresql://postgres.${SUPABASE_PROJECT_REF}:${dbPassword}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📡 Conectando ao Supabase...');
    await client.connect();
    console.log('✅ Conectado!\n');

    // Criar tabela users
    console.log('📦 Criando tabela users...');
    await client.query(createUsersTable);
    console.log('✅ Tabela users criada!\n');

    // Criar tabela chat_messages
    console.log('📦 Criando tabela chat_messages...');
    await client.query(createChatMessagesTable);
    console.log('✅ Tabela chat_messages criada!\n');

    // Criar índices
    console.log('📦 Criando índices...');
    const indexCommands = createIndexes.split(';').filter(cmd => cmd.trim());
    for (const cmd of indexCommands) {
      await client.query(cmd);
    }
    console.log('✅ Índices criados!\n');

    // Verificar tabelas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'chat_messages')
    `);
    
    console.log('📋 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    console.log('\n🎉 Banco de dados configurado com sucesso!');

  } catch (err) {
    console.error('❌ Erro:', err.message);
    
    if (err.message.includes('password authentication failed')) {
      console.log('\n⚠️  Senha incorreta. Verifique a senha no Dashboard do Supabase.');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.log('\n⚠️  Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
    }
  } finally {
    await client.end();
  }
}

createTables().catch(console.error);
