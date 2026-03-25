const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de executar este script.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tabelas necessÃ¡rias para o WHILAB
const requiredTables = [
  'users',
  'chat_messages',
  'animais',      // Rebanho
  'manejos',      // Manejo sanitÃ¡rio
  'vendas',       // Vendas de gado
  'producao',     // ProduÃ§Ã£o
  'transacoes',   // TransaÃ§Ãµes financeiras
  'metas',        // Metas
  'investimentos' // Investimentos
];

async function checkTables() {
  console.log('ðŸ” Verificando tabelas no Supabase WHILAB...\n');
  
  const results = { existing: [], missing: [] };
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);
      
      if (error && error.code === 'PGRST205') {
        results.missing.push(table);
        console.log(`âŒ ${table} - NÃƒO EXISTE`);
      } else if (error) {
        console.log(`âš ï¸  ${table} - Erro: ${error.message}`);
        results.missing.push(table);
      } else {
        results.existing.push(table);
        console.log(`âœ… ${table} - OK`);
      }
    } catch (err) {
      console.log(`âŒ ${table} - Erro: ${err.message}`);
      results.missing.push(table);
    }
  }
  
  console.log('\nðŸ“Š Resumo:');
  console.log(`   âœ… Existentes: ${results.existing.length}`);
  console.log(`   âŒ Faltando: ${results.missing.length}`);
  
  if (results.missing.length > 0) {
    console.log('\nðŸ“‹ Tabelas que precisam ser criadas:');
    results.missing.forEach(t => console.log(`   - ${t}`));
    
    console.log('\nðŸ“ SQL para criar tabelas faltantes:\n');
    console.log('------ COPIE E EXECUTE NO SUPABASE SQL EDITOR ------\n');
    
    // Gerar SQL para tabelas faltantes
    const sqlStatements = [];
    
    if (results.missing.includes('animais')) {
      sqlStatements.push(`
CREATE TABLE IF NOT EXISTS animais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brinco VARCHAR(50) NOT NULL,
    raca VARCHAR(100) NOT NULL,
    sexo VARCHAR(10) CHECK (sexo IN ('macho', 'femea')),
    data_nascimento DATE,
    peso_nascimento DECIMAL(8,2),
    peso_atual DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'ativo',
    lote VARCHAR(100),
    pasto VARCHAR(100),
    categoria VARCHAR(50),
    valor_compra DECIMAL(12,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }
    
    if (results.missing.includes('manejos')) {
      sqlStatements.push(`
CREATE TABLE IF NOT EXISTS manejos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    tipo_manejo VARCHAR(50) NOT NULL,
    data_manejo DATE NOT NULL,
    observacoes TEXT,
    custo DECIMAL(10,2),
    veterinario VARCHAR(255),
    produto_usado VARCHAR(255),
    dosagem VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }
    
    if (results.missing.includes('vendas')) {
      sqlStatements.push(`
CREATE TABLE IF NOT EXISTS vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comprador VARCHAR(255) NOT NULL,
    tipo_venda VARCHAR(20),
    peso_total DECIMAL(10,2),
    preco_arroba DECIMAL(8,2),
    valor_total DECIMAL(12,2) NOT NULL,
    data_venda DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }
    
    if (results.missing.includes('producao')) {
      sqlStatements.push(`
CREATE TABLE IF NOT EXISTS producao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    tipo_producao VARCHAR(50),
    data_producao DATE NOT NULL,
    peso DECIMAL(8,2),
    custo_producao DECIMAL(10,2),
    receita DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }
    
    if (results.missing.includes('transacoes')) {
      sqlStatements.push(`
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria VARCHAR(100) NOT NULL,
    conta VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    forma_pagamento VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }
    
    if (results.missing.includes('metas')) {
      sqlStatements.push(`
CREATE TABLE IF NOT EXISTS metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nome_da_meta VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor_total DECIMAL(12,2) NOT NULL,
    valor_atual DECIMAL(12,2) DEFAULT 0,
    data_conclusao DATE NOT NULL,
    categoria VARCHAR(50),
    prioridade VARCHAR(20) DEFAULT 'media',
    concluida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }
    
    if (results.missing.includes('investimentos')) {
      sqlStatements.push(`
CREATE TABLE IF NOT EXISTS investimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data DATE NOT NULL,
    instituicao VARCHAR(255),
    rentabilidade DECIMAL(8,4),
    vencimento DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
    }
    
    console.log(sqlStatements.join('\n'));
    console.log('\n------ FIM DO SQL ------\n');
  }
  
  return results;
}

checkTables().catch(console.error);

