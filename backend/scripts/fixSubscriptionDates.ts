import { connect, disconnect } from 'mongoose';
import { User } from '../src/models/User';
import { stripe } from '../src/config/stripe';
import dotenv from 'dotenv';

dotenv.config();

async function fixSubscriptionDates() {
  try {
    console.log('Iniciando script de correção de assinaturas...');
    
    // Conectar ao MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não configurada');
    }
    
    await connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os usuários com assinatura ativa
    const users = await User.find({
      'subscription.status': 'active',
      'subscription.stripeSubscriptionId': { $exists: true, $ne: null }
    });

    console.log(`📊 Encontrados ${users.length} usuários com assinatura ativa`);

    for (const user of users) {
      try {
        console.log(`\n🔄 Processando usuário: ${user.email} (${user.firebaseUid})`);
        
        if (!user.subscription?.stripeSubscriptionId) {
          console.log('  ⚠️  Sem ID de assinatura Stripe, pulando...');
          continue;
        }

        console.log(`  📋 ID da assinatura atual: ${user.subscription.stripeSubscriptionId}`);
        console.log(`  📋 Plano atual: ${user.subscription.plan}`);
        console.log(`  📋 Data de vencimento atual: ${user.subscription.currentPeriodEnd}`);

        // Buscar dados atualizados da assinatura no Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
        const subscriptionData = stripeSubscription as any;

        console.log('  📊 Dados da assinatura Stripe:', {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
          items: stripeSubscription.items.data.map(item => ({
            price: item.price.nickname,
            interval: item.price.recurring?.interval,
            interval_count: item.price.recurring?.interval_count
          }))
        });

        // Calcular data de vencimento correta
        let currentPeriodEnd: Date;
        if (subscriptionData.current_period_end && !isNaN(subscriptionData.current_period_end)) {
          currentPeriodEnd = new Date(subscriptionData.current_period_end * 1000);
          console.log('  ✅ Data de vencimento calculada:', currentPeriodEnd.toISOString());
        } else {
          console.log('  ⚠️  Data de vencimento inválida no Stripe, usando fallback');
          currentPeriodEnd = new Date();
          currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
        }

        // Determinar o nome do plano baseado nos dados do Stripe
        const stripePlanName = stripeSubscription.items.data[0]?.price?.nickname || 'Plano Top';
        console.log(`  📋 Plano do Stripe: ${stripePlanName}`);

        // Atualizar usuário com dados corretos
        const updateData = {
          'subscription.status': stripeSubscription.status,
          'subscription.currentPeriodEnd': currentPeriodEnd,
          'subscription.expiresAt': currentPeriodEnd,
          'subscription.cancelAtPeriodEnd': subscriptionData.cancel_at_period_end || false,
          'subscription.updatedAt': new Date()
        };

        // Só atualizar o plano se for diferente
        if (stripePlanName !== user.subscription.plan) {
          updateData['subscription.plan'] = stripePlanName;
          console.log(`  🔄 Atualizando plano de "${user.subscription.plan}" para "${stripePlanName}"`);
        }

        await User.findByIdAndUpdate(user._id, updateData);

        console.log('  ✅ Usuário atualizado com sucesso');

      } catch (error) {
        console.error(`  ❌ Erro ao processar usuário ${user.email}:`, error);
      }
    }

    console.log('\n🎉 Processamento concluído!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar o script
console.log('🚀 Iniciando script...');
fixSubscriptionDates().catch(console.error); 