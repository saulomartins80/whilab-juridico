import { robotOrchestrator } from '../src/rpa/RobotOrchestrator';
import { DataSyncWorker } from '../src/rpa/workers/DataSyncWorker';

async function checkWorkerRegistration() {
  console.log('🔍 VERIFICANDO REGISTRO DE WORKERS');
  console.log('=' .repeat(40));

  try {
    // 1. Verificar estado inicial
    console.log('\n📊 1. Estado inicial do orquestrador:');
    const initialWorkers = await robotOrchestrator.getAllWorkers();
    console.log(`Workers registrados: ${initialWorkers.length}`);

    // 2. Tentar registrar um novo worker
    console.log('\n🤖 2. Registrando novo DataSyncWorker...');
    const dataSyncWorker = new DataSyncWorker();
    const workerId = await dataSyncWorker.register();
    console.log(`✅ Worker registrado com ID: ${workerId}`);

    // 3. Verificar se o worker foi registrado
    console.log('\n✅ 3. Verificando registro do worker:');
    const workersAfterRegistration = await robotOrchestrator.getAllWorkers();
    console.log(`Total de workers após registro: ${workersAfterRegistration.length}`);

    const registeredWorker = workersAfterRegistration.find(w => w.id === workerId);
    if (registeredWorker) {
      console.log('✅ Worker encontrado no orquestrador:');
      console.log(`  - Nome: ${registeredWorker.name}`);
      console.log(`  - Status: ${registeredWorker.status}`);
      console.log(`  - Tipo: ${registeredWorker.type}`);
      console.log(`  - Capacidades: ${registeredWorker.capabilities.join(', ')}`);
      console.log(`  - Último heartbeat: ${new Date(registeredWorker.lastHeartbeat).toLocaleString()}`);
    } else {
      console.log('❌ Worker não encontrado no orquestrador!');
    }

    // 4. Verificar heartbeat
    console.log('\n💓 4. Testando heartbeat...');
    await robotOrchestrator.updateWorkerHeartbeat(workerId);
    console.log('✅ Heartbeat enviado');

    // 5. Aguardar um pouco e verificar se o heartbeat foi atualizado
    console.log('\n⏳ 5. Aguardando atualização do heartbeat (5 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const updatedWorker = await robotOrchestrator.getAllWorkers().then(workers => 
      workers.find(w => w.id === workerId)
    );

    if (updatedWorker) {
      const timeSinceHeartbeat = Date.now() - new Date(updatedWorker.lastHeartbeat).getTime();
      console.log(`✅ Último heartbeat: ${Math.round(timeSinceHeartbeat / 1000)}s atrás`);
      
      if (timeSinceHeartbeat < 10000) {
        console.log('✅ Heartbeat está funcionando corretamente');
      } else {
        console.log('⚠️ Heartbeat pode estar com problema');
      }
    }

    // 6. Verificar se o worker está disponível para tarefas
    console.log('\n📋 6. Verificando disponibilidade para tarefas:');
    const availableWorkers = workersAfterRegistration.filter(w => w.status === 'IDLE');
    console.log(`Workers disponíveis: ${availableWorkers.length}`);

    if (availableWorkers.length > 0) {
      console.log('✅ Há workers disponíveis para processar tarefas');
    } else {
      console.log('❌ Nenhum worker disponível - isso pode causar o loop infinito!');
    }

    // 7. Testar adição de uma tarefa
    console.log('\n🧪 7. Testando adição de tarefa...');
    const taskId = await robotOrchestrator.addTask({
      type: 'DATA_SYNC',
      priority: 'MEDIUM',
      payload: {
        operation: 'SYNC_USER_DATA',
        userId: 'test-worker-check'
      },
      maxRetries: 1
    });
    console.log(`✅ Tarefa criada: ${taskId}`);

    // 8. Aguardar processamento
    console.log('\n⏳ 8. Aguardando processamento (10 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 9. Verificar status da tarefa
    const task = await robotOrchestrator.getTask(taskId);
    if (task) {
      console.log(`Status da tarefa: ${task.status}`);
      if (task.status === 'COMPLETED') {
        console.log('✅ Tarefa foi processada com sucesso!');
      } else if (task.status === 'PENDING') {
        console.log('⚠️ Tarefa ainda pendente - possível problema no processamento');
      } else {
        console.log(`ℹ️ Tarefa em status: ${task.status}`);
      }
    }

    // 10. Limpar recursos
    console.log('\n🧹 10. Limpando recursos...');
    await dataSyncWorker.stop();
    console.log('✅ Worker parado');

    console.log('\n🎉 Verificação concluída com sucesso!');

  } catch (error: any) {
    console.error('❌ Erro na verificação:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar verificação
checkWorkerRegistration().then(() => {
  console.log('\n✅ Verificação concluída');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro na verificação:', error);
  process.exit(1);
}); 