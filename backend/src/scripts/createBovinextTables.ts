#!/usr/bin/env ts-node

// =====================================================
// BOVINEXT - SCRIPT PARA CRIAR TABELAS NO SUPABASE
// Executa o SQL de criação das tabelas necessárias
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { join } from 'path';
import logger from '../utils/logger';

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios');
  process.exit(1);
}

// Criar cliente Supabase com service key (admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables(): Promise<void> {
  try {
    console.log('🚀 Iniciando criação das tabelas BOVINEXT...');

    // Ler arquivo SQL
    const sqlPath = join(__dirname, '../../scripts/create_bovinext_tables.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf-8');

    // Dividir SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && !cmd.startsWith('DO'));

    let successCount = 0;
    let errorCount = 0;

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (!command) continue;

      try {
        console.log(`📝 Executando comando ${i + 1}/${commands.length}...`);
        const { error } = await supabase.rpc('exec', { sql: command });

        if (error) {
          // Alguns erros são esperados (tabela já existe, etc.)
          if (error.message.includes('already exists') ||
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  ${error.message}`);
          } else {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`❌ Erro ao executar comando ${i + 1}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumo da execução:`);
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log(`📝 Total de comandos: ${commands.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Todas as tabelas foram criadas com sucesso!');
      console.log('🌱 BOVINEXT está pronto para uso!');
    } else {
      console.log('\n⚠️  Algumas tabelas podem não ter sido criadas corretamente');
      console.log('🔧 Verifique os logs acima para mais detalhes');
    }

  } catch (error: any) {
    console.error('❌ Erro geral na criação das tabelas:', error.message);
    process.exit(1);
  }
}

// Função RPC para executar SQL (se não existir)
async function createExecFunction(): Promise<void> {
  try {
    const { error } = await supabase.rpc('exec', {
      sql: 'SELECT 1'
    });

    // Se a função não existir, tentar criá-la
    if (error && error.message.includes('function exec')) {
      console.log('🔧 Criando função RPC exec...');

      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec(sql text)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `;

      const { error: createError } = await supabase.from('_supabase_functions').insert({
        name: 'exec',
        definition: createFunctionSQL
      });

      if (createError) {
        console.log('⚠️  Não foi possível criar função RPC, continuando sem ela...');
      }
    }
  } catch (error: any) {
    console.log('⚠️  Erro ao verificar função RPC:', error.message);
  }
}

// Executar script
async function main(): Promise<void> {
  console.log('🐂 BOVINEXT - Setup de Tabelas');
  console.log('================================\n');

  await createExecFunction();
  await createTables();

  process.exit(0);
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}
