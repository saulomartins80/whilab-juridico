import { connect, disconnect } from 'mongoose';
import { User } from '../src/models/User';
import dotenv from 'dotenv';

dotenv.config();

async function fixUserPlan() {
  try {
    console.log('🔧 Iniciando correção do plano do usuário...');
    
    // Conectar ao MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não configurada');
    }
    
    await connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar o usuário específico
    const firebaseUid = 'Xn9dK4jXw7W5qO2g9AmSJkpLLCq1';
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log(`📋 Usuário encontrado: ${user.email}`);
    console.log(`📋 Plano atual: ${user.subscription?.plan}`);
    console.log(`📋 Status: ${user.subscription?.status}`);
    console.log(`📋 Subscription ID: ${user.subscription?.stripeSubscriptionId}`);

    // Verificar se é o plano anual correto
    if (user.subscription?.plan === 'Plano Essencial Anual') {
      console.log('✅ Plano já está correto: Plano Essencial Anual');
    } else {
      // Atualizar para o plano correto
      const newPlan = 'Plano Essencial Anual';
      
      await User.findByIdAndUpdate(user._id, {
        'subscription.plan': newPlan,
        'subscription.updatedAt': new Date()
      });

      console.log(`🔄 Plano atualizado de "${user.subscription?.plan}" para "${newPlan}"`);
    }

    // Verificar se foi atualizado
    const updatedUser = await User.findOne({ firebaseUid });
    console.log(`📋 Plano final: ${updatedUser?.subscription?.plan}`);

    console.log('🎉 Correção concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar o script
fixUserPlan().catch(console.error); 