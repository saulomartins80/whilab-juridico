import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Package,
  Plus,
  RefreshCcw,
  Users,
} from 'lucide-react';
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
import EncomendasInstallPrompt from '../../components/encomendas/EncomendasInstallPrompt';
import encomendasApi from '../../services/encomendasApi';
import type { EncomendasCustomer, EncomendasProduct } from '../../types/encomendas';

const orderStatuses = [
  { value: 'pending_payment', label: 'Aguardando pagamento' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'Em preparo' },
  { value: 'shipped', label: 'Em entrega' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

const initialOrderForm = {
  customerId: '',
  productId: '',
  quantity: '1',
  shippingAmount: '0',
  discountAmount: '0',
  status: 'pending_payment',
  notes: '',
  paymentLinkUrl: '',
};

export default function EncomendasOverviewPage() {
  const router = useRouter();
  const loader = useCallback(() => encomendasApi.getOverview(), []);
  const { loading, result, reload } = useEncomendasResource(loader);
  const data = result?.data;

  const [customers, setCustomers] = useState<EncomendasCustomer[]>([]);
  const [products, setProducts] = useState<EncomendasProduct[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [form, setForm] = useState(initialOrderForm);

  const loadSupportData = useCallback(async () => {
    try {
      const [customersResult, catalogResult] = await Promise.all([
        encomendasApi.getCustomers(),
        encomendasApi.getCatalog(),
      ]);

      setCustomers(customersResult.data.customers);
      setProducts(catalogResult.data.products);
    } catch {
      setCustomers([]);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    void loadSupportData();
  }, [loadSupportData]);

  useEffect(() => {
    if (router.query.action === 'new-order') {
      setShowComposer(true);
    }
  }, [router.query.action]);

  const closeComposer = () => {
    setShowComposer(false);
    setForm(initialOrderForm);

    if (router.query.action) {
      void router.replace('/encomendas', undefined, { shallow: true });
    }
  };

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === form.productId) || null,
    [products, form.productId],
  );

  const estimatedTotal = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const shipping = Number(form.shippingAmount || 0);
    const discount = Number(form.discountAmount || 0);
    const subtotal = (selectedProduct?.price || 0) * quantity;
    return Math.max(0, subtotal + shipping - discount);
  }, [form.discountAmount, form.quantity, form.shippingAmount, selectedProduct?.price]);

  const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.customerId || !form.productId) {
      toast.warn('Selecione cliente e produto para criar o pedido.');
      return;
    }

    setSavingOrder(true);
    try {
      await encomendasApi.createOrder({
        customerId: form.customerId,
        status: form.status,
        shippingAmount: Number(form.shippingAmount || 0),
        discountAmount: Number(form.discountAmount || 0),
        notes: form.notes || undefined,
        items: [
          {
            productId: form.productId,
            quantity: Number(form.quantity || 1),
          },
        ],
        charge: form.paymentLinkUrl
          ? {
              paymentLinkUrl: form.paymentLinkUrl,
              amount: estimatedTotal,
            }
          : undefined,
      });

      toast.success('Pedido criado com sucesso.');
      closeComposer();
      await Promise.all([reload(), loadSupportData()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar pedido.');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      await encomendasApi.updateOrderStatus(orderId, status);
      toast.success('Status do pedido atualizado.');
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const metrics = [
    {
      label: 'Pedidos monitorados',
      value: formatCompactNumber(data?.stats.totalOrders ?? 0),
      hint: 'Visao consolidada da operacao de pedidos.',
      icon: ClipboardList,
      tone: 'emerald' as const,
    },
    {
      label: 'Receita em pedidos',
      value: formatCurrency(data?.stats.totalRevenue ?? 0),
      hint: 'Volume financeiro capturado pelo vertical.',
      icon: CircleDollarSign,
      tone: 'sky' as const,
    },
    {
      label: 'Clientes ativos',
      value: formatCompactNumber(data?.stats.activeCustomers ?? 0),
      hint: 'Contas com atividade recente ou pedidos em aberto.',
      icon: Users,
      tone: 'amber' as const,
    },
    {
      label: 'Cobrancas pendentes',
      value: formatCompactNumber(data?.stats.pendingCharges ?? 0),
      hint: `${formatCompactNumber(data?.stats.overdueCharges ?? 0)} vencidas no momento.`,
      icon: CreditCard,
      tone: 'rose' as const,
    },
  ];

  return (
    <EncomendasPageFrame
      activePath="/encomendas"
      title="Overview de pedidos e cobrancas"
      description="Painel inicial para acompanhar o pulso comercial do App de Encomendas."
    >
      <EncomendasStatusBanner loading={loading} result={result} onRetry={reload} />

      <EncomendasInstallPrompt />

      <EncomendasMetricsGrid items={metrics} />

      <EncomendasCollectionCard
        title="Novo pedido"
        description="Crie um pedido operacional sem sair do overview."
      >
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              O fluxo inicial cria pedido com um item, status operacional e link de cobranca opcional.
            </p>
            <button
              type="button"
              onClick={() => setShowComposer((current) => !current)}
              className="app-shell-button-primary"
            >
              <Plus className="h-4 w-4" />
              {showComposer ? 'Fechar pedido' : 'Novo pedido'}
            </button>
          </div>

          {showComposer && (
            <form onSubmit={handleCreateOrder} className="mt-5 grid gap-4 lg:grid-cols-6">
              <label className="lg:col-span-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Cliente</span>
                <select
                  value={form.customerId}
                  onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                >
                  <option value="">Selecione</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="lg:col-span-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Produto</span>
                <select
                  value={form.productId}
                  onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                >
                  <option value="">Selecione</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Quantidade</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Status inicial</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                >
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Taxa de entrega</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shippingAmount}
                  onChange={(event) => setForm((current) => ({ ...current, shippingAmount: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Desconto</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discountAmount}
                  onChange={(event) => setForm((current) => ({ ...current, discountAmount: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                />
              </label>

              <label className="lg:col-span-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Link de cobranca opcional</span>
                <input
                  value={form.paymentLinkUrl}
                  onChange={(event) => setForm((current) => ({ ...current, paymentLinkUrl: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="https://..."
                />
              </label>

              <label className="lg:col-span-3">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Observacoes</span>
                <input
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="Observacoes do pedido"
                />
              </label>

              <div className="lg:col-span-6 flex flex-wrap items-center justify-between gap-3">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                  Total estimado: <span className="font-semibold text-slate-950 dark:text-white">{formatCurrency(estimatedTotal)}</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" disabled={savingOrder} className="app-shell-button-primary">
                    <Plus className="h-4 w-4" />
                    {savingOrder ? 'Salvando...' : 'Criar pedido'}
                  </button>
                  <button type="button" onClick={closeComposer} className="dashboard-secondary-button">
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </EncomendasCollectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <EncomendasCollectionCard
          title="Pedidos recentes"
          description="Pedidos mais recentes para leitura operacional rapida."
        >
          {data?.recentOrders.length ? (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead className="border-b border-slate-200/70 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/30">
                    <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      <th className="px-5 py-4">Pedido</th>
                      <th className="px-5 py-4">Cliente</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Entrega</th>
                      <th className="px-5 py-4 text-right">Total</th>
                      <th className="px-5 py-4">Atualizar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="dashboard-table-row border-b border-slate-200/60 dark:border-slate-800">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{order.code}</div>
                          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {order.itemCount} itens
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {order.customerName}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(order.status)}`}>
                            {humanizeStatus(order.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(order.expectedDeliveryAt)}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            disabled={updatingOrderId === order.id}
                            onChange={(event) => void handleStatusUpdate(order.id, event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                          >
                            {orderStatuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-4 lg:hidden">
                {data.recentOrders.map((order) => (
                  <article key={order.id} className="dashboard-surface-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{order.code}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {order.customerName}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(order.status)}`}>
                        {humanizeStatus(order.status)}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Entrega</p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                          {formatDate(order.expectedDeliveryAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Total</p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-white">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <select
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(event) => void handleStatusUpdate(order.id, event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                      >
                        {orderStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <EncomendasEmptyCollection
              title="Nenhum pedido retornado"
              description="Quando o backend publicar pedidos, esta area passa a mostrar codigo, cliente, status e valor total."
            />
          )}
        </EncomendasCollectionCard>

        <div className="grid gap-6">
          <EncomendasCollectionCard
            title="Clientes ativos"
            description="Clientes com maior presenca na operacao recente."
            href="/encomendas/clientes"
          >
            {data?.customers.length ? (
              <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
                {data.customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{customer.name}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {customer.activeOrders} pedidos ativos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(customer.lifetimeValue)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        ultimo pedido {formatDate(customer.lastOrderAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EncomendasEmptyCollection
                title="Sem clientes em destaque"
                description="A pagina de clientes continuara acessivel mesmo se a colecao ainda nao existir no backend."
              />
            )}
          </EncomendasCollectionCard>

          <EncomendasCollectionCard
            title="Catalogo e cobranca"
            description="Leitura rapida do mix de produtos e da carteira financeira."
          >
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="dashboard-surface-muted p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-sky-100 p-3 dark:bg-sky-950/40">
                    <Package className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Produtos ativos</p>
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">
                      {formatCompactNumber(data?.products.length ?? 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dashboard-surface-muted p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-100 p-3 dark:bg-amber-950/40">
                    <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ticket medio</p>
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(data?.stats.averageTicket ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 px-4 pb-5">
              <button type="button" onClick={() => void loadSupportData()} className="dashboard-secondary-button">
                <RefreshCcw className="h-4 w-4" />
                Atualizar base auxiliar
              </button>
            </div>
          </EncomendasCollectionCard>
        </div>
      </div>
    </EncomendasPageFrame>
  );
}
