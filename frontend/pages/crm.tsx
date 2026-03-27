import { Building, CheckCircle2, Users, WalletCards } from 'lucide-react';

import { LegalCard, LegalMetricGrid, LegalPageFrame } from '../components/legal/LegalPageFrame';

const pipeline = [
  ['Lead inbound', '12', 'Pagina de captura e WhatsApp'],
  ['Consulta agendada', '7', 'Confirmacao pendente'],
  ['Proposta enviada', '4', 'Honorarios em negociacao'],
  ['Cliente ativo', '18', 'Carteira recorrente'],
];

export default function CrmPage() {
  return (
    <LegalPageFrame
      title="CRM juridico"
      description="Leads, clientes, origem de captacao e acompanhamento comercial do escritorio."
      activePath="/crm"
    >
      <LegalMetricGrid
        items={[
          { label: 'Leads ativos', value: '42', hint: 'Entradas qualificadas no funil', icon: Users },
          { label: 'Consultas agendadas', value: '11', hint: 'Agenda comercial da semana', icon: CheckCircle2 },
          { label: 'Clientes ativos', value: '28', hint: 'Base recorrente e novos contratos', icon: Building },
          { label: 'Ticket medio', value: 'R$ 1,9 mil', hint: 'Honorarios por fechamento', icon: WalletCards },
        ]}
      />

      <LegalCard
        title="Pipeline comercial"
        description="Visao inicial para triagem, atendimento e fechamento."
      >
        <div className="grid gap-3 px-5 py-5 md:grid-cols-2 xl:grid-cols-4">
          {pipeline.map(([label, value, detail]) => (
            <div key={label} className="rounded-3xl border border-slate-200/70 px-4 py-4 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
      </LegalCard>
    </LegalPageFrame>
  );
}
