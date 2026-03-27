import { CreditCard, ShieldCheck, Target, WalletCards } from 'lucide-react';

import { LegalCard, LegalMetricGrid, LegalPageFrame } from '../components/legal/LegalPageFrame';

const receivables = [
  ['Honorarios contratuais', 'R$ 4.800', 'Vence em 3 dias'],
  ['Entrada de acordo', 'R$ 2.100', 'Link enviado'],
  ['Mensalidade recorrente', 'R$ 890', 'Aguardando pagamento'],
];

export default function CobrancasPage() {
  return (
    <LegalPageFrame
      title="Cobrancas e honorarios"
      description="Pendencias, recorrencia, follow-up financeiro e operacao de recebiveis do escritorio."
      activePath="/cobrancas"
    >
      <LegalMetricGrid
        items={[
          { label: 'A receber', value: 'R$ 18,4 mil', hint: 'Carteira financeira do periodo', icon: WalletCards },
          { label: 'Pendencias', value: '7', hint: 'Titulos que pedem acao', icon: CreditCard },
          { label: 'Recorrencias', value: '19', hint: 'Contratos com cobranca automatizada', icon: Target },
          { label: 'Fluxo seguro', value: 'Ativo', hint: 'Camada de controle e historico', icon: ShieldCheck },
        ]}
      />

      <LegalCard
        title="Carteira de cobranca"
        description="Estrutura inicial para ligar honorarios, contratos e automacoes financeiras."
      >
        <div className="grid gap-3 px-5 py-5 md:grid-cols-3">
          {receivables.map(([title, amount, detail]) => (
            <div key={title} className="rounded-3xl border border-slate-200/70 p-4 dark:border-slate-800">
              <p className="text-base font-semibold text-slate-950 dark:text-white">{title}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">{amount}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
      </LegalCard>
    </LegalPageFrame>
  );
}
