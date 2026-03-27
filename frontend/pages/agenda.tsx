import { CalendarDays, CheckCircle2, Clock3, Users } from 'lucide-react';

import { LegalCard, LegalMetricGrid, LegalPageFrame } from '../components/legal/LegalPageFrame';

const agendaItems = [
  ['09:00', 'Reuniao com cliente', 'Dra. Marina'],
  ['11:30', 'Prazo de contestacao', 'Dr. Felipe'],
  ['15:00', 'Audiencia online', 'Dra. Ana'],
];

export default function AgendaPage() {
  return (
    <LegalPageFrame
      title="Agenda e prazos"
      description="Compromissos, prazos e distribuicao de ownership operacional da equipe."
      activePath="/agenda"
    >
      <LegalMetricGrid
        items={[
          { label: 'Compromissos hoje', value: '8', hint: 'Agenda do escritorio no dia', icon: CalendarDays },
          { label: 'Prazos criticos', value: '3', hint: 'Itens que vencem em 48h', icon: Clock3 },
          { label: 'Equipe alocada', value: '6', hint: 'Usuarios com agenda ativa', icon: Users },
          { label: 'Confirmados', value: '12', hint: 'Tarefas e eventos ja validados', icon: CheckCircle2 },
        ]}
      />

      <LegalCard
        title="Hoje no escritorio"
        description="Visao inicial para eventos, prazos e distribuicao do trabalho."
      >
        <div className="space-y-3 px-5 py-5">
          {agendaItems.map(([time, title, owner]) => (
            <div key={`${time}-${title}`} className="flex items-center justify-between rounded-3xl border border-slate-200/70 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{time}</p>
                <p className="mt-1 text-base font-semibold text-slate-950 dark:text-white">{title}</p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{owner}</p>
            </div>
          ))}
        </div>
      </LegalCard>
    </LegalPageFrame>
  );
}
