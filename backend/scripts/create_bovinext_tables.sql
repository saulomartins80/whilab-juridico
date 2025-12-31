-- =====================================================
-- BOVINEXT - CRIAÇÃO DE TABELAS NO SUPABASE
-- Script para criar todas as tabelas necessárias
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USUÁRIOS E FAZENDAS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    fazenda_nome VARCHAR(255) NOT NULL,
    fazenda_area DECIMAL(10,2), -- hectares
    fazenda_localizacao TEXT,
    tipo_criacao VARCHAR(50), -- 'corte', 'leite', 'misto'
    experiencia_anos INTEGER,
    subscription_plan VARCHAR(50) DEFAULT 'fazendeiro',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ANIMAIS (REBANHO)
-- =====================================================

CREATE TABLE IF NOT EXISTS animais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brinco VARCHAR(50) NOT NULL,
    raca VARCHAR(100) NOT NULL,
    sexo VARCHAR(10) CHECK (sexo IN ('macho', 'femea')),
    data_nascimento DATE,
    peso_nascimento DECIMAL(8,2),
    peso_atual DECIMAL(8,2),
    mae_id UUID REFERENCES animais(id),
    pai_id UUID REFERENCES animais(id),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'vendido', 'morto', 'transferido')),
    lote VARCHAR(100),
    pasto VARCHAR(100),
    categoria VARCHAR(50), -- 'bezerro', 'novilho', 'boi', 'bezerra', 'novilha', 'vaca'
    valor_compra DECIMAL(12,2),
    custo_acumulado DECIMAL(12,2) DEFAULT 0,
    observacoes TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brinco)
);

-- =====================================================
-- 3. MANEJOS
-- =====================================================

CREATE TABLE IF NOT EXISTS manejos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    tipo_manejo VARCHAR(50) NOT NULL, -- 'vacinacao', 'vermifugacao', 'pesagem', 'reproducao', 'tratamento'
    data_manejo DATE NOT NULL,
    observacoes TEXT,
    custo DECIMAL(10,2),
    veterinario VARCHAR(255),
    produto_usado VARCHAR(255),
    dosagem VARCHAR(100),
    proxima_aplicacao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. VENDAS
-- =====================================================

CREATE TABLE IF NOT EXISTS vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comprador VARCHAR(255) NOT NULL,
    tipo_venda VARCHAR(20) CHECK (tipo_venda IN ('frigorifico', 'leilao', 'direto')),
    peso_total DECIMAL(10,2) NOT NULL,
    preco_arroba DECIMAL(8,2) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    data_venda DATE NOT NULL,
    data_entrega DATE,
    funrural DECIMAL(10,2),
    icms DECIMAL(10,2),
    outros_impostos DECIMAL(10,2),
    lucro_liquido DECIMAL(12,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento vendas-animais
CREATE TABLE IF NOT EXISTS vendas_animais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(venda_id, animal_id)
);

-- =====================================================
-- 5. PRODUÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS producao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    tipo_producao VARCHAR(50) CHECK (tipo_producao IN ('nascimento', 'desmame', 'engorda', 'reproducao')),
    data_producao DATE NOT NULL,
    peso DECIMAL(8,2),
    ganho_medio_diario DECIMAL(6,3), -- GMD em kg/dia
    custo_producao DECIMAL(10,2) NOT NULL,
    receita DECIMAL(10,2),
    margem_lucro DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TRANSAÇÕES FINANCEIRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL, -- Firebase UID
    valor DECIMAL(12,2) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa', 'transferencia')),
    categoria VARCHAR(100) NOT NULL,
    conta VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    forma_pagamento VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. INVESTIMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS investimentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL, -- Firebase UID
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data DATE NOT NULL,
    instituicao VARCHAR(255),
    rentabilidade DECIMAL(8,4),
    vencimento DATE,
    liquidez VARCHAR(50),
    risco VARCHAR(50),
    categoria VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. METAS
-- =====================================================

