import { robotOrchestrator } from '../src/rpa/RobotOrchestrator';
import { RPADashboard } from '../src/rpa/dashboard/RPADashboard';
import { DataSyncWorker } from '../src/rpa/workers/DataSyncWorker';

async function testRpaDashboard() {
  console.log('🧪 TESTE DO SISTEMA RPA E DASHBOARD');
  console.log('=' .repeat(50));

  try {
    // 1. Inicializar o sistema RPA
    console.log('\n🚀 1. Inicializando sistema RPA...');
    
    // Registrar workers
    const dataSyncWorker = new DataSyncWorker();
    const workerId1 = await dataSyncWorker.register();
    console.log(`✅ DataSyncWorker registrado: ${workerId1}`);

    const workerId2 = await robotOrchestrator.registerWorker({
      name: 'TestWorker1',
      type: 'USER_ANALYSIS',
      capabilities: ['USER_ANALYSIS', 'REPORT_GENERATION']
    });
    console.log(`✅ TestWorker1 registrado: ${workerId2}`);

    const workerId3 = await robotOrchestrator.registerWorker({
      name: 'TestWorker2',
      type: 'MARKET_UPDATE',
      capabilities: ['MARKET_UPDATE', 'DATA_SYNC']
    });
    console.log(`✅ TestWorker2 registrado: ${workerId3}`);

    // 2. Adicionar tarefas de teste
    console.log('\n📋 2. Adicionando tarefas de teste...');
    
    const taskId1 = await robotOrchestrator.addTask({
      type: 'DATA_SYNC',
      priority: 'MEDIUM',
      payload: { operation: 'SYNC_USER_DATA', userId: 'test-user-1' },
      maxRetries: 2
    });
    console.log(`✅ Tarefa 1 criada: ${taskId1}`);

    const taskId2 = await robotOrchestrator.addTask({
      type: 'USER_ANALYSIS',
      priority: 'HIGH',
      payload: { operation: 'ANALYZE_USER_BEHAVIOR', userId: 'test-user-2' },
      maxRetries: 3
    });
    console.log(`✅ Tarefa 2 criada: ${taskId2}`);

    const taskId3 = await robotOrchestrator.addTask({
      type: 'REPORT_GENERATION',
      priority: 'LOW',
      payload: { operation: 'GENERATE_MONTHLY_REPORT' },
      maxRetries: 1
    });
    console.log(`✅ Tarefa 3 criada: ${taskId3}`);

    // 3. Iniciar orquestração
    console.log('\n🎼 3. Iniciando orquestração...');
    await robotOrchestrator.startOrchestration();
    console.log('✅ Orquestração iniciada');

    // 4. Aguardar processamento
    console.log('\n⏳ 4. Aguardando processamento (15 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // 5. Verificar métricas do RobotOrchestrator
    console.log('\n📊 5. Verificando métricas do RobotOrchestrator...');
    const orchestratorMetrics = await robotOrchestrator.getMetrics();
    console.log('Métricas do RobotOrchestrator:', orchestratorMetrics);

    const workers = await robotOrchestrator.getAllWorkers();
    console.log(`Workers registrados: ${workers.length}`);
    workers.forEach(worker => {
      console.log(`  - ${worker.name}: ${worker.status} (${worker.performance.tasksCompleted} tarefas concluídas)`);
    });

    const tasks = await robotOrchestrator.getAllTasks();
    console.log(`Tarefas criadas: ${tasks.length}`);
    tasks.forEach(task => {
      console.log(`  - ${task.id}: ${task.type} - ${task.status}`);
    });

    // 6. Testar o Dashboard
    console.log('\n📊 6. Testando Dashboard...');
    const dashboard = RPADashboard.getInstance();
    
    // Forçar atualização das métricas
    await dashboard.updateMetrics();
    
    const dashboardMetrics = dashboard.getMetrics();
    console.log('Métricas do Dashboard:');
    console.log('  RPA Status:', dashboardMetrics.rpa.status);
    console.log('  Workers:', dashboardMetrics.rpa.workers);
    console.log('  Tasks:', dashboardMetrics.rpa.tasks);
    console.log('  Performance:', dashboardMetrics.rpa.performance);

    // 7. Verificar se os dados são reais (não fake)
    console.log('\n🔍 7. Verificando se os dados são reais...');
    
    const isRealData = 
      dashboardMetrics.rpa.workers.total > 0 &&
      dashboardMetrics.rpa.tasks.total > 0 &&
      dashboardMetrics.rpa.performance.uptime > 0;

    if (isRealData) {
      console.log('✅ DADOS REAIS DETECTADOS!');
      console.log(`   - Workers: ${dashboardMetrics.rpa.workers.total} (${dashboardMetrics.rpa.workers.online} online)`);
      console.log(`   - Tasks: ${dashboardMetrics.rpa.tasks.total} (${dashboardMetrics.rpa.tasks.completed} concluídas)`);
      console.log(`   - Uptime: ${Math.round(dashboardMetrics.rpa.performance.uptime)}s`);
    } else {
      console.log('❌ DADOS FAKE DETECTADOS!');
      console.log('   O dashboard ainda está usando dados simulados');
    }

    // 8. Testar endpoint da API
    console.log('\n🌐 8. Testando endpoint da API...');
    
    const response = await fetch('http://localhost:5000/api/dashboard/metrics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });

    if (response.ok) {
      const apiData = await response.json();
      console.log('✅ API do dashboard funcionando!');
      console.log('   Status:', apiData.success);
      console.log('   RPA Status:', apiData.data.rpa.status);
    } else {
      console.log('❌ Erro na API do dashboard:', response.status, response.statusText);
    }

    console.log('\n🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste se este arquivo for executado diretamente
if (require.main === module) {
  testRpaDashboard().then(() => {
    console.log('✅ Script de teste finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erro no script de teste:', error);
    process.exit(1);
  });
}

export { testRpaDashboard }; 