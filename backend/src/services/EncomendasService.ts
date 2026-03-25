import { AppError } from '../core/errors/AppError';
import { supabase } from '../config/supabase';

type AvailabilityReason = 'schema_missing' | 'user_profile_missing';

type ResponseMeta = {
  schemaReady: boolean;
  profileReady: boolean;
  mode: 'ready' | 'degraded';
  message?: string;
  reason?: AvailabilityReason;
};

type ReadResponse<T> = {
  data: T;
  meta: ResponseMeta;
};

type DomainActor = {
  authUserId: string;
  profileId: string;
  email?: string;
  displayName?: string;
};

type OrderItemInput = {
  product_id?: string;
  productId?: string;
  quantity?: number | string;
  unit_price?: number | string;
  unitPrice?: number | string;
  metadata?: Record<string, unknown>;
};

type OrderInput = {
  customer_id?: string;
  customerId?: string;
  status?: string;
  discount_amount?: number | string;
  discountAmount?: number | string;
  shipping_amount?: number | string;
  shippingAmount?: number | string;
  currency?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  items?: OrderItemInput[];
  charge?: {
    amount?: number | string;
    provider?: string;
    status?: string;
    payment_link_url?: string;
    paymentLinkUrl?: string;
    external_reference?: string;
    externalReference?: string;
    expires_at?: string;
    expiresAt?: string;
    paid_at?: string;
    paidAt?: string;
    metadata?: Record<string, unknown>;
  };
};

const ENCOMENDAS_SCHEMA_MESSAGE =
  'O schema do App de Encomendas ainda nao foi aplicado neste ambiente.';
const ENCOMENDAS_PROFILE_MESSAGE =
  'Perfil do usuario nao encontrado para o App de Encomendas.';

const ORDER_STATUSES = new Set([
  'draft',
  'pending_payment',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled'
]);

const CHARGE_STATUSES = new Set(['pending', 'paid', 'expired', 'cancelled', 'failed']);
const DEFAULT_CURRENCY = 'BRL';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const normalizeOptionalString = (value: unknown): string | null => {
  return normalizeString(value) || null;
};

const normalizeCurrency = (value: unknown): string => {
  const currency = normalizeString(value)?.toUpperCase();
  return currency || DEFAULT_CURRENCY;
};

const normalizeDecimal = (value: unknown, fallback = 0, decimals = 2): number => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Number(numberValue.toFixed(decimals));
};

const normalizeNumber = (value: unknown, fallback = 0): number => {
  return normalizeDecimal(value, fallback, 2);
};

const normalizeNonNegativeNumber = (value: unknown, fallback = 0): number => {
  const normalizedValue = normalizeNumber(value, fallback);
  if (normalizedValue < 0) {
    throw new AppError(400, 'Valor numerico nao pode ser negativo.');
  }

  return normalizedValue;
};

const normalizePositiveNumber = (value: unknown): number => {
  const numberValue = normalizeDecimal(value, NaN, 3);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new AppError(400, 'Valor numerico invalido informado.');
  }

  return numberValue;
};

const normalizeMetadata = (value: unknown): Record<string, unknown> => {
  return isPlainObject(value) ? value : {};
};

const normalizeIsoDateTime = (value: unknown): string | null => {
  const rawValue = normalizeString(value);
  if (!rawValue) {
    return null;
  }

  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, 'Data informada em formato invalido.');
  }

  return date.toISOString();
};

const buildOrderNumber = (): string => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `ENC-${datePart}-${randomPart}`;
};

const buildMeta = (overrides: Partial<ResponseMeta> = {}): ResponseMeta => ({
  schemaReady: true,
  profileReady: true,
  mode: 'ready',
  ...overrides
});

const buildReadFallback = <T>(data: T, meta: Partial<ResponseMeta>): ReadResponse<T> => ({
  data,
  meta: buildMeta({
    mode: 'degraded',
    ...meta
  })
});

const isMissingSchemaError = (error: any): boolean => {
  const code = String(error?.code || '').toLowerCase();
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();

  return (
    code === '42p01' ||
    code === 'pgrst205' ||
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    (message.includes('relation') && message.includes('does not exist'))
  );
};