CREATE TABLE IF NOT EXISTS metas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nome_da_meta VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor_total DECIMAL(12,2) NOT NULL,
    valor_atual DECIMAL(12,2) DEFAULT 0,
    data_conclusao DATE NOT NULL,
    categoria VARCHAR(50) CHECK (categoria IN ('vendas', 'producao', 'reproducao', 'ganho_peso', 'expansao', 'melhoramento')),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
    unidade VARCHAR(20) DEFAULT 'reais' CHECK (unidade IN ('reais', 'kg', 'cabecas', 'percentual')),
    tipo_animal VARCHAR(50) DEFAULT 'bovino',
    lote_alvo VARCHAR(100),
    concluida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. CHAT MESSAGES (IA CONVERSACIONAL BOVI)
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id VARCHAR(255) NOT NULL, -- ID da conversa
    user_id VARCHAR(255) NOT NULL, -- Firebase UID do usuário
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}', -- Metadados da mensagem (análise, confiança, etc.)
    expires_at TIMESTAMP WITH TIME ZONE, -- Data de expiração da mensagem
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. PREÇOS DE MERCADO
-- =====================================================

CREATE TABLE IF NOT EXISTS precos_mercado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_preco DATE NOT NULL,
    preco_arroba DECIMAL(8,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'boi_gordo', 'vaca_gorda', 'novilho'
    regiao VARCHAR(100) NOT NULL,
    fonte VARCHAR(100) NOT NULL, -- 'cepea', 'b3', 'scot'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(data_preco, categoria, regiao, fonte)
);

-- =====================================================
-- 11. ALERTAS E NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(50) NOT NULL, -- 'vacinacao', 'pesagem', 'mercado', 'reproducao'
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    data_alerta TIMESTAMP WITH TIME ZONE NOT NULL,
    lido BOOLEAN DEFAULT FALSE,
    enviado_whatsapp BOOLEAN DEFAULT FALSE,
    animal_id UUID REFERENCES animais(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Usuários
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Animais
CREATE INDEX IF NOT EXISTS idx_animais_user_id ON animais(user_id);
CREATE INDEX IF NOT EXISTS idx_animais_brinco ON animais(user_id, brinco);
CREATE INDEX IF NOT EXISTS idx_animais_status ON animais(status);
CREATE INDEX IF NOT EXISTS idx_animais_lote ON animais(lote);

-- Manejos
CREATE INDEX IF NOT EXISTS idx_manejos_user_id ON manejos(user_id);
CREATE INDEX IF NOT EXISTS idx_manejos_animal_id ON manejos(animal_id);
CREATE INDEX IF NOT EXISTS idx_manejos_data ON manejos(data_manejo);
CREATE INDEX IF NOT EXISTS idx_manejos_tipo ON manejos(tipo_manejo);

-- Vendas
CREATE INDEX IF NOT EXISTS idx_vendas_user_id ON vendas(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);

-- Produção
CREATE INDEX IF NOT EXISTS idx_producao_user_id ON producao(user_id);
CREATE INDEX IF NOT EXISTS idx_producao_animal_id ON producao(animal_id);
CREATE INDEX IF NOT EXISTS idx_producao_data ON producao(data_producao);

-- Transações
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria);

-- Investimentos
CREATE INDEX IF NOT EXISTS idx_investimentos_user_id ON investimentos(user_id);
CREATE INDEX IF NOT EXISTS idx_investimentos_data ON investimentos(data);
CREATE INDEX IF NOT EXISTS idx_investimentos_tipo ON investimentos(tipo);

-- Chat BOVI
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_expires_at ON chat_messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_user_chat ON chat_messages(user_id, chat_id);

