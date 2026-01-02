'use client'

import { useI18n } from "@/lib/i18n/context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { RefundButton } from "@/components/admin/refund-button"
import { CopyButton } from "@/components/copy-button"
import { ExternalLink } from "lucide-react"

interface Order {
    orderId: string
    username: string | null
    email: string | null
    productName: string
    amount: string
    status: string | null
    cardKey: string | null
    tradeNo: string | null
    createdAt: Date | null
}

export function AdminOrdersContent({ orders }: { orders: Order[] }) {
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t('admin.orders.title')}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{orders.length} orders</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="font-semibold">{t('admin.orders.orderId')}</TableHead>
                            <TableHead className="font-semibold">{t('admin.orders.user')}</TableHead>
                            <TableHead className="font-semibold">{t('admin.orders.product')}</TableHead>
                            <TableHead className="font-semibold">{t('admin.orders.amount')}</TableHead>
                            <TableHead className="font-semibold">{t('admin.orders.status')}</TableHead>
                            <TableHead className="font-semibold">{t('admin.orders.cardKey')}</TableHead>
                            <TableHead className="font-semibold">{t('admin.orders.date')}</TableHead>
                            <TableHead className="text-right font-semibold">{t('admin.orders.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.orderId}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {order.orderId.slice(0, 8)}...
                                </TableCell>
                                <TableCell>
                                    {order.username ? (
                                        <a
                                            href={`https://linux.do/u/${order.username}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 font-medium text-sm text-primary hover:underline"
                                        >
                                            {order.username}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Guest</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium">{order.productName}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-semibold text-primary">{Number(order.amount)}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`uppercase text-xs ${getStatusBadgeStyle(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {order.cardKey ? (
                                        <CopyButton text={order.cardKey} truncate maxLength={15} />
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                                </TableCell>
                                <TableCell className="text-right">
                                    <RefundButton order={order} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
