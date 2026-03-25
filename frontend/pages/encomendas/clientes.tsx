import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BadgeDollarSign, CreditCard, MapPin, Plus, UserRoundCheck, Users } from 'lucide-react';
import { toast } from 'react-toastify';

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

const initialForm = {
  name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
};

export default function EncomendasClientesPage() {
  const router = useRouter();
  const loader = useCallback(() => encomendasApi.getCustomers(), []);
  const { loading, result, reload } = useEncomendasResource(loader);
  const data = result?.data;

  const [showComposer, setShowComposer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (router.query.action === 'new-customer') {
      setShowComposer(true);
    }
  }, [router.query.action]);

  const closeComposer = () => {
    setShowComposer(false);
    setForm(initialForm);

    if (router.query.action) {
      void router.replace('/encomendas/clientes', undefined, { shallow: true });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.warn('Informe pelo menos o nome do cliente.');
      return;
    }

    setSaving(true);
    try {
      await encomendasApi.createCustomer({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
      });
      toast.success('Cliente criado com sucesso.');
      closeComposer();
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar cliente.');
    } finally {
      setSaving(false);
    }
  };

  const metrics = [
    {
      label: 'Base total',
      value: formatCompactNumber(data?.summary.totalCustomers ?? 0),
      hint: 'Clientes retornados pela API do vertical.',
      icon: Users,
      tone: 'emerald' as const,
    },
    {
      label: 'Clientes ativos',
      value: formatCompactNumber(data?.summary.activeCustomers ?? 0),
      hint: 'Relacionamentos com pedidos ou atividade recorrente.',
      icon: UserRoundCheck,
      tone: 'sky' as const,
    },
    {
      label: 'LTV medio',
      value: formatCurrency(data?.summary.averageLifetimeValue ?? 0),
      hint: 'Leitura consolidada de valor por conta.',
      icon: BadgeDollarSign,
      tone: 'amber' as const,
    },
    {
      label: 'Com cobrancas abertas',
      value: formatCompactNumber(data?.summary.customersWithOpenCharges ?? 0),
      hint: 'Clientes que exigem follow-up financeiro.',
      icon: CreditCard,
      tone: 'rose' as const,
    },
  ];

  return (
    <EncomendasPageFrame
      activePath="/encomendas/clientes"
      title="Clientes do App de Encomendas"
      description="Camada protegida para acompanhar relacionamento, recorrencia e valor acumulado por cliente."
    >
      <EncomendasStatusBanner loading={loading} result={result} onRetry={reload} />

      <EncomendasMetricsGrid items={metrics} />

      <EncomendasCollectionCard
        title="Novo cliente"
        description="Cadastre rapidamente um contato operacional para usar no fluxo de pedidos."
      >
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              O cliente vira base para pedido, cobrança e leitura de recorrência.
            </p>
            <button
              type="button"
              onClick={() => setShowComposer((current) => !current)}
              className="app-shell-button-primary"
            >
              <Plus className="h-4 w-4" />
              {showComposer ? 'Fechar cadastro' : 'Novo cliente'}
            </button>
          </div>

          {showComposer && (
            <form onSubmit={handleSubmit} className="mt-5 grid gap-4 lg:grid-cols-5">
              <label className="lg:col-span-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Nome</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="Nome do cliente"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">E-mail</span>
                <input
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="cliente@email.com"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Telefone</span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="(11) 99999-0000"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Cidade</span>
                <input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="Cidade"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Estado</span>
                <input
                  value={form.state}
                  onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="UF"
                />
              </label>

              <div className="lg:col-span-5 flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="app-shell-button-primary">
                  <Plus className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar cliente'}
                </button>
                <button type="button" onClick={closeComposer} className="dashboard-secondary-button">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </EncomendasCollectionCard>

      <EncomendasCollectionCard
        title="Base de clientes"
        description="Lista responsiva para leitura rapida em desktop ou mobile."
      >
        {data?.customers.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full">
                <thead className="border-b border-slate-200/70 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/30">
                  <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-4">Cliente</th>
                    <th className="px-5 py-4">Localidade</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Pedidos</th>
                    <th className="px-5 py-4">Ultimo pedido</th>
                    <th className="px-5 py-4 text-right">LTV</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((customer) => (
                    <tr key={customer.id} className="dashboard-table-row border-b border-slate-200/60 dark:border-slate-800">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{customer.name}</div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {customer.email || customer.phone || 'Sem contato informado'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {[customer.city, customer.state].filter(Boolean).join(', ') || 'Sem cidade'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(customer.status)}`}>
                          {humanizeStatus(customer.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {customer.activeOrders} ativos / {customer.totalOrders} total
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(customer.lastOrderAt)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(customer.lifetimeValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {data.customers.map((customer) => (
                <article key={customer.id} className="dashboard-surface-muted p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {customer.email || customer.phone || 'Sem contato informado'}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(customer.status)}`}>
                      {humanizeStatus(customer.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">Pedidos</p>
                      <p className="mt-1 font-medium text-slate-900 dark:text-white">
                        {customer.activeOrders} ativos
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400">LTV</p>
                      <p className="mt-1 font-medium text-slate-900 dark:text-white">
                        {formatCurrency(customer.lifetimeValue)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin className="h-4 w-4" />
                        {[customer.city, customer.state].filter(Boolean).join(', ') || 'Sem localidade'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <EncomendasEmptyCollection
            title="Nenhum cliente disponivel"
            description="A lista vai aparecer aqui assim que a API publicar a colecao de clientes do vertical."
          />
        )}
      </EncomendasCollectionCard>
    </EncomendasPageFrame>
  );
}
