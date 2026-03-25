const { Client } = require('pg');

// ConfiguraÃ§Ã£o do Supabase Database
// VocÃª pode encontrar essas credenciais em: Supabase Dashboard > Settings > Database
const SUPABASE_PROJECT_REF = 'jygspicbqnbriafmcufc';

// Tentar diferentes mÃ©todos de conexÃ£o
async function createTables() {
  console.log('ðŸš€ Criando tabelas no Supabase WHILAB...\n');

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
  // A senha do banco estÃ¡ disponÃ­vel no Dashboard > Settings > Database > Connection string
  
  // Usar variÃ¡vel de ambiente ou pedir ao usuÃ¡rio
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
  
  if (!dbPassword) {
    console.log('âŒ Senha do banco de dados nÃ£o fornecida.\n');
    console.log('ðŸ“‹ Para obter a senha do banco:');
    console.log('   1. Acesse: https://supabase.com/dashboard/project/jygspicbqnbriafmcufc/settings/database');
    console.log('   2. Copie a senha do banco (Database password)');
    console.log('   3. Execute: node scripts/create-tables.js SUA_SENHA_AQUI\n');
    console.log('Ou defina a variÃ¡vel: $env:SUPABASE_DB_PASSWORD = "230689Scm@saulo"');
    return;
  }

  // Connection string usando Transaction Pooler (recomendado para serverless)
  const connectionString = `postgresql://postgres.${SUPABASE_PROJECT_REF}:${dbPassword}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('ðŸ“¡ Conectando ao Supabase...');
    await client.connect();
    console.log('âœ… Conectado!\n');

    // Criar tabela users
    console.log('ðŸ“¦ Criando tabela users...');
    await client.query(createUsersTable);
    console.log('âœ… Tabela users criada!\n');

    // Criar tabela chat_messages
    console.log('ðŸ“¦ Criando tabela chat_messages...');
    await client.query(createChatMessagesTable);
    console.log('âœ… Tabela chat_messages criada!\n');

    // Criar Ã­ndices
    console.log('ðŸ“¦ Criando Ã­ndices...');
    const indexCommands = createIndexes.split(';').filter(cmd => cmd.trim());
    for (const cmd of indexCommands) {
      await client.query(cmd);
    }
    console.log('âœ… Ãndices criados!\n');

    // Verificar tabelas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'chat_messages')
    `);
    
    console.log('ðŸ“‹ Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`   âœ… ${row.table_name}`);
    });

    console.log('\nðŸŽ‰ Banco de dados configurado com sucesso!');

  } catch (err) {
    console.error('âŒ Erro:', err.message);
    
    if (err.message.includes('password authentication failed')) {
      console.log('\nâš ï¸  Senha incorreta. Verifique a senha no Dashboard do Supabase.');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.log('\nâš ï¸  NÃ£o foi possÃ­vel conectar ao servidor. Verifique sua conexÃ£o de internet.');
    }
  } finally {
    await client.end();
  }
}

createTables().catch(console.error);

