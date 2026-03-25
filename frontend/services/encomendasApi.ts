import api from './api';

import type {
  EncomendasCatalogData,
  EncomendasCharge,
  EncomendasChargesData,
  EncomendasCustomer,
  EncomendasCustomersData,
  EncomendasOrder,
  EncomendasOverviewData,
  EncomendasProduct,
  EncomendasResourceResult,
} from '../types/encomendas';
import {
  emptyEncomendasCatalogData,
  emptyEncomendasChargesData,
  emptyEncomendasCustomersData,
  emptyEncomendasOverviewData,
} from '../types/encomendas';

type UnknownRecord = Record<string, unknown>;

const overviewPaths = [
  '/api/encomendas/overview',
  '/api/orders/overview',
  '/api/pedidos/overview',
  '/api/encomendas',
  '/api/orders',
];

const ordersPaths = [
  '/api/encomendas/orders',
  '/api/orders',
  '/api/pedidos',
  '/api/encomendas',
];

const customersPaths = [
  '/api/encomendas/customers',
  '/api/orders/customers',
  '/api/clientes',
];

const catalogPaths = [
  '/api/encomendas/products',
  '/api/encomendas/catalog',
  '/api/catalogo/products',
  '/api/products',
  '/api/produtos',
];

const chargesPaths = [
  '/api/encomendas/charges',
  '/api/charges',
  '/api/cobrancas',
];

const unavailableMessage =
  'O backend de encomendas ainda nao respondeu com um endpoint compativel. A tela permanece operacional com estado vazio.';
const schemaMessage =
  'O backend respondeu, mas o schema atual nao corresponde ao esperado pelo frontend de encomendas.';

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function unwrapPayload(value: unknown): unknown {
  const record = asRecord(value);

  if (!record) {
    return value;
  }

  if (record.data !== undefined) {
    return unwrapPayload(record.data);
  }

  if (record.result !== undefined) {
    return unwrapPayload(record.result);
  }

  return value;
}

function lookupValue(record: UnknownRecord | null, keys: string[]): unknown {
  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    const value = record[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function readArray(payload: unknown, keys: string[]): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  const direct = lookupValue(record, keys);

  if (Array.isArray(direct)) {
    return direct;
  }

  for (const key of ['items', 'results', 'overview', 'summary', 'payload']) {
    const nested = asRecord(record?.[key]);
    const nestedArray = lookupValue(nested, keys);

    if (Array.isArray(nestedArray)) {
      return nestedArray;
    }
  }

  return null;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d,.-]/g, '').replace(/\.(?=.*\.)/g, '').replace(',', '.');
    const parsed = Number(normalized);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function toStringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function toDateString(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const record = asRecord(value);

  if (record?.$date !== undefined) {
    return toDateString(record.$date);
  }

  return undefined;
}

function normalizeStatus(value: unknown, fallback: string): string {
  return toStringValue(value, fallback).toLowerCase().replace(/[_\s]+/g, '-');
}

function normalizeOrder(raw: unknown, index: number): EncomendasOrder | null {
  const record = asRecord(raw);

  if (!record) {
    return null;
  }

  const customerRecord = asRecord(record.customer);
  const itemsArray = Array.isArray(record.items) ? record.items : [];

  return {
    id: toStringValue(lookupValue(record, ['id', '_id', 'orderId', 'pedido_id']), `order-${index}`),
    code: toStringValue(
      lookupValue(record, ['code', 'codigo', 'numero', 'number', 'reference', 'orderNumber', 'order_number']),
      `PED-${String(index + 1).padStart(3, '0')}`,
    ),
    customerId: toStringValue(lookupValue(record, ['customerId', 'cliente_id', 'buyerId'])) || undefined,
    customerName: toStringValue(
      lookupValue(record, ['customerName', 'cliente_nome', 'cliente', 'customer', 'buyerName']),
      toStringValue(lookupValue(customerRecord, ['name', 'nome']), 'Cliente sem nome'),
    ),
    status: normalizeStatus(lookupValue(record, ['status', 'situacao', 'state']), 'pendente'),
    total: toNumber(
      lookupValue(record, ['total', 'valor_total', 'amount', 'grossAmount', 'subtotal', 'totalAmount', 'total_amount']),
    ),
    itemCount: toNumber(
      lookupValue(record, ['itemCount', 'itens', 'items_count', 'quantidade_itens', 'productsCount']),
    ) || itemsArray.length,
    createdAt: toDateString(lookupValue(record, ['createdAt', 'created_at', 'data_criacao', 'date', 'placedAt', 'placed_at'])),
    expectedDeliveryAt: toDateString(
      lookupValue(record, ['expectedDeliveryAt', 'deliveryAt', 'previsao_entrega', 'delivery_date', 'scheduledFor', 'agendado_para']),
    ),
    channel: toStringValue(lookupValue(record, ['channel', 'origem', 'salesChannel'])) || undefined,
  };
}

