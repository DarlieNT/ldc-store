'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { products, cards, orders } from "@/lib/db/schema"
import { generateOrderId, generateSign } from "@/lib/crypto"
import { eq, sql } from "drizzle-orm"
import { cookies } from "next/headers"

export async function createOrder(productId: string, email?: string) {
    const session = await auth()
    const user = session?.user

    // 1. Get Product
    const product = await db.query.products.findFirst({
        where: eq(products.id, productId)
    })
    if (!product) throw new Error("Product not found")

    // 2. Check Stock
    const stockResult = await db.select({ count: sql<number>`count(*)::int` })
        .from(cards)
        .where(sql`${cards.productId} = ${productId} AND ${cards.isUsed} = false`)

    const stock = stockResult[0]?.count || 0
    if (stock <= 0) throw new Error("Out of Stock")

    // 3. Create Order
    const orderId = generateOrderId()

    await db.insert(orders).values({
        orderId,
        productId: product.id,
        productName: product.name,
        amount: product.price,
        email: email || user?.email || null,
        userId: user?.id || null,
        username: user?.username || null,
        status: 'pending'
    })

    // Set Pending Cookie
    const cookieStore = await cookies()
    cookieStore.set('ldc_pending_order', orderId, { secure: true, path: '/', sameSite: 'lax' })

    // 4. Generate Pay Params
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const payParams: Record<string, any> = {
        pid: process.env.MERCHANT_ID!,
        type: 'epay',
        out_trade_no: orderId,
        notify_url: `${baseUrl}/api/notify`,
        return_url: `${baseUrl}/callback/${orderId}`, // Use path-based param to avoid query string stripping
        name: product.name,
        money: Number(product.price).toFixed(2),
        sign_type: 'MD5'
    }

    payParams.sign = generateSign(payParams, process.env.MERCHANT_KEY!)

    return {
        url: process.env.PAY_URL || 'https://credit.linux.do/epay/pay/submit.php',
        params: payParams
    }
}
