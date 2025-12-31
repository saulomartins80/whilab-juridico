const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jygspicbqnbriafmcufc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5Z3NwaWNicW5icmlhZm1jdWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA1ODU3OSwiZXhwIjoyMDgyNjM0NTc5fQ.4aDBFQh84qIzo9uvSH8TMwdCwqt6I8Ji06MLvAcfH8o';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados BOVINEXT...\n');

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

  // Testar conexão primeiro
  console.log('📡 Testando conexão com Supabase...');
  
  try {
    // Tentar listar tabelas existentes
    const { data: existingTables, error: listError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (listError && listError.code === '42P01') {
      console.log('⚠️  Tabela users não existe. Criando...\n');
    } else if (listError) {
      console.log('⚠️  Erro ao verificar tabelas:', listError.message);
    } else {
      console.log('✅ Tabela users já existe!\n');
    }

    // Verificar chat_messages
    const { data: chatData, error: chatError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1);
    
    if (chatError && chatError.code === '42P01') {
      console.log('⚠️  Tabela chat_messages não existe.\n');
    } else if (!chatError) {
      console.log('✅ Tabela chat_messages já existe!\n');
    }

  } catch (err) {
    console.log('Erro de conexão:', err.message);
  }

  console.log('\n📋 Status das tabelas:');
  console.log('   Para criar as tabelas, execute o SQL em:');
  console.log('   https://supabase.com/dashboard/project/jygspicbqnbriafmcufc/sql\n');
  
  // Testar se podemos inserir um usuário de teste
  console.log('🧪 Tentando verificar estrutura da tabela users...');
  
  const { data: usersCheck, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(0);

  if (usersError) {
    console.log('❌ Tabela users precisa ser criada.');
    console.log('   Código do erro:', usersError.code);
    console.log('   Mensagem:', usersError.message);
    console.log('\n📝 Execute o seguinte SQL no Supabase Dashboard:\n');
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
    console.log('✅ Tabela users está acessível!');
  }

  // Verificar chat_messages também
  const { data: chatCheck, error: chatCheckError } = await supabase
    .from('chat_messages')
    .select('*')
    .limit(0);

  if (chatCheckError) {
    console.log('❌ Tabela chat_messages precisa ser criada.');
  } else {
    console.log('✅ Tabela chat_messages está acessível!');
  }

  console.log('\n🏁 Verificação concluída.');
}

setupDatabase().catch(console.error);