function normalizeCustomer(raw: unknown, index: number): EncomendasCustomer | null {
  const record = asRecord(raw);

  if (!record) {
    return null;
  }

  const metadataRecord = asRecord(record.metadata);

  const totalOrders = toNumber(
    lookupValue(record, ['totalOrders', 'pedidos_total', 'ordersCount', 'orders']),
  );

  return {
    id: toStringValue(
      lookupValue(record, ['id', '_id', 'customerId', 'cliente_id']),
      `customer-${index}`,
    ),
    name: toStringValue(lookupValue(record, ['name', 'nome', 'customerName']), 'Cliente sem nome'),
    email: toStringValue(lookupValue(record, ['email'])) || undefined,
    phone: toStringValue(lookupValue(record, ['phone', 'telefone'])) || undefined,
    city: toStringValue(lookupValue(record, ['city', 'cidade'])) || toStringValue(lookupValue(metadataRecord, ['city', 'cidade'])) || undefined,
    state: toStringValue(lookupValue(record, ['state', 'estado', 'uf'])) || toStringValue(lookupValue(metadataRecord, ['state', 'estado', 'uf'])) || undefined,
    status: normalizeStatus(
      lookupValue(record, ['status', 'situacao', 'segment']),
      record.active === false ? 'inativo' : 'ativo',
    ),
    activeOrders: toNumber(
      lookupValue(record, ['activeOrders', 'pedidos_ativos', 'openOrders', 'open_orders']),
    ),
    totalOrders,
    lifetimeValue: toNumber(
      lookupValue(record, ['lifetimeValue', 'valor_total', 'totalSpent', 'revenue']),
    ),
    lastOrderAt: toDateString(
      lookupValue(record, ['lastOrderAt', 'ultimo_pedido_em', 'lastPurchaseAt']),
    ),
  };
}

function normalizeProduct(raw: unknown, index: number): EncomendasProduct | null {
  const record = asRecord(raw);

  if (!record) {
    return null;
  }

  const metadataRecord = asRecord(record.metadata);

  return {
    id: toStringValue(lookupValue(record, ['id', '_id', 'productId', 'produto_id']), `product-${index}`),
    name: toStringValue(lookupValue(record, ['name', 'nome', 'title']), 'Produto sem nome'),
    sku: toStringValue(lookupValue(record, ['sku', 'codigo', 'code']), `SKU-${index + 1}`),
    category: toStringValue(lookupValue(record, ['category', 'categoria'])) || undefined,
    price: toNumber(lookupValue(record, ['price', 'preco', 'valor', 'unitPrice', 'unit_price'])),
    stock:
      toNumber(lookupValue(record, ['stock', 'estoque', 'availableStock', 'stockQuantity', 'stock_quantity'])) ||
      toNumber(lookupValue(metadataRecord, ['stock', 'stockQuantity', 'stock_quantity'])),
    reservedStock:
      toNumber(lookupValue(record, ['reservedStock', 'estoque_reservado', 'reserved', 'reservedQuantity', 'reserved_quantity'])) ||
      toNumber(lookupValue(metadataRecord, ['reservedStock', 'reservedQuantity', 'reserved_quantity'])),
    status: normalizeStatus(
      lookupValue(record, ['status', 'situacao']),
      record.active === false ? 'inativo' : 'ativo',
    ),
    updatedAt: toDateString(lookupValue(record, ['updatedAt', 'updated_at', 'atualizado_em'])),
  };
}

