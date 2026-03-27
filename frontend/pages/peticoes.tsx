import { FileText, Scale, Sparkles, Target } from 'lucide-react';

import { LegalCard, LegalMetricGrid, LegalPageFrame } from '../components/legal/LegalPageFrame';

const drafts = [
  ['Peticao inicial', 'Contrato bancario', 'Rascunho IA'],
  ['Recurso inominado', 'Juizado especial', 'Em revisao'],
  ['Contestacao', 'Consumidor', 'Aguardando anexos'],
];

export default function PeticoesPage() {
  return (
    <LegalPageFrame
      title="Peticoes e IA juridica"
      description="Rascunhos, revisoes, apoio a recursos e organizacao da producao juridica."
      activePath="/peticoes"
    >
      <LegalMetricGrid
        items={[
          { label: 'Rascunhos abertos', value: '14', hint: 'Esteira ativa de pecas', icon: FileText },
          { label: 'Fila de revisao', value: '5', hint: 'Textos aguardando validacao humana', icon: Target },
          { label: 'Apoios por IA', value: '38', hint: 'Sugestoes e estruturas geradas', icon: Sparkles },
          { label: 'Recursos priorizados', value: '7', hint: 'Demandas com prazo relevante', icon: Scale },
        ]}
      />

      <LegalCard
        title="Fila de peticoes"
        description="Camada inicial para ligar peticoes, recursos e historico de geracoes."
      >
        <div className="grid gap-3 px-5 py-5 md:grid-cols-3">
          {drafts.map(([title, context, status]) => (
            <div key={title} className="rounded-3xl border border-slate-200/70 p-4 dark:border-slate-800">
              <p className="text-base font-semibold text-slate-950 dark:text-white">{title}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{context}</p>
              <p className="mt-3 inline-flex rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/14 dark:text-emerald-300">
                {status}
              </p>
            </div>
          ))}
        </div>
      </LegalCard>
    </LegalPageFrame>
  );
}
