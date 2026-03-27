import { Building, Clock3, FolderOpen, Scale } from 'lucide-react';

import { LegalCard, LegalMetricGrid, LegalPageFrame } from '../components/legal/LegalPageFrame';

const cases = [
  ['Proc. 0001234-89.2026.8.26.0100', 'Civel', 'Em audiencia', 'Dra. Marina'],
  ['Proc. 0008451-31.2026.8.26.0100', 'Trabalhista', 'Aguardando prazo', 'Dr. Felipe'],
  ['Proc. 0010211-14.2026.8.26.0100', 'Consumidor', 'Peticao inicial', 'Dra. Ana'],
];

export default function ProcessosPage() {
  return (
    <LegalPageFrame
      title="Gestao de processos"
      description="Carteira processual, ownership, status e visibilidade operacional por escritorio."
      activePath="/processos"
    >
      <LegalMetricGrid
        items={[
          { label: 'Processos ativos', value: '126', hint: 'Carteira atual do escritorio', icon: Scale },
          { label: 'Prazos criticos', value: '9', hint: 'Janela de atencao imediata', icon: Clock3 },
          { label: 'Pastas vinculadas', value: '118', hint: 'Documentos organizados na nuvem juridica', icon: FolderOpen },
          { label: 'Responsaveis', value: '6', hint: 'Equipe distribuida por carteira', icon: Building },
        ]}
      />

      <LegalCard
        title="Carteira em destaque"
        description="Exemplo inicial do quadro de processos que vamos ligar ao tenant juridico."
      >
        <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Processo</th>
                <th className="pb-3 font-medium">Area</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Responsavel</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(([number, area, status, owner]) => (
                <tr key={number} className="border-t border-slate-200/70 dark:border-slate-800">
                  <td className="py-3 text-slate-950 dark:text-white">{number}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{area}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{status}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalCard>
    </LegalPageFrame>
  );
}