function normalizeCharge(raw: unknown, index: number): EncomendasCharge | null {
  const record = asRecord(raw);

  if (!record) {
    return null;
  }

  const orderRecord = asRecord(record.order);

  return {
    id: toStringValue(lookupValue(record, ['id', '_id', 'chargeId', 'cobranca_id']), `charge-${index}`),
    reference: toStringValue(
      lookupValue(record, ['reference', 'codigo', 'invoiceNumber', 'numero', 'externalReference', 'external_reference']),
      toStringValue(lookupValue(orderRecord, ['orderNumber', 'order_number']), `COB-${String(index + 1).padStart(3, '0')}`),
    ),
    customerName: toStringValue(
      lookupValue(record, ['customerName', 'cliente_nome', 'customer', 'cliente']),
      toStringValue(lookupValue(orderRecord, ['customerName', 'customer_name']), 'Cliente sem nome'),
    ),
    status: normalizeStatus(lookupValue(record, ['status', 'situacao']), 'aberta'),
    amount: toNumber(lookupValue(record, ['amount', 'valor', 'total'])),
    dueAt: toDateString(lookupValue(record, ['dueAt', 'vencimento', 'due_date', 'expiresAt', 'expires_at'])),
    paidAt: toDateString(lookupValue(record, ['paidAt', 'pago_em', 'paymentDate', 'paid_at'])),
    paymentMethod: toStringValue(
      lookupValue(record, ['paymentMethod', 'forma_pagamento', 'method', 'provider']),
    ) || undefined,
  };
}

function sumBy<T>(items: T[], getter: (item: T) => number): number {
  return items.reduce((total, item) => total + getter(item), 0);
}

function buildUnavailableResult<T>(
  data: T,
  message = unavailableMessage,
  source?: string,
): EncomendasResourceResult<T> {
  return { status: 'unavailable', data, message, source };
}

function buildSchemaMismatchResult<T>(
  data: T,
  message = schemaMessage,
  source?: string,
): EncomendasResourceResult<T> {
  return { status: 'schema-mismatch', data, message, source };
}

function buildSuccessResult<T>(
  data: T,
  isEmpty: boolean,
  emptyMessage: string,
  readyMessage: string,
  source?: string,
): EncomendasResourceResult<T> {
  return {
    status: isEmpty ? 'empty' : 'ready',
    data,
    message: isEmpty ? emptyMessage : readyMessage,
    source,
  };
}

function errorToMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return unavailableMessage;
}

async function getFirstAvailablePayload(
  paths: string[],
): Promise<{ payload: unknown; source: string; raw: unknown } | null> {
  let lastError: string | undefined;

  for (const path of paths) {
    try {
      const response = await api.get(path, { timeout: 12000 });
      return { payload: unwrapPayload(response.data), source: path, raw: response.data };
    } catch (error) {
      lastError = errorToMessage(error);
    }
  }

  if (lastError) {
    throw new Error(lastError);
  }

  return null;
}

function inspectBackendMeta<T>(raw: unknown, emptyData: T, source: string): EncomendasResourceResult<T> | null {
  const rawRecord = asRecord(raw);
  const metaRecord = asRecord(rawRecord?.meta);

  if (!metaRecord) {
    return null;
  }

  if (metaRecord.schemaReady === false) {
    return buildSchemaMismatchResult(
      emptyData,
      toStringValue(lookupValue(metaRecord, ['message']), schemaMessage),
      source,
    );
  }

  if (metaRecord.profileReady === false) {
    return buildUnavailableResult(
      emptyData,
      toStringValue(lookupValue(metaRecord, ['message']), unavailableMessage),
      source,
    );
  }

  return null;
}

