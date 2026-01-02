-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Card keys (Stock)
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    card_key TEXT NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    amount REAL NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'pending', -- pending, paid, delivered, failed
    trade_no TEXT,
    card_key TEXT,
    paid_at DATETIME,
    delivered_at DATETIME,
    user_id INTEGER,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (OIDC)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    trust_level INTEGER,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data (Optional - for testing)
INSERT OR IGNORE INTO products (id, name, description, price, category, image) VALUES 
('prod_001', 'VIP会员月卡', '享受30天VIP特权，解锁全部高级功能', 10, 'membership', 'https://api.dicebear.com/7.x/shapes/svg?seed=vip'),
('prod_002', 'API调用次数包', '1000次API调用额度，永不过期', 5, 'api', 'https://api.dicebear.com/7.x/shapes/svg?seed=api'),
('prod_003', '专业版授权码', '终身授权，支持所有设备', 50, 'license', 'https://api.dicebear.com/7.x/shapes/svg?seed=license');

INSERT OR IGNORE INTO cards (product_id, card_key) VALUES 
('prod_001', 'VIP-2024-TEST-001'),
('prod_001', 'VIP-2024-TEST-002'),
('prod_002', 'API-KEY-TEST-001');
