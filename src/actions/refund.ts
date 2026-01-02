'use server'

import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getRefundParams(orderId: string) {
    // Auth Check
    const { auth } = await import("@/lib/auth")
    const session = await auth()
    const user = session?.user
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    if (!user || !user.username || !adminUsers.includes(user.username.toLowerCase())) {
        throw new Error("Unauthorized")
    }

    // Get Order
    const order = await db.query.orders.findFirst({
        where: eq(orders.orderId, orderId)
    })

    if (!order) throw new Error("Order not found")
    if (!order.tradeNo) throw new Error("Missing trade_no")

    // Return params for client-side form submission
    return {
        pid: process.env.MERCHANT_ID!,
        key: process.env.MERCHANT_KEY!,
        trade_no: order.tradeNo,
        out_trade_no: order.orderId,
        money: Number(order.amount).toFixed(2)
    }
}

export async function markOrderRefunded(orderId: string) {
    // Auth Check
    const { auth } = await import("@/lib/auth")
    const session = await auth()
    const user = session?.user
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    if (!user || !user.username || !adminUsers.includes(user.username.toLowerCase())) {
        throw new Error("Unauthorized")
    }

    // Update order status
    await db.update(orders).set({ status: 'refunded' }).where(eq(orders.orderId, orderId))

    revalidatePath('/admin/orders')
    revalidatePath(`/order/${orderId}`)

    return { success: true }
}