async function getOrdersCollection(): Promise<EncomendasResourceResult<EncomendasOrder[]>> {
  try {
    const resolved = await getFirstAvailablePayload(ordersPaths);

    if (!resolved) {
      return buildUnavailableResult([], unavailableMessage);
    }

    const metaResult = inspectBackendMeta(resolved.raw, [], resolved.source);
    if (metaResult) {
      return metaResult;
    }

    const items = readArray(resolved.payload, ['orders', 'pedidos', 'recentOrders', 'items']);

    if (!items) {
      return buildSchemaMismatchResult([], schemaMessage, resolved.source);
    }

    const orders = items.map(normalizeOrder).filter(Boolean) as EncomendasOrder[];

    return buildSuccessResult(
      orders,
      orders.length === 0,
      'Nenhum pedido apareceu no backend ate agora.',
      'Pedidos carregados com sucesso.',
      resolved.source,
    );
  } catch (error) {
    return buildUnavailableResult([], errorToMessage(error));
  }
}

function normalizeOverviewPayload(payload: unknown): EncomendasOverviewData | null {
  const recentOrders = (readArray(payload, ['recentOrders', 'orders', 'pedidos', 'items']) || [])
    .map(normalizeOrder)
    .filter(Boolean) as EncomendasOrder[];
  const customers = (readArray(payload, ['customers', 'clientes']) || [])
    .map(normalizeCustomer)
    .filter(Boolean) as EncomendasCustomer[];
  const products = (readArray(payload, ['products', 'produtos', 'catalog']) || [])
    .map(normalizeProduct)
    .filter(Boolean) as EncomendasProduct[];
  const charges = (readArray(payload, ['charges', 'cobrancas', 'invoices']) || [])
    .map(normalizeCharge)
    .filter(Boolean) as EncomendasCharge[];

  const record = asRecord(payload);
  const customersSummaryRecord = asRecord(record?.customers);
  const ordersSummaryRecord = asRecord(record?.orders);
  const chargesSummaryRecord = asRecord(record?.charges);
  const metricsRecord = asRecord(lookupValue(record, ['metrics', 'stats', 'summary', 'kpis'])) || record;

  const totalOrders =
    toNumber(lookupValue(metricsRecord, ['totalOrders', 'orders', 'pedidos_total'])) ||
    toNumber(lookupValue(ordersSummaryRecord, ['total', 'totalOrders', 'pedidos_total'])) ||
    recentOrders.length;
  const activeCustomers =
    toNumber(lookupValue(metricsRecord, ['activeCustomers', 'clientes_ativos', 'customers'])) ||
    toNumber(lookupValue(customersSummaryRecord, ['active', 'activeCustomers', 'clientes_ativos'])) ||
    customers.filter((customer) => customer.status !== 'inativo').length;
  const totalRevenue =
    toNumber(lookupValue(metricsRecord, ['totalRevenue', 'receita_total', 'revenue'])) ||
    toNumber(lookupValue(ordersSummaryRecord, ['totalAmount', 'total_amount', 'receita_total'])) ||
    sumBy(recentOrders, (order) => order.total);
  const pendingCharges =
    toNumber(lookupValue(metricsRecord, ['pendingCharges', 'cobrancas_abertas', 'openCharges'])) ||
    toNumber(lookupValue(asRecord(chargesSummaryRecord?.byStatus), ['pending', 'pendente', 'open'])) ||
    charges.filter((charge) => charge.status === 'aberta' || charge.status === 'pendente').length;
  const overdueCharges =
    toNumber(lookupValue(metricsRecord, ['overdueCharges', 'cobrancas_vencidas'])) ||
    charges.filter((charge) => charge.status === 'vencida' || charge.status === 'overdue').length;
  const averageTicket =
    toNumber(lookupValue(metricsRecord, ['averageTicket', 'ticket_medio'])) ||
    (totalOrders > 0 ? totalRevenue / totalOrders : 0);

  const hasKnownShape =
    recentOrders.length > 0 ||
    customers.length > 0 ||
    products.length > 0 ||
    charges.length > 0 ||
    totalOrders > 0 ||
    activeCustomers > 0 ||
    totalRevenue > 0;

  if (!hasKnownShape && !record) {
    return null;
  }

  return {
    stats: {
      totalOrders,
      activeCustomers,
      totalRevenue,
      averageTicket,
      pendingCharges,
      overdueCharges,
    },
    recentOrders,
    customers,
    products,
    charges,
  };
}

