CREATE TABLE IF NOT EXISTS order_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    document VARCHAR(50),
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(120),
    state VARCHAR(120),
    postal_code VARCHAR(30),
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES order_customers(id) ON DELETE RESTRICT,
    order_number VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending_payment'
        CHECK (status IN ('draft', 'pending_payment', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    customer_name_snapshot VARCHAR(255),
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    placed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT order_orders_total_amount_non_negative CHECK (total_amount >= 0),
    CONSTRAINT order_orders_order_number_unique UNIQUE (owner_user_id, order_number)
);

CREATE TABLE IF NOT EXISTS order_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES order_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES order_products(id) ON DELETE SET NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    product_sku_snapshot VARCHAR(100),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT order_order_items_quantity_positive CHECK (quantity > 0),
    CONSTRAINT order_order_items_unit_price_non_negative CHECK (unit_price >= 0),
    CONSTRAINT order_order_items_line_total_non_negative CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS order_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES order_orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'manual',
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'failed')),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    payment_link_url TEXT,
    external_reference VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT order_charges_amount_non_negative CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_customers_owner_user_id ON order_customers(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_order_customers_active ON order_customers(owner_user_id, active);
CREATE INDEX IF NOT EXISTS idx_order_products_owner_user_id ON order_products(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_order_products_active ON order_products(owner_user_id, active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_products_owner_user_sku_unique
    ON order_products(owner_user_id, sku)
    WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_orders_owner_user_id ON order_orders(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_order_orders_customer_id ON order_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_orders_status ON order_orders(owner_user_id, status);
CREATE INDEX IF NOT EXISTS idx_order_orders_created_at ON order_orders(owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_order_items_order_id ON order_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_order_items_product_id ON order_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_charges_owner_user_id ON order_charges(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_order_charges_order_id ON order_charges(order_id);
CREATE INDEX IF NOT EXISTS idx_order_charges_status ON order_charges(owner_user_id, status);

DROP TRIGGER IF EXISTS update_order_customers_updated_at ON order_customers;
CREATE TRIGGER update_order_customers_updated_at
    BEFORE UPDATE ON order_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_products_updated_at ON order_products;
CREATE TRIGGER update_order_products_updated_at
    BEFORE UPDATE ON order_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_orders_updated_at ON order_orders;
CREATE TRIGGER update_order_orders_updated_at
    BEFORE UPDATE ON order_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_order_charges_updated_at ON order_charges;
CREATE TRIGGER update_order_charges_updated_at
    BEFORE UPDATE ON order_charges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE order_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own order customers" ON order_customers;
CREATE POLICY "Users can manage own order customers"
    ON order_customers
    FOR ALL
    USING (owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'))
    WITH CHECK (owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS "Users can manage own order products" ON order_products;
CREATE POLICY "Users can manage own order products"
    ON order_products
    FOR ALL
    USING (owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'))
    WITH CHECK (owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS "Users can manage own orders" ON order_orders;
CREATE POLICY "Users can manage own orders"
    ON order_orders
    FOR ALL
    USING (owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'))
    WITH CHECK (owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

DROP POLICY IF EXISTS "Users can manage own order items" ON order_order_items;
CREATE POLICY "Users can manage own order items"
    ON order_order_items
    FOR ALL
    USING (
        order_id IN (
            SELECT id
            FROM order_orders
            WHERE owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub')
        )
    )
    WITH CHECK (
        order_id IN (
            SELECT id
            FROM order_orders
            WHERE owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub')
        )
    );

DROP POLICY IF EXISTS "Users can manage own order charges" ON order_charges;
CREATE POLICY "Users can manage own order charges"
    ON order_charges
    FOR ALL
    USING (owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'))
    WITH CHECK (owner_user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
