#!/usr/bin/env ts-node

// =====================================================
// WHILAB - SCRIPT PARA CRIAR TABELAS NO SUPABASE
// Executa o SQL de criaÃ§Ã£o das tabelas necessÃ¡rias
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { join } from 'path';
import logger from '../utils/logger';

// ConfiguraÃ§Ãµes do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('âŒ SUPABASE_URL e SUPABASE_SERVICE_KEY sÃ£o obrigatÃ³rios');
  process.exit(1);
}

// Criar cliente Supabase com service key (admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables(): Promise<void> {
  try {
    console.log('ðŸš€ Iniciando criaÃ§Ã£o das tabelas WHILAB...');

    // Ler arquivo SQL
    const sqlPath = join(__dirname, '../../scripts/create_whilab_tables.sql');
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
        console.log(`ðŸ“ Executando comando ${i + 1}/${commands.length}...`);
        const { error } = await supabase.rpc('exec', { sql: command });

        if (error) {
          // Alguns erros sÃ£o esperados (tabela jÃ¡ existe, etc.)
          if (error.message.includes('already exists') ||
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`âš ï¸  ${error.message}`);
          } else {
            console.error(`âŒ Erro no comando ${i + 1}:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`âœ… Comando ${i + 1} executado com sucesso`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`âŒ Erro ao executar comando ${i + 1}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nðŸ“Š Resumo da execuÃ§Ã£o:`);
    console.log(`âœ… Comandos executados com sucesso: ${successCount}`);
    console.log(`âŒ Comandos com erro: ${errorCount}`);
    console.log(`ðŸ“ Total de comandos: ${commands.length}`);

    if (errorCount === 0) {
      console.log('\nðŸŽ‰ Todas as tabelas foram criadas com sucesso!');
      console.log('ðŸŒ± WHILAB estÃ¡ pronto para uso!');
    } else {
      console.log('\nâš ï¸  Algumas tabelas podem nÃ£o ter sido criadas corretamente');
      console.log('ðŸ”§ Verifique os logs acima para mais detalhes');
    }

  } catch (error: any) {
    console.error('âŒ Erro geral na criaÃ§Ã£o das tabelas:', error.message);
    process.exit(1);
  }
}

// FunÃ§Ã£o RPC para executar SQL (se nÃ£o existir)
async function createExecFunction(): Promise<void> {
  try {
    const { error } = await supabase.rpc('exec', {
      sql: 'SELECT 1'
    });

    // Se a funÃ§Ã£o nÃ£o existir, tentar criÃ¡-la
    if (error && error.message.includes('function exec')) {
      console.log('ðŸ”§ Criando funÃ§Ã£o RPC exec...');

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
        console.log('âš ï¸  NÃ£o foi possÃ­vel criar funÃ§Ã£o RPC, continuando sem ela...');
      }
    }
  } catch (error: any) {
    console.log('âš ï¸  Erro ao verificar funÃ§Ã£o RPC:', error.message);
  }
}

// Executar script
async function main(): Promise<void> {
  console.log('ðŸ‚ WHILAB - Setup de Tabelas');
  console.log('================================\n');

  await createExecFunction();
  await createTables();

  process.exit(0);
}

// Executar apenas se for chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error('âŒ Erro fatal:', error);
    process.exit(1);
  });
}