function normalizeCustomersPayload(payload: unknown): EncomendasCustomersData | null {
  const customersArray = readArray(payload, ['customers', 'clientes', 'items']);

  if (!customersArray) {
    return null;
  }

  const customers = customersArray.map(normalizeCustomer).filter(Boolean) as EncomendasCustomer[];
  const record = asRecord(payload);
  const summaryRecord = asRecord(lookupValue(record, ['summary', 'stats', 'metrics'])) || record;
  const activeCustomers =
    toNumber(lookupValue(summaryRecord, ['activeCustomers', 'clientes_ativos'])) ||
    customers.filter((customer) => customer.status !== 'inativo').length;

  return {
    summary: {
      totalCustomers:
        toNumber(lookupValue(summaryRecord, ['totalCustomers', 'clientes_total'])) || customers.length,
      activeCustomers,
      newCustomers: toNumber(lookupValue(summaryRecord, ['newCustomers', 'clientes_novos'])),
      averageLifetimeValue:
        toNumber(lookupValue(summaryRecord, ['averageLifetimeValue', 'ticket_medio_cliente'])) ||
        (customers.length > 0
          ? sumBy(customers, (customer) => customer.lifetimeValue) / customers.length
          : 0),
      customersWithOpenCharges:
        toNumber(lookupValue(summaryRecord, ['customersWithOpenCharges', 'clientes_em_aberto'])) ||
        customers.filter((customer) => customer.activeOrders > 0).length,
    },
    customers,
  };
}

function normalizeCatalogPayload(payload: unknown): EncomendasCatalogData | null {
  const productsArray = readArray(payload, ['products', 'produtos', 'catalog', 'items']);

  if (!productsArray) {
    return null;
  }

  const products = productsArray.map(normalizeProduct).filter(Boolean) as EncomendasProduct[];
  const record = asRecord(payload);
  const summaryRecord = asRecord(lookupValue(record, ['summary', 'stats', 'metrics'])) || record;

  return {
    summary: {
      totalProducts:
        toNumber(lookupValue(summaryRecord, ['totalProducts', 'produtos_total'])) || products.length,
      activeProducts:
        toNumber(lookupValue(summaryRecord, ['activeProducts', 'produtos_ativos'])) ||
        products.filter((product) => product.status !== 'inativo').length,
      lowStockProducts:
        toNumber(lookupValue(summaryRecord, ['lowStockProducts', 'estoque_baixo'])) ||
        products.filter((product) => product.stock <= 5).length,
      inventoryValue:
        toNumber(lookupValue(summaryRecord, ['inventoryValue', 'valor_estoque'])) ||
        sumBy(products, (product) => product.price * product.stock),
    },
    products,
  };
}

function normalizeChargesPayload(payload: unknown): EncomendasChargesData | null {
  const chargesArray = readArray(payload, ['charges', 'cobrancas', 'items', 'invoices']);

  if (!chargesArray) {
    return null;
  }

  const charges = chargesArray.map(normalizeCharge).filter(Boolean) as EncomendasCharge[];
  const record = asRecord(payload);
  const summaryRecord = asRecord(lookupValue(record, ['summary', 'stats', 'metrics'])) || record;

  return {
    summary: {
      totalCharges:
        toNumber(lookupValue(summaryRecord, ['totalCharges', 'cobrancas_total'])) || charges.length,
      openCharges:
        toNumber(lookupValue(summaryRecord, ['openCharges', 'cobrancas_abertas'])) ||
        charges.filter((charge) => charge.status === 'aberta' || charge.status === 'pendente').length,
      overdueCharges:
        toNumber(lookupValue(summaryRecord, ['overdueCharges', 'cobrancas_vencidas'])) ||
        charges.filter((charge) => charge.status === 'vencida' || charge.status === 'overdue').length,
      paidCharges:
        toNumber(lookupValue(summaryRecord, ['paidCharges', 'cobrancas_pagas'])) ||
        charges.filter((charge) => charge.status === 'paga' || charge.status === 'paid').length,
      totalOpenAmount:
        toNumber(lookupValue(summaryRecord, ['totalOpenAmount', 'valor_em_aberto'])) ||
        sumBy(charges, (charge) =>
          charge.status === 'paga' || charge.status === 'paid' ? 0 : charge.amount,
        ),
    },
    charges,
  };
}

