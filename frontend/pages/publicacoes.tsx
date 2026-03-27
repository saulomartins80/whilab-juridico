import { CheckCircle2, Clock3, List, Sparkles } from 'lucide-react';

import { LegalCard, LegalMetricGrid, LegalPageFrame } from '../components/legal/LegalPageFrame';

const publications = [
  ['TJSP', 'Intimacao de prazo em 48h', 'Gerou tarefa automatica'],
  ['TRT', 'Publicacao de audiencia', 'Aguardando confirmacao'],
  ['DJE', 'Despacho novo vinculado', 'Fila de leitura IA'],
];

export default function PublicacoesPage() {
  return (
    <LegalPageFrame
      title="Publicacoes e automacao"
      description="Monitoramento inicial para publicacoes, triagem e criacao de tarefas derivadas."
      activePath="/publicacoes"
    >
      <LegalMetricGrid
        items={[
          { label: 'Publicacoes novas', value: '23', hint: 'Janela atual de triagem', icon: List },
          { label: 'Tarefas criadas', value: '16', hint: 'Automacao sugerida pela IA', icon: Sparkles },
          { label: 'Pendencias', value: '4', hint: 'Itens aguardando acao da equipe', icon: Clock3 },
          { label: 'Concluidas', value: '12', hint: 'Publicacoes ja processadas', icon: CheckCircle2 },
        ]}
      />

      <LegalCard
        title="Fila de leitura"
        description="Base visual para integrar captura, classificacao e tarefas a partir de publicacoes."
      >
        <div className="space-y-3 px-5 py-5">
          {publications.map(([source, summary, status]) => (
            <div key={`${source}-${summary}`} className="rounded-3xl border border-slate-200/70 p-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{source}</p>
              <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">{summary}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{status}</p>
            </div>
          ))}
        </div>
      </LegalCard>
    </LegalPageFrame>
  );
}
