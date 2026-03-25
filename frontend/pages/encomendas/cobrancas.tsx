import { useCallback } from 'react';
import {
  AlarmClockCheck,
  BanknoteArrowDown,
  CircleDollarSign,
  ReceiptText,
  WalletCards,
} from 'lucide-react';

import {
  EncomendasCollectionCard,
  EncomendasEmptyCollection,
  EncomendasMetricsGrid,
  EncomendasPageFrame,
  EncomendasStatusBanner,
  formatCompactNumber,
  formatCurrency,
  formatDate,
  getStatusBadge,
  humanizeStatus,
  useEncomendasResource,
} from '../../components/encomendas/EncomendasPageFrame';
import encomendasApi from '../../services/encomendasApi';

export default function EncomendasCobrancasPage() {
  const loader = useCallback(() => encomendasApi.getCharges(), []);
  const { loading, result, reload } = useEncomendasResource(loader);
  const data = result?.data;

  const metrics = [
    {
      label: 'Cobrancas totais',
      value: formatCompactNumber(data?.summary.totalCharges ?? 0),
      hint: 'Todos os registros financeiros recebidos do backend.',
      icon: ReceiptText,
      tone: 'emerald' as const,
    },
    {
      label: 'Em aberto',
      value: formatCompactNumber(data?.summary.openCharges ?? 0),
      hint: 'Carteira que ainda exige pagamento.',
      icon: WalletCards,
      tone: 'sky' as const,
    },
    {
      label: 'Vencidas',
      value: formatCompactNumber(data?.summary.overdueCharges ?? 0),
      hint: 'Prioridade de follow-up financeiro.',
      icon: AlarmClockCheck,
      tone: 'amber' as const,
    },
    {
      label: 'Valor em aberto',
      value: formatCurrency(data?.summary.totalOpenAmount ?? 0),
      hint: `${formatCompactNumber(data?.summary.paidCharges ?? 0)} cobrancas pagas.`,
      icon: CircleDollarSign,
      tone: 'rose' as const,
    },
  ];

  return (
    <EncomendasPageFrame
      activePath="/encomendas/cobrancas"
      title="Cobrancas e recebiveis"
      description="Visao protegida para acompanhar vencimento, status e valor aberto sem depender do schema final do backend."
    >
      <EncomendasStatusBanner loading={loading} result={result} onRetry={reload} />

      <EncomendasMetricsGrid items={metrics} />

      <EncomendasCollectionCard
        title="Carteira de cobrancas"
        description="Tabela desktop e cards mobile com foco em leitura de vencimento e risco."
      >
        {data?.charges.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full">
                <thead className="border-b border-slate-200/70 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/30">
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-4">Referencia</th>
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Vencimento</th>
                    <th className="px-5 py-4">Pagamento</th>
                    <th className="px-5 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.charges.map((charge) => (
                    <tr key={charge.id} className="dashboard-table-row border-b border-slate-200/60 dark:border-slate-800">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {charge.reference}
                        </div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {charge.paymentMethod || 'Metodo nao informado'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {charge.customerName}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(charge.status)}`}>
                          {humanizeStatus(charge.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(charge.dueAt)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(charge.paidAt)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(charge.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {data.charges.map((charge) => (
                <article key={charge.id} className="dashboard-surface-muted p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{charge.reference}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {charge.customerName}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(charge.status)}`}>
                      {humanizeStatus(charge.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Vencimento</p>
                      <p className="mt-1 font-medium text-slate-900 dark:text-white">
                        {formatDate(charge.dueAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Valor</p>
                      <p className="mt-1 font-medium text-slate-900 dark:text-white">
                        {formatCurrency(charge.amount)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <BanknoteArrowDown className="h-4 w-4" />
                        {charge.paymentMethod || 'Metodo nao informado'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EncomendasEmptyCollection
            title="Nenhuma cobranca encontrada"
            description="Quando o backend expor a carteira financeira, esta pagina passa a mostrar vencimento, valor e status de recebimento."
          />
        )}
      </EncomendasCollectionCard>
    </EncomendasPageFrame>
  );
}