const unwrapResult = <T>(result: { data: T; error: any }): T => {
  if (result.error) {
    throw result.error;
  }

  return result.data;
};

const sumNumbers = (values: number[]): number => {
  return Number(values.reduce((total, value) => total + value, 0).toFixed(2));
};

export class EncomendasService {
  private buildOverviewFallback(): ReadResponse<any> {
    return buildReadFallback(
      {
        customers: { total: 0, active: 0 },
        products: { total: 0, active: 0 },
        orders: {
          total: 0,
          byStatus: {},
          totalAmount: 0
        },
        charges: {
          total: 0,
          byStatus: {},
          pendingAmount: 0
        },
        recentOrders: []
      },
      {
        schemaReady: false,
        message: ENCOMENDAS_SCHEMA_MESSAGE,
        reason: 'schema_missing'
      }
    );
  }

  private async resolveActor(authUserId: string): Promise<DomainActor | null> {
    const profile = unwrapResult(
      await supabase
        .from('users')
        .select('id, email, display_name')
        .eq('firebase_uid', authUserId)
        .maybeSingle()
    );

    if (!profile) {
      return null;
    }

    return {
      authUserId,
      profileId: String((profile as any).id),
      email: (profile as any).email || undefined,
      displayName: (profile as any).display_name || undefined
    };
  }

  private async resolveReadContext(authUserId: string): Promise<{
    actor: DomainActor | null;
    fallback?: ReadResponse<any>;
    meta: ResponseMeta;
  }> {
    const actor = await this.resolveActor(authUserId);

    if (!actor) {
      return {
        actor: null,
        meta: buildMeta({
          mode: 'degraded',
          profileReady: false,
          message: ENCOMENDAS_PROFILE_MESSAGE,
          reason: 'user_profile_missing'
        })
      };
    }

    return {
      actor,
      meta: buildMeta()
    };
  }

  private async requireActor(authUserId: string): Promise<DomainActor> {
    const actor = await this.resolveActor(authUserId);

    if (!actor) {
      throw new AppError(409, ENCOMENDAS_PROFILE_MESSAGE);
    }

    return actor;
  }

  private handleReadError<T>(error: any, fallbackData: T): ReadResponse<T> {
    if (isMissingSchemaError(error)) {
      return buildReadFallback(fallbackData, {
        schemaReady: false,
        message: ENCOMENDAS_SCHEMA_MESSAGE,
        reason: 'schema_missing'
      });
    }

    throw error;
  }

  private handleWriteError(error: any): never {
    if (isMissingSchemaError(error)) {
      throw new AppError(503, ENCOMENDAS_SCHEMA_MESSAGE);
    }

    throw error;
  }

  private mapCustomer(row: any) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      document: row.document,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      notes: row.notes,
      active: !!row.active,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapProduct(row: any) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      sku: row.sku,
      unitPrice: normalizeNumber(row.unit_price),
      currency: row.currency || DEFAULT_CURRENCY,
      active: !!row.active,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapCharge(row: any, orderMap: Map<string, any>) {
    const order = orderMap.get(String(row.order_id));
    return {
      id: row.id,
      orderId: row.order_id,
      provider: row.provider,
      status: row.status,
      amount: normalizeNumber(row.amount),
      currency: row.currency || DEFAULT_CURRENCY,
      paymentLinkUrl: row.payment_link_url,
      externalReference: row.external_reference,
      expiresAt: row.expires_at,
      paidAt: row.paid_at,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      order: order
        ? {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            customerName: order.customer?.name || order.customerNameSnapshot || null
          }
        : null
    };
  }

