const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de executar este script.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('ðŸš€ Iniciando configuraÃ§Ã£o do banco de dados WHILAB...\n');

  // SQL para criar as tabelas essenciais
  const tables = [
    {
      name: 'users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          firebase_uid VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          display_name VARCHAR(255),
          fazenda_nome VARCHAR(255),
          fazenda_area DECIMAL(10,2),
          fazenda_localizacao TEXT,
          tipo_criacao VARCHAR(50),
          experiencia_anos INTEGER,
          subscription_plan VARCHAR(50) DEFAULT 'fazendeiro',
          subscription_status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'chat_messages',
      sql: `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          chat_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
          content TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}',
          expires_at TIMESTAMP WITH TIME ZONE,
          is_important BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
  ];

  // Testar conexÃ£o primeiro
  console.log('ðŸ“¡ Testando conexÃ£o com Supabase...');
  
  try {
    // Tentar listar tabelas existentes
    const { data: existingTables, error: listError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (listError && listError.code === '42P01') {
      console.log('âš ï¸  Tabela users nÃ£o existe. Criando...\n');
    } else if (listError) {
      console.log('âš ï¸  Erro ao verificar tabelas:', listError.message);
    } else {
      console.log('âœ… Tabela users jÃ¡ existe!\n');
    }

    // Verificar chat_messages
    const { data: chatData, error: chatError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);
    
    if (chatError && chatError.code === '42P01') {
      console.log('âš ï¸  Tabela chat_messages nÃ£o existe.\n');
    } else if (!chatError) {
      console.log('âœ… Tabela chat_messages jÃ¡ existe!\n');
    }

  } catch (err) {
    console.log('Erro de conexÃ£o:', err.message);
  }

  console.log('\nðŸ“‹ Status das tabelas:');
  console.log('   Para criar as tabelas, execute o SQL em:');
    console.log(`   ${process.env.SUPABASE_SQL_EDITOR_URL || 'https://supabase.com/dashboard/project/<seu-projeto>/sql'}\n`);
  
  // Testar se podemos inserir um usuÃ¡rio de teste
  console.log('ðŸ§ª Tentando verificar estrutura da tabela users...');
  
  const { data: usersCheck, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(0);

  if (usersError) {
    console.log('âŒ Tabela users precisa ser criada.');
    console.log('   CÃ³digo do erro:', usersError.code);
    console.log('   Mensagem:', usersError.message);
    console.log('\nðŸ“ Execute o seguinte SQL no Supabase Dashboard:\n');
    console.log('------ COPIE ABAIXO ------\n');
    console.log(`
CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS chat_messages (
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

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_chat_id ON chat_messages(chat_id);
    `);
    console.log('\n------ FIM DO SQL ------\n');
  } else {
    console.log('âœ… Tabela users estÃ¡ acessÃ­vel!');
  }

  // Verificar chat_messages tambÃ©m
  const { data: chatCheck, error: chatCheckError } = await supabase
    .from('chat_messages')
    .select('*')
    .limit(0);

  if (chatCheckError) {
    console.log('âŒ Tabela chat_messages precisa ser criada.');
  } else {
    console.log('âœ… Tabela chat_messages estÃ¡ acessÃ­vel!');
  }

  console.log('\nðŸ VerificaÃ§Ã£o concluÃ­da.');
}

setupDatabase().catch(console.error);

