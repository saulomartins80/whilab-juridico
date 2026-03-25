import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Archive, Boxes, PackagePlus, ShieldCheck, Warehouse } from 'lucide-react';
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
  sku: '',
  category: '',
  price: '',
  stock: '0',
};

export default function EncomendasCatalogoPage() {
  const router = useRouter();
  const loader = useCallback(() => encomendasApi.getCatalog(), []);
  const { loading, result, reload } = useEncomendasResource(loader);
  const data = result?.data;

  const [showComposer, setShowComposer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (router.query.action === 'new-product') {
      setShowComposer(true);
    }
  }, [router.query.action]);

  const closeComposer = () => {
    setShowComposer(false);
    setForm(initialForm);

    if (router.query.action) {
      void router.replace('/encomendas/catalogo', undefined, { shallow: true });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.warn('Informe o nome do produto.');
      return;
    }

    setSaving(true);
    try {
      await encomendasApi.createProduct({
        name: form.name,
        sku: form.sku || undefined,
        category: form.category || undefined,
        unitPrice: Number(form.price || 0),
        metadata: {
          stockQuantity: Number(form.stock || 0),
          reservedQuantity: 0,
        },
      });
      toast.success('Produto salvo com sucesso.');
      closeComposer();
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  };

  const inactiveProducts = data?.products.filter((product) => product.status === 'inativo').length ?? 0;

  const metrics = [
    {
      label: 'Produtos no catalogo',
      value: formatCompactNumber(data?.summary.totalProducts ?? 0),
      hint: 'Todos os SKUs mapeados pelo backend.',
      icon: Boxes,
      tone: 'emerald' as const,
    },
    {
      label: 'Produtos ativos',
      value: formatCompactNumber(data?.summary.activeProducts ?? 0),
      hint: 'Itens prontos para venda ou reposicao.',
      icon: ShieldCheck,
      tone: 'sky' as const,
    },
    {
      label: 'Catalogo em pausa',
      value: formatCompactNumber(inactiveProducts),
      hint: 'Itens marcados como inativos no momento.',
      icon: PackagePlus,
      tone: 'amber' as const,
    },
    {
      label: 'Valor do estoque',
      value: formatCurrency(data?.summary.inventoryValue ?? 0),
      hint: 'Estimativa calculada por preco x estoque disponivel.',
      icon: Warehouse,
      tone: 'rose' as const,
    },
  ];

  return (
    <EncomendasPageFrame
      activePath="/encomendas/catalogo"
      title="Catalogo e produtos"
      description="Pagina protegida para ler SKUs, disponibilidade e sinais de operacao dentro do vertical de encomendas."
    >
      <EncomendasStatusBanner loading={loading} result={result} onRetry={reload} />

      <EncomendasMetricsGrid items={metrics} />

      <EncomendasCollectionCard
        title="Novo produto"
        description="Cadastre um item do catalogo para usar na composicao do pedido."
      >
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              O estoque inicial vai para o `metadata` do produto, suficiente para a primeira validacao do vertical.
            </p>
            <button
              type="button"
              onClick={() => setShowComposer((current) => !current)}
              className="app-shell-button-primary"
            >
              <PackagePlus className="h-4 w-4" />
              {showComposer ? 'Fechar cadastro' : 'Novo produto'}
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
                  placeholder="Produto"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">SKU</span>
                <input
                  value={form.sku}
                  onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="SKU-001"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Categoria</span>
                <input
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="Categoria"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Preco</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="0,00"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Estoque inicial</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-white/[0.08] dark:bg-slate-950/60 dark:text-white"
                  placeholder="0"
                />
              </label>

              <div className="lg:col-span-5 flex flex-wrap gap-3">
                <button type="submit" disabled={saving} className="app-shell-button-primary">
                  <PackagePlus className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar produto'}
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
        title="Grade de produtos"
        description="Cards responsivos para manter leitura boa em mobile e desktop."
      >
        {data?.products.length ? (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {data.products.map((product) => (
              <article key={product.id} className="dashboard-surface-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{product.sku}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(product.status)}`}>
                    {humanizeStatus(product.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Preco</p>
                    <p className="mt-1 font-medium text-slate-900 dark:text-white">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Categoria</p>
                    <p className="mt-1 font-medium text-slate-900 dark:text-white">
                      {product.category || 'Sem categoria'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Estoque</p>
                    <p className="mt-1 font-medium text-slate-900 dark:text-white">{product.stock}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Reservado</p>
                    <p className="mt-1 font-medium text-slate-900 dark:text-white">
                      {product.reservedStock}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Atualizado {formatDate(product.updatedAt)}
                  </span>
                  <span>{product.stock <= 5 ? 'Reposicao recomendada' : 'Cobertura saudavel'}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EncomendasEmptyCollection
            title="Catalogo indisponivel"
            description="Sem dados de produtos por enquanto. Quando o endpoint existir, os cards vao refletir estoque, preco e status."
          />
        )}
      </EncomendasCollectionCard>
    </EncomendasPageFrame>
  );
}