  private async hydrateOrders(orderRows: any[]): Promise<any[]> {
    if (!orderRows.length) {
      return [];
    }

    const customerIds = Array.from(
      new Set(orderRows.map((row) => String(row.customer_id)).filter(Boolean))
    );
    const orderIds = orderRows.map((row) => String(row.id));

    const [customersResult, itemsResult, chargesResult] = await Promise.all([
      supabase.from('order_customers').select('*').in('id', customerIds),
      supabase.from('order_order_items').select('*').in('order_id', orderIds).order('created_at', {
        ascending: true
      }),
      supabase.from('order_charges').select('*').in('order_id', orderIds).order('created_at', {
        ascending: false
      })
    ]);

    const customers = unwrapResult(customersResult);
    const items = unwrapResult(itemsResult);
    const charges = unwrapResult(chargesResult);

    const productIds = Array.from(
      new Set(items.map((item: any) => String(item.product_id)).filter(Boolean))
    );

    const products = productIds.length
      ? unwrapResult(await supabase.from('order_products').select('*').in('id', productIds))
      : [];

    const customerMap = new Map(customers.map((row: any) => [String(row.id), this.mapCustomer(row)]));
    const productMap = new Map(products.map((row: any) => [String(row.id), this.mapProduct(row)]));

    const itemsByOrderId = new Map<string, any[]>();
    for (const item of items) {
      const mappedItem = {
        id: item.id,
        productId: item.product_id,
        quantity: normalizeDecimal(item.quantity, 0, 3),
        unitPrice: normalizeNumber(item.unit_price),
        lineTotal: normalizeNumber(item.line_total),
        productNameSnapshot: item.product_name_snapshot,
        productSkuSnapshot: item.product_sku_snapshot,
        metadata: item.metadata || {},
        createdAt: item.created_at,
        product: item.product_id ? productMap.get(String(item.product_id)) || null : null
      };

      const orderId = String(item.order_id);
      const existingItems = itemsByOrderId.get(orderId) || [];
      existingItems.push(mappedItem);
      itemsByOrderId.set(orderId, existingItems);
    }

    const mappedOrders = orderRows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      currency: row.currency || DEFAULT_CURRENCY,
      subtotalAmount: normalizeNumber(row.subtotal_amount),
      discountAmount: normalizeNumber(row.discount_amount),
      shippingAmount: normalizeNumber(row.shipping_amount),
      totalAmount: normalizeNumber(row.total_amount),
      customerId: row.customer_id,
      customerNameSnapshot: row.customer_name_snapshot,
      notes: row.notes,
      metadata: row.metadata || {},
      placedAt: row.placed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      customer: customerMap.get(String(row.customer_id)) || null,
      items: itemsByOrderId.get(String(row.id)) || []
    }));

    const orderMap = new Map(mappedOrders.map((order) => [String(order.id), order]));
    const chargesByOrderId = new Map<string, any[]>();

    for (const charge of charges) {
      const mappedCharge = this.mapCharge(charge, orderMap);
      const orderId = String(charge.order_id);
      const orderCharges = chargesByOrderId.get(orderId) || [];
      orderCharges.push(mappedCharge);
      chargesByOrderId.set(orderId, orderCharges);
    }

    return mappedOrders.map((order) => ({
      ...order,
      charges: chargesByOrderId.get(String(order.id)) || []
    }));
  }

  async getOverview(authUserId: string): Promise<ReadResponse<any>> {
    const { actor, meta } = await this.resolveReadContext(authUserId);
    if (!actor) {
      return buildReadFallback(this.buildOverviewFallback().data, meta);
    }

    try {
      const [customersResult, productsResult, ordersResult, chargesResult, recentOrdersResult] =
        await Promise.all([
          supabase.from('order_customers').select('id, active').eq('owner_user_id', actor.profileId),
          supabase.from('order_products').select('id, active').eq('owner_user_id', actor.profileId),
          supabase
            .from('order_orders')
            .select('id, status, total_amount, customer_id, order_number, currency, customer_name_snapshot, created_at, updated_at, placed_at, subtotal_amount, discount_amount, shipping_amount, notes, metadata')
            .eq('owner_user_id', actor.profileId),
          supabase
            .from('order_charges')
            .select('id, status, amount')
            .eq('owner_user_id', actor.profileId),
          supabase
            .from('order_orders')
            .select('*')
            .eq('owner_user_id', actor.profileId)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

      const customers = unwrapResult(customersResult) || [];
      const products = unwrapResult(productsResult) || [];
      const orders = unwrapResult(ordersResult) || [];
      const charges = unwrapResult(chargesResult) || [];
      const recentOrdersRows = unwrapResult(recentOrdersResult) || [];

      const ordersByStatus = orders.reduce((acc: Record<string, number>, order: any) => {
        const status = String(order.status || 'unknown');
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const chargesByStatus = charges.reduce((acc: Record<string, number>, charge: any) => {
        const status = String(charge.status || 'unknown');
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const recentOrders = await this.hydrateOrders(recentOrdersRows);

      return {
        data: {
          customers: {
            total: customers.length,
            active: customers.filter((customer: any) => customer.active !== false).length
          },
          products: {
            total: products.length,
            active: products.filter((product: any) => product.active !== false).length
          },
          orders: {
            total: orders.length,
            byStatus: ordersByStatus,
            totalAmount: sumNumbers(orders.map((order: any) => normalizeNumber(order.total_amount)))
          },
          charges: {
            total: charges.length,
            byStatus: chargesByStatus,
            pendingAmount: sumNumbers(
              charges
                .filter((charge: any) => charge.status === 'pending')
                .map((charge: any) => normalizeNumber(charge.amount))
            )
          },
          recentOrders
        },
        meta
      };
    } catch (error) {
      return this.handleReadError(error, this.buildOverviewFallback().data);
    }
  }

  async listCustomers(authUserId: string): Promise<ReadResponse<any[]>> {
    const { actor, meta } = await this.resolveReadContext(authUserId);
    if (!actor) {
      return buildReadFallback([], meta);
    }

    try {
      const rows = unwrapResult(
        await supabase
          .from('order_customers')
          .select('*')
          .eq('owner_user_id', actor.profileId)
          .order('created_at', { ascending: false })
      );

      return {
        data: (rows || []).map((row: any) => this.mapCustomer(row)),
        meta
      };
    } catch (error) {
      return this.handleReadError(error, []);
    }
  }

  async createCustomer(authUserId: string, payload: Record<string, unknown>) {
    const actor = await this.requireActor(authUserId);
    const name = normalizeString(payload.name);

    if (!name) {
      throw new AppError(400, 'O campo name e obrigatorio.');
    }

    const insertPayload = {
      owner_user_id: actor.profileId,
      name,
      email: normalizeOptionalString(payload.email),
      phone: normalizeOptionalString(payload.phone),
      document: normalizeOptionalString(payload.document),
      address_line1: normalizeOptionalString(payload.addressLine1 ?? payload.address_line1),
      address_line2: normalizeOptionalString(payload.addressLine2 ?? payload.address_line2),
      city: normalizeOptionalString(payload.city),
      state: normalizeOptionalString(payload.state),
      postal_code: normalizeOptionalString(payload.postalCode ?? payload.postal_code),
      notes: normalizeOptionalString(payload.notes),
      metadata: normalizeMetadata(payload.metadata),
      active: payload.active === false ? false : true
    };

    try {
      const created = unwrapResult(
        await supabase.from('order_customers').insert(insertPayload).select('*').single()
      );

      return this.mapCustomer(created);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async listProducts(authUserId: string): Promise<ReadResponse<any[]>> {
    const { actor, meta } = await this.resolveReadContext(authUserId);
    if (!actor) {
      return buildReadFallback([], meta);
    }

    try {
      const rows = unwrapResult(
        await supabase
          .from('order_products')
          .select('*')
          .eq('owner_user_id', actor.profileId)
          .order('created_at', { ascending: false })
      );

      return {
        data: (rows || []).map((row: any) => this.mapProduct(row)),
        meta
      };
    } catch (error) {
      return this.handleReadError(error, []);
    }
  }

  async createProduct(authUserId: string, payload: Record<string, unknown>) {
    const actor = await this.requireActor(authUserId);
    const name = normalizeString(payload.name);

    if (!name) {
      throw new AppError(400, 'O campo name e obrigatorio.');
    }

    const insertPayload = {
      owner_user_id: actor.profileId,
      name,
      description: normalizeOptionalString(payload.description),
      sku: normalizeOptionalString(payload.sku),
      unit_price: normalizeNonNegativeNumber(payload.unitPrice ?? payload.unit_price, 0),
      currency: normalizeCurrency(payload.currency),
      metadata: normalizeMetadata(payload.metadata),
      active: payload.active === false ? false : true
    };

    try {
      const created = unwrapResult(
        await supabase.from('order_products').insert(insertPayload).select('*').single()
      );

      return this.mapProduct(created);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async listOrders(authUserId: string): Promise<ReadResponse<any[]>> {
    const { actor, meta } = await this.resolveReadContext(authUserId);
    if (!actor) {
      return buildReadFallback([], meta);
    }

    try {
      const rows = unwrapResult(
        await supabase
          .from('order_orders')
          .select('*')
          .eq('owner_user_id', actor.profileId)
          .order('created_at', { ascending: false })
      );

      const hydratedOrders = await this.hydrateOrders(rows || []);

      return {
        data: hydratedOrders,
        meta
      };
    } catch (error) {
      return this.handleReadError(error, []);
    }
  }

  async createOrder(authUserId: string, payload: OrderInput) {
    const actor = await this.requireActor(authUserId);
    const customerId = normalizeString(payload.customerId || payload.customer_id);
    const items = Array.isArray(payload.items) ? payload.items : [];

    if (!customerId) {
      throw new AppError(400, 'O campo customer_id e obrigatorio.');
    }

    if (!items.length) {
      throw new AppError(400, 'Ao menos um item precisa ser informado para criar o pedido.');
    }

    const status = normalizeString(payload.status) || 'pending_payment';
    if (!ORDER_STATUSES.has(status)) {
      throw new AppError(400, 'Status de pedido invalido.');
    }

    const currency = normalizeCurrency(payload.currency);
    const discountAmount = normalizeNonNegativeNumber(
      payload.discountAmount ?? payload.discount_amount,
      0
    );
    const shippingAmount = normalizeNonNegativeNumber(
      payload.shippingAmount ?? payload.shipping_amount,
      0
    );
    let createdOrderId: string | null = null;

    try {
      const customer = unwrapResult(
        await supabase
          .from('order_customers')
          .select('*')
          .eq('id', customerId)
          .eq('owner_user_id', actor.profileId)
          .maybeSingle()
      );

      if (!customer) {
        throw new AppError(404, 'Cliente nao encontrado para este usuario.');
      }

      const productIds = Array.from(
        new Set(
          items
            .map((item) => normalizeString(item.productId || item.product_id))
            .filter((value): value is string => !!value)
        )
      );

      if (productIds.length !== items.length) {
        throw new AppError(400, 'Todos os itens do pedido precisam informar product_id.');
      }

      const productRows = unwrapResult(
        await supabase
          .from('order_products')
          .select('*')
          .eq('owner_user_id', actor.profileId)
          .in('id', productIds)
      );

      const productMap = new Map((productRows || []).map((row: any) => [String(row.id), row]));

      if (productMap.size !== productIds.length) {
        throw new AppError(400, 'Um ou mais produtos informados nao pertencem ao usuario.');
      }

      const normalizedItems = items.map((item) => {
        const productId = normalizeString(item.productId || item.product_id) as string;
        const product = productMap.get(productId);

        if (!product) {
          throw new AppError(400, `Produto invalido informado no pedido: ${productId}`);
        }

        const quantity = normalizePositiveNumber(item.quantity);
        const unitPrice = normalizeNonNegativeNumber(
          item.unitPrice ?? item.unit_price ?? product.unit_price,
          0
        );
        const lineTotal = Number((quantity * unitPrice).toFixed(2));

        return {
          product_id: productId,
          quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
          product_name_snapshot: product.name,
          product_sku_snapshot: product.sku || null,
          metadata: normalizeMetadata(item.metadata)
        };
      });

      const subtotalAmount = sumNumbers(normalizedItems.map((item) => item.line_total));
      const totalAmount = Number(
        Math.max(0, subtotalAmount + shippingAmount - discountAmount).toFixed(2)
      );
      const orderNumber = buildOrderNumber();

      const createdOrder = unwrapResult(
        await supabase
          .from('order_orders')
          .insert({
            owner_user_id: actor.profileId,
            customer_id: customerId,
            order_number: orderNumber,
            status,
            currency,
            subtotal_amount: subtotalAmount,
            discount_amount: discountAmount,
            shipping_amount: shippingAmount,
            total_amount: totalAmount,
            customer_name_snapshot: customer.name,
            notes: normalizeOptionalString(payload.notes),
            metadata: normalizeMetadata(payload.metadata)
          })
          .select('*')
          .single()
      );
      createdOrderId = String(createdOrder.id);

      const insertedItems = unwrapResult(
        await supabase
          .from('order_order_items')
          .insert(
            normalizedItems.map((item) => ({
              ...item,
              order_id: createdOrder.id
            }))
          )
          .select('*')
      );

      let insertedChargeRows: any[] = [];
      if (payload.charge) {
        const chargeStatus = normalizeString(payload.charge.status) || 'pending';
        if (!CHARGE_STATUSES.has(chargeStatus)) {
          throw new AppError(400, 'Status de cobranca invalido.');
        }

        insertedChargeRows = unwrapResult(
          await supabase
            .from('order_charges')
            .insert({
              owner_user_id: actor.profileId,
              order_id: createdOrder.id,
              provider: normalizeString(payload.charge.provider) || 'manual',
              status: chargeStatus,
              amount: normalizeNonNegativeNumber(payload.charge.amount, totalAmount),
              currency,
              payment_link_url: normalizeOptionalString(
                payload.charge.paymentLinkUrl ?? payload.charge.payment_link_url
              ),
              external_reference: normalizeOptionalString(
                payload.charge.externalReference ?? payload.charge.external_reference
              ),
              expires_at: normalizeIsoDateTime(
                payload.charge.expiresAt ?? payload.charge.expires_at
              ),
              paid_at: normalizeIsoDateTime(payload.charge.paidAt ?? payload.charge.paid_at),
              metadata: normalizeMetadata(payload.charge.metadata)
            })
            .select('*')
        );
      }

      const hydratedOrders = await this.hydrateOrders([createdOrder]);
      const hydratedOrder = hydratedOrders[0] || {
        ...createdOrder,
        items: insertedItems,
        charges: insertedChargeRows
      };

      return hydratedOrder;
    } catch (error) {
      if (createdOrderId) {
        await supabase
          .from('order_orders')
          .delete()
          .eq('id', createdOrderId)
          .eq('owner_user_id', actor.profileId);
      }

      this.handleWriteError(error);
    }
  }

  async updateOrderStatus(authUserId: string, orderId: string, nextStatus: string) {
    const actor = await this.requireActor(authUserId);
    const normalizedStatus = normalizeString(nextStatus);

    if (!normalizedStatus || !ORDER_STATUSES.has(normalizedStatus)) {
      throw new AppError(400, 'Status de pedido invalido.');
    }

    try {
      const updated = unwrapResult(
        await supabase
          .from('order_orders')
          .update({ status: normalizedStatus })
          .eq('id', orderId)
          .eq('owner_user_id', actor.profileId)
          .select('*')
          .maybeSingle()
      );

      if (!updated) {
        throw new AppError(404, 'Pedido nao encontrado para este usuario.');
      }

      const hydratedOrders = await this.hydrateOrders([updated]);
      return hydratedOrders[0] || updated;
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async listCharges(authUserId: string): Promise<ReadResponse<any[]>> {
    const { actor, meta } = await this.resolveReadContext(authUserId);
    if (!actor) {
      return buildReadFallback([], meta);
    }

    try {
      const chargeRows = unwrapResult(
        await supabase
          .from('order_charges')
          .select('*')
          .eq('owner_user_id', actor.profileId)
          .order('created_at', { ascending: false })
      );

      const orderIds = Array.from(
        new Set((chargeRows || []).map((row: any) => String(row.order_id)).filter(Boolean))
      );
      const orderRows = orderIds.length
        ? unwrapResult(await supabase.from('order_orders').select('*').in('id', orderIds))
        : [];
      const hydratedOrders = await this.hydrateOrders(orderRows || []);
      const orderMap = new Map(hydratedOrders.map((order) => [String(order.id), order]));

      return {
        data: (chargeRows || []).map((row: any) => this.mapCharge(row, orderMap)),
        meta
      };
    } catch (error) {
      return this.handleReadError(error, []);
    }
  }
}

export const encomendasService = new EncomendasService();
