import { getActiveProducts, getOrderStats, getAllSiteSettings } from "@/lib/db/queries"
import { auth } from "@/lib/auth"
import { DashboardContent } from "@/components/dashboard-content"

export const dynamic = 'force-dynamic'

export default async function Home() {
    const session = await auth()
    const isLoggedIn = !!session?.user

    // Check if admin
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    const isAdmin = session?.user?.username && adminUsers.includes(session.user.username.toLowerCase()) || false

    let products: any[] = []
    let stats = { today: 0, week: 0, month: 0, total: 0 }
    let settings: Record<string, string> = {}

    try {
        [products, stats, settings] = await Promise.all([
            getActiveProducts(),
            getOrderStats(),
            getAllSiteSettings()
        ])
    } catch (error: any) {
        const errorString = JSON.stringify(error)
        const isTableMissing =
            error.message?.includes('does not exist') ||
            error.cause?.message?.includes('does not exist') ||
            errorString.includes('42P01') ||
            errorString.includes('relation') && errorString.includes('does not exist')

        if (isTableMissing) {
            console.log("Database initialized check: Table missing. Running inline migrations...")
            const { db } = await import("@/lib/db")
            const { sql } = await import("drizzle-orm")

            await db.execute(sql`
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    price DECIMAL(10, 2) NOT NULL,
                    category TEXT,
                    image TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    sort_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS cards (
                    id SERIAL PRIMARY KEY,
                    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                    card_key TEXT NOT NULL,
                    is_used BOOLEAN DEFAULT FALSE,
                    used_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS orders (
                    order_id TEXT PRIMARY KEY,
                    product_id TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    email TEXT,
                    status TEXT DEFAULT 'pending',
                    trade_no TEXT,
                    card_key TEXT,
                    paid_at TIMESTAMP,
                    delivered_at TIMESTAMP,
                    user_id TEXT,
                    username TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS site_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT NOW()
                );
                CREATE TABLE IF NOT EXISTS announcements (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_pinned BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `)

            [products, stats, settings] = await Promise.all([
                getActiveProducts(),
                getOrderStats(),
                getAllSiteSettings()
            ])
        } else {
            console.error("Database error:", error)
        }
    }

    return (
        <DashboardContent
            products={products.map(p => ({
                ...p,
                stockCount: p.stock,
                soldCount: p.sold || 0
            }))}
            stats={stats}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            settings={settings}
        />
    )
}