-- Alertas
CREATE INDEX IF NOT EXISTS idx_alertas_user_id ON alertas(user_id);
CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas(data_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_lido ON alertas(lido);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_animais_updated_at ON animais;
CREATE TRIGGER update_animais_updated_at BEFORE UPDATE ON animais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manejos_updated_at ON manejos;
CREATE TRIGGER update_manejos_updated_at BEFORE UPDATE ON manejos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendas_updated_at ON vendas;
CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_producao_updated_at ON producao;
CREATE TRIGGER update_producao_updated_at BEFORE UPDATE ON producao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transacoes_updated_at ON transacoes;
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investimentos_updated_at ON investimentos;
CREATE TRIGGER update_investimentos_updated_at BEFORE UPDATE ON investimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_metas_updated_at ON metas;
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================

-- View: Resumo do Rebanho por Usuário
CREATE OR REPLACE VIEW vw_resumo_rebanho AS
SELECT
    u.id as user_id,
    u.fazenda_nome,
    COUNT(a.id) as total_animais,
    COUNT(CASE WHEN a.sexo = 'macho' THEN 1 END) as machos,
    COUNT(CASE WHEN a.sexo = 'femea' THEN 1 END) as femeas,
    COUNT(CASE WHEN a.status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN a.status = 'vendido' THEN 1 END) as vendidos,
    AVG(a.peso_atual) as peso_medio,
    SUM(a.custo_acumulado) as custo_total
FROM users u
LEFT JOIN animais a ON u.id = a.user_id
GROUP BY u.id, u.fazenda_nome;

-- View: Performance de Vendas
CREATE OR REPLACE VIEW vw_performance_vendas AS
SELECT
    u.id as user_id,
    u.fazenda_nome,
    DATE_TRUNC('month', v.data_venda) as mes_venda,
    COUNT(v.id) as total_vendas,
    SUM(v.peso_total) as peso_vendido,
    SUM(v.valor_total) as receita_total,
    SUM(v.lucro_liquido) as lucro_total,
    AVG(v.preco_arroba) as preco_medio_arroba
FROM users u
LEFT JOIN vendas v ON u.id = v.user_id
GROUP BY u.id, u.fazenda_nome, DATE_TRUNC('month', v.data_venda);

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE manejos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (cada usuário só vê seus dados)
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (firebase_uid = auth.jwt() ->> 'sub');
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (firebase_uid = auth.jwt() ->> 'sub');

-- Políticas para animais
DROP POLICY IF EXISTS "Users can view own animals" ON animais;
CREATE POLICY "Users can view own animals" ON animais FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
DROP POLICY IF EXISTS "Users can insert own animals" ON animais;
CREATE POLICY "Users can insert own animals" ON animais FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
DROP POLICY IF EXISTS "Users can update own animals" ON animais;
CREATE POLICY "Users can update own animals" ON animais FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
DROP POLICY IF EXISTS "Users can delete own animals" ON animais;
CREATE POLICY "Users can delete own animals" ON animais FOR DELETE USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- Aplicar políticas similares para outras tabelas
DROP POLICY IF EXISTS "Users can manage own manejos" ON manejos;
CREATE POLICY "Users can manage own manejos" ON manejos FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
DROP POLICY IF EXISTS "Users can manage own vendas" ON vendas;
CREATE POLICY "Users can manage own vendas" ON vendas FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
DROP POLICY IF EXISTS "Users can manage own producao" ON producao;
CREATE POLICY "Users can manage own producao" ON producao FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- Políticas para transações (usa Firebase UID diretamente)
DROP POLICY IF EXISTS "Users can manage own transacoes" ON transacoes;
CREATE POLICY "Users can manage own transacoes" ON transacoes FOR ALL USING (user_id = auth.jwt() ->> 'sub');

-- Políticas para investimentos (usa Firebase UID diretamente)
DROP POLICY IF EXISTS "Users can manage own investimentos" ON investimentos;
CREATE POLICY "Users can manage own investimentos" ON investimentos FOR ALL USING (user_id = auth.jwt() ->> 'sub');

-- Políticas para metas
DROP POLICY IF EXISTS "Users can manage own metas" ON metas;
CREATE POLICY "Users can manage own metas" ON metas FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- Políticas para chat (usa Firebase UID diretamente)
DROP POLICY IF EXISTS "Users can manage own chat" ON chat_messages;
CREATE POLICY "Users can manage own chat" ON chat_messages FOR ALL USING (user_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "Users can manage own alertas" ON alertas;
CREATE POLICY "Users can manage own alertas" ON alertas FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- =====================================================
-- DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir preços de mercado iniciais (apenas se a tabela estiver vazia)
INSERT INTO precos_mercado (data_preco, preco_arroba, categoria, regiao, fonte)
SELECT '2024-01-15', 280.50, 'boi_gordo', 'SP', 'cepea'
WHERE NOT EXISTS (SELECT 1 FROM precos_mercado WHERE data_preco = '2024-01-15' AND categoria = 'boi_gordo' AND regiao = 'SP');

INSERT INTO precos_mercado (data_preco, preco_arroba, categoria, regiao, fonte)
SELECT '2024-01-15', 275.00, 'boi_gordo', 'MS', 'cepea'
WHERE NOT EXISTS (SELECT 1 FROM precos_mercado WHERE data_preco = '2024-01-15' AND categoria = 'boi_gordo' AND regiao = 'MS');

INSERT INTO precos_mercado (data_preco, preco_arroba, categoria, regiao, fonte)
SELECT '2024-01-15', 260.00, 'vaca_gorda', 'SP', 'cepea'
WHERE NOT EXISTS (SELECT 1 FROM precos_mercado WHERE data_preco = '2024-01-15' AND categoria = 'vaca_gorda' AND regiao = 'SP');

INSERT INTO precos_mercado (data_preco, preco_arroba, categoria, regiao, fonte)
SELECT '2024-01-15', 255.00, 'vaca_gorda', 'MS', 'cepea'
WHERE NOT EXISTS (SELECT 1 FROM precos_mercado WHERE data_preco = '2024-01-15' AND categoria = 'vaca_gorda' AND regiao = 'MS');

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular GMD (Ganho Médio Diário)
CREATE OR REPLACE FUNCTION calcular_gmd(animal_uuid UUID, data_inicial DATE, data_final DATE)
RETURNS DECIMAL AS $$
DECLARE
    peso_inicial DECIMAL;
    peso_final DECIMAL;
    dias INTEGER;
    gmd DECIMAL;
BEGIN
    -- Buscar peso inicial
    SELECT peso INTO peso_inicial
    FROM producao
    WHERE animal_id = animal_uuid
    AND data_producao <= data_inicial
    ORDER BY data_producao DESC
    LIMIT 1;

    -- Buscar peso final
    SELECT peso INTO peso_final
    FROM producao
    WHERE animal_id = animal_uuid
    AND data_producao <= data_final
    ORDER BY data_producao DESC
    LIMIT 1;

    -- Calcular dias
    dias := data_final - data_inicial;

    -- Calcular GMD
    IF peso_inicial IS NOT NULL AND peso_final IS NOT NULL AND dias > 0 THEN
        gmd := (peso_final - peso_inicial) / dias;
        RETURN gmd;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON DATABASE CURRENT_DATABASE IS 'BOVINEXT - Plataforma de Gestão Pecuária com IA Especializada';
COMMENT ON TABLE users IS 'Usuários e informações das fazendas';
COMMENT ON TABLE animais IS 'Rebanho completo com genealogia e histórico';
COMMENT ON TABLE manejos IS 'Atividades de manejo sanitário e produtivo';
COMMENT ON TABLE vendas IS 'Registro de vendas de animais';
COMMENT ON TABLE producao IS 'Dados de produção e performance';
COMMENT ON TABLE metas IS 'Metas e objetivos da fazenda';
COMMENT ON TABLE chat_messages IS 'Histórico de conversas com IA';
COMMENT ON TABLE precos_mercado IS 'Preços de mercado em tempo real';
COMMENT ON TABLE alertas IS 'Sistema de alertas e notificações';

-- Log de criação das tabelas
DO $$
BEGIN
    RAISE NOTICE 'Tabelas BOVINEXT criadas com sucesso!';
    RAISE NOTICE 'Estrutura completa implementada no Supabase';
END $$;
