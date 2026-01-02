'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Search, ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Order {
    orderId: string
    productName: string
    amount: string
    status: string | null
    createdAt: Date | null
}

export function OrdersContent({ orders }: { orders: Order[] }) {
    const { t } = useI18n()

    const getStatusBadgeStyle = (status: string | null) => {
        switch (status) {
            case 'delivered':
                return 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0'
            case 'paid':
                return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0'
            case 'refunded':
                return 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0'
            default:
                return 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0'
        }
    }

    const getStatusText = (status: string | null) => {
        if (!status) return t('order.status.pending')
        return t(`order.status.${status}`) || status
    }

    return (
        <main className="container py-10 md:py-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('orders.title')}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{orders.length} orders</p>
                </div>
            </div>

            <div className="space-y-4">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <Link href={`/order/${order.orderId}`} key={order.orderId}>
                            <Card className="p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200 group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <Package className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                                {order.productName}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-primary">{Number(order.amount)} {t('common.credits')}</span>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {order.orderId.slice(0, 12)}...
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground text-xs">
                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                                                </span>
                                                <Badge className={`capitalize ${getStatusBadgeStyle(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-card">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{t('orders.noOrders')}</h3>
                        <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                        <Link href="/">
                            <Button>{t('orders.browseProducts')}</Button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    )
}