async function fetchResource<T>(
  paths: string[],
  normalize: (payload: unknown) => T | null,
  emptyData: T,
  readyMessage: string,
  emptyMessage: string,
  isEmpty: (data: T) => boolean,
): Promise<EncomendasResourceResult<T>> {
  try {
    const resolved = await getFirstAvailablePayload(paths);

    if (!resolved) {
      return buildUnavailableResult(emptyData);
    }

    const metaResult = inspectBackendMeta(resolved.raw, emptyData, resolved.source);
    if (metaResult) {
      return metaResult;
    }

    const normalized = normalize(resolved.payload);

    if (!normalized) {
      return buildSchemaMismatchResult(emptyData, schemaMessage, resolved.source);
    }

    return buildSuccessResult(
      normalized,
      isEmpty(normalized),
      emptyMessage,
      readyMessage,
      resolved.source,
    );
  } catch (error) {
    return buildUnavailableResult(emptyData, errorToMessage(error));
  }
}

export const encomendasApi = {
  async getOverview(): Promise<EncomendasResourceResult<EncomendasOverviewData>> {
    const directResult = await fetchResource(
      overviewPaths,
      normalizeOverviewPayload,
      emptyEncomendasOverviewData,
      'Visao geral de encomendas carregada.',
      'A visao geral ainda nao possui dados de pedidos, clientes ou cobrancas.',
      (data) =>
        data.recentOrders.length === 0 &&
        data.customers.length === 0 &&
        data.products.length === 0 &&
        data.charges.length === 0 &&
        data.stats.totalOrders === 0 &&
        data.stats.totalRevenue === 0,
    );

    if (directResult.status !== 'unavailable') {
      if (
        directResult.data.customers.length === 0 ||
        directResult.data.products.length === 0 ||
        directResult.data.charges.length === 0
      ) {
        const [customersResult, catalogResult, chargesResult] = await Promise.all([
          this.getCustomers(),
          this.getCatalog(),
          this.getCharges(),
        ]);

        return {
          ...directResult,
          data: {
            ...directResult.data,
            customers:
              directResult.data.customers.length > 0
                ? directResult.data.customers
                : customersResult.data.customers.slice(0, 5),
            products:
              directResult.data.products.length > 0
                ? directResult.data.products
                : catalogResult.data.products.slice(0, 4),
            charges:
              directResult.data.charges.length > 0
                ? directResult.data.charges
                : chargesResult.data.charges.slice(0, 5),
          },
        };
      }

      return directResult;
    }

    const [ordersResult, customersResult, catalogResult, chargesResult] = await Promise.all([
      getOrdersCollection(),
      this.getCustomers(),
      this.getCatalog(),
      this.getCharges(),
    ]);

    const combinedData: EncomendasOverviewData = {
      stats: {
        totalOrders:
          ordersResult.status === 'ready' || ordersResult.status === 'empty'
            ? ordersResult.data.length
            : 0,
        activeCustomers:
          customersResult.status === 'ready' || customersResult.status === 'empty'
            ? customersResult.data.summary.activeCustomers
            : 0,
        totalRevenue:
          ordersResult.status === 'ready' || ordersResult.status === 'empty'
            ? sumBy(ordersResult.data, (order) => order.total)
            : 0,
        averageTicket:
          ordersResult.status === 'ready' || ordersResult.status === 'empty'
            ? ordersResult.data.length > 0
              ? sumBy(ordersResult.data, (order) => order.total) / ordersResult.data.length
              : 0
            : 0,
        pendingCharges:
          chargesResult.status === 'ready' || chargesResult.status === 'empty'
            ? chargesResult.data.summary.openCharges
            : 0,
        overdueCharges:
          chargesResult.status === 'ready' || chargesResult.status === 'empty'
            ? chargesResult.data.summary.overdueCharges
            : 0,
      },
      recentOrders:
        ordersResult.status === 'ready' || ordersResult.status === 'empty'
          ? ordersResult.data.slice(0, 6)
          : [],
      customers:
        customersResult.status === 'ready' || customersResult.status === 'empty'
          ? customersResult.data.customers.slice(0, 5)
          : [],
      products:
        catalogResult.status === 'ready' || catalogResult.status === 'empty'
          ? catalogResult.data.products.slice(0, 4)
          : [],
      charges:
        chargesResult.status === 'ready' || chargesResult.status === 'empty'
          ? chargesResult.data.charges.slice(0, 5)
          : [],
    };

    const hasAnyData =
      combinedData.recentOrders.length > 0 ||
      combinedData.customers.length > 0 ||
      combinedData.products.length > 0 ||
      combinedData.charges.length > 0;

    if (!hasAnyData) {
      return buildUnavailableResult(
        combinedData,
        'Nenhum endpoint de encomendas compativel foi encontrado no backend atual.',
      );
    }

    return buildSuccessResult(
      combinedData,
      false,
      '',
      'Visao geral montada a partir dos endpoints disponiveis.',
    );
  },

  async getCustomers(): Promise<EncomendasResourceResult<EncomendasCustomersData>> {
    return fetchResource(
      customersPaths,
      normalizeCustomersPayload,
      emptyEncomendasCustomersData,
      'Clientes carregados com sucesso.',
      'Nenhum cliente de encomendas foi encontrado ate o momento.',
      (data) => data.customers.length === 0,
    );
  },

  async getCatalog(): Promise<EncomendasResourceResult<EncomendasCatalogData>> {
    return fetchResource(
      catalogPaths,
      normalizeCatalogPayload,
      emptyEncomendasCatalogData,
      'Catalogo carregado com sucesso.',
      'Nenhum produto apareceu no catalogo ainda.',
      (data) => data.products.length === 0,
    );
  },

  async getCharges(): Promise<EncomendasResourceResult<EncomendasChargesData>> {
    return fetchResource(
      chargesPaths,
      normalizeChargesPayload,
      emptyEncomendasChargesData,
      'Cobrancas carregadas com sucesso.',
      'Nenhuma cobranca foi retornada pelo backend.',
      (data) => data.charges.length === 0,
    );
  },

  async createCustomer(payload: Record<string, unknown>) {
    const response = await api.post('/api/encomendas/customers', payload);
    const customer = normalizeCustomer(unwrapPayload(response.data), 0);

    if (!customer) {
      throw new Error('Resposta invalida ao criar cliente.');
    }

    return customer;
  },

  async createProduct(payload: Record<string, unknown>) {
    const response = await api.post('/api/encomendas/products', payload);
    const product = normalizeProduct(unwrapPayload(response.data), 0);

    if (!product) {
      throw new Error('Resposta invalida ao criar produto.');
    }

    return product;
  },

  async createOrder(payload: Record<string, unknown>) {
    const response = await api.post('/api/encomendas/orders', payload);
    const order = normalizeOrder(unwrapPayload(response.data), 0);

    if (!order) {
      throw new Error('Resposta invalida ao criar pedido.');
    }

    return order;
  },

  async updateOrderStatus(orderId: string, status: string) {
    const response = await api.patch(`/api/encomendas/orders/${orderId}/status`, { status });
    const order = normalizeOrder(unwrapPayload(response.data), 0);

    if (!order) {
      throw new Error('Resposta invalida ao atualizar pedido.');
    }

    return order;
  },
};

export default encomendasApi;
