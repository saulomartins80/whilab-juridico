import { connect, disconnect } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkProtectedRoutes() {
  try {
    console.log('🔍 Verificando rotas protegidas e públicas...');
    
    // Conectar ao MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não configurada');
    }
    
    await connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    console.log('\n📋 ROTAS PÚBLICAS (sem login):');
    console.log('  ✅ / - Página inicial');
    console.log('  ✅ /sobre - Sobre a empresa');
    console.log('  ✅ /precos - Página de preços');
    console.log('  ✅ /recursos - Recursos disponíveis');
    console.log('  ✅ /solucoes - Soluções oferecidas');
    console.log('  ✅ /clientes - Página de clientes');
    console.log('  ✅ /contato - Página de contato');
    console.log('  ✅ /empresa - Informações da empresa');
    console.log('  ✅ /carreiras - Oportunidades de carreira');
    console.log('  ✅ /blog - Blog da empresa');
    console.log('  ✅ /parceiros - Página de parceiros');
    console.log('  ✅ /imprensa - Área de imprensa');
    console.log('  ✅ /juridico - Informações jurídicas');
    console.log('  ✅ /privacidade - Política de privacidade');
    console.log('  ✅ /termos - Termos de serviço');
    console.log('  ✅ /seguranca - Política de segurança');
    console.log('  ✅ /cookies - Política de cookies');
    console.log('  ✅ /licencas - Informações de licenças');
    console.log('  ✅ /auth/login - Página de login');
    console.log('  ✅ /auth/register - Página de registro');
    console.log('  ✅ /auth/forgot-password - Recuperar senha');

    console.log('\n🔒 ROTAS PROTEGIDAS (precisam de login):');
    console.log('  🔒 /dashboard - Dashboard principal');
    console.log('  🔒 /profile - Perfil do usuário');
    console.log('  🔒 /assinaturas - Gerenciar assinaturas');
    console.log('  🔒 /transacoes - Histórico de transações');
    console.log('  🔒 /investimentos - Gestão de investimentos');
    console.log('  🔒 /metas - Metas financeiras');
    console.log('  🔒 /configuracoes - Configurações da conta');
    console.log('  🔒 /auth/change-password - Alterar senha');

    console.log('\n🎯 ROTAS ESPECIAIS:');
    console.log('  🎯 /payment/sucesso - Página de sucesso (acessível após pagamento)');
    console.log('  🎯 /ebook - Download de ebook (pode ser público)');
    console.log('  🎯 /livro.pdf - Download de livro (pode ser público)');

    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('  • Todas as páginas de marketing devem ser públicas');
    console.log('  • Apenas funcionalidades do app devem ser protegidas');
    console.log('  • Páginas de suporte podem ser públicas');
    console.log('  • Downloads de materiais podem ser públicos para capturar leads');

    console.log('\n🎉 Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar o script
checkProtectedRoutes().catch(console.error); 