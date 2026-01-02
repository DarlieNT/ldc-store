'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, EyeOff, ArrowUp, ArrowDown, TrendingUp, ShoppingCart, CreditCard, Package, MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react"
import { deleteProduct, toggleProductStatus, reorderProduct } from "@/actions/admin"
import { toast } from "sonner"

interface Product {
    id: string
    name: string
    price: string
    category: string | null
    stockCount: number
    isActive: boolean
    sortOrder: number
}

interface Stats {
    today: { count: number; revenue: number }
    week: { count: number; revenue: number }
    month: { count: number; revenue: number }
    total: { count: number; revenue: number }
}

interface AdminProductsContentProps {
    products: Product[]
    stats: Stats
}

export function AdminProductsContent({ products, stats }: AdminProductsContentProps) {
    const { t } = useI18n()

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.products.confirmDelete'))) return
        try {
            await deleteProduct(id)
            toast.success(t('common.success'))
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleProductStatus(id, !currentStatus)
            toast.success(t('common.success'))
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const handleReorder = async (id: string, direction: 'up' | 'down') => {
        const idx = products.findIndex(p => p.id === id)
        if (idx === -1) return

        // Swap with neighbor
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1
        if (targetIdx < 0 || targetIdx >= products.length) return

        const current = products[idx]
        const target = products[targetIdx]

        try {
            // Use index as sortOrder to ensure unique values
            await reorderProduct(current.id, targetIdx)
            await reorderProduct(target.id, idx)
            toast.success(t('common.success'))
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const statCards = [
        { title: t('admin.stats.today'), icon: ShoppingCart, count: stats.today.count, revenue: stats.today.revenue, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: t('admin.stats.week'), icon: TrendingUp, count: stats.week.count, revenue: stats.week.revenue, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: t('admin.stats.month'), icon: CreditCard, count: stats.month.count, revenue: stats.month.revenue, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: t('admin.stats.total'), icon: Package, count: stats.total.count, revenue: stats.total.revenue, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ]

    return (
        <div className="p-6 space-y-8">
            {/* Dashboard Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Card key={i} className="border-border/50 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold">{stat.count}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {stat.revenue.toFixed(0)} {t('common.credits')}
                                    </p>
                                </div>
                                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Products Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{t('admin.products.title')}</h2>
                        <p className="text-muted-foreground text-sm mt-1">{products.length} products</p>
                    </div>
                    <Link href="/admin/product/new">
                        <Button className="shadow-sm">
                            <Plus className="h-4 w-4 mr-2" />
                            {t('admin.products.addNew')}
                        </Button>
                    </Link>
                </div>

                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[60px] font-semibold">{t('admin.products.order')}</TableHead>
                                <TableHead className="font-semibold">{t('admin.products.name')}</TableHead>
                                <TableHead className="font-semibold">{t('admin.products.price')}</TableHead>
                                <TableHead className="font-semibold">{t('admin.products.category')}</TableHead>
                                <TableHead className="font-semibold">{t('admin.products.stock')}</TableHead>
                                <TableHead className="font-semibold">{t('admin.products.status')}</TableHead>
                                <TableHead className="text-right font-semibold">{t('admin.products.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product, idx) => (
                                <TableRow key={product.id} className={!product.isActive ? 'opacity-50 bg-muted/20' : ''}>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleReorder(product.id, 'up')}
                                                disabled={idx === 0}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                onClick={() => handleReorder(product.id, 'down')}
                                                disabled={idx === products.length - 1}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{product.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-primary">{Number(product.price)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize font-normal">
                                            {product.category || 'general'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.stockCount > 0 ? "outline" : "destructive"} className="font-normal">
                                            {product.stockCount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={product.isActive ? 'default' : 'secondary'}
                                            className={product.isActive ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0' : ''}
                                        >
                                            {product.isActive ? t('admin.products.active') : t('admin.products.inactive')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleToggle(product.id, product.isActive)}
                                                title={product.isActive ? t('admin.products.hide') : t('admin.products.show')}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Link href={`/admin/cards/${product.id}`}>
                                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                                                    <Layers className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/product/edit/${product.id}`}>
                                                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleDelete(product.id)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                        No products found. Create your first product to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}

