'use client'

import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Loader2, TrendingUp, ShoppingCart, Eye, RefreshCw, ArrowRight, Clock } from "lucide-react"
import { useState } from "react"
import { createOrder } from "@/actions/checkout"
import { toast } from "sonner"

interface Product {
    id: string
    name: string
    description: string | null
    price: string
    image: string | null
    category: string | null
    stockCount: number
    soldCount: number
}

interface Stats {
    today: number
    week: number
    month: number
    total: number
}

function ProductBuyButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
    const [loading, setLoading] = useState(false)
    const { t } = useI18n()

    const handleBuy = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            setLoading(true)
            const { url, params } = await createOrder(productId)

            const form = document.createElement('form')
            form.method = 'POST'
            form.action = url

            Object.entries(params).forEach(([k, v]) => {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = k
                input.value = String(v)
                form.appendChild(input)
            })

            document.body.appendChild(form)
            form.submit()
        } catch (e: any) {
            toast.error(e.message || "Failed to create order")
            setLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            onClick={handleBuy}
            disabled={disabled || loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.buyNow')}
        </Button>
    )
}

export function DashboardContent({
    products,
    stats,
    isLoggedIn = false,
    isAdmin = false,
    settings = {}
}: {
    products: Product[]
    stats: Stats
    isLoggedIn?: boolean
    isAdmin?: boolean
    settings?: Record<string, string>
}) {
    const { t, locale } = useI18n()
    const siteName = settings.siteName || 'LDC Shop'
    const welcomeText = locale === 'zh' ? `欢迎来到 ${siteName}` : `Welcome to ${siteName}`

    return (
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Page Title */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('common.today')}</h1>
                <p className="text-muted-foreground text-sm mt-1">{welcomeText}</p>
            </div>

            {/* Stats Overview - Only for Admin */}
            {isAdmin && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-border/40">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t('common.todayOrders')}</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{stats.today}</p>
                                </div>
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/40">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t('common.weekOrders')}</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{stats.week}</p>
                                </div>
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/40">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t('common.monthOrders')}</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{stats.month}</p>
                                </div>
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/40">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t('common.productCount')}</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{products.length}</p>
                                </div>
                                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Products Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <h2 className="text-base sm:text-lg font-semibold">{t('common.productList')}</h2>
                        <Badge variant="secondary" className="font-normal text-xs">{products.length}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 hidden sm:flex">
                        <RefreshCw className="h-4 w-4" />
                        {t('common.refresh')}
                    </Button>
                </div>

                {products.length === 0 ? (
                    <Card className="border-border/40 border-dashed">
                        <CardContent className="py-12 sm:py-16 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted flex items-center justify-center">
                                    <Package className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="font-medium mb-1 text-sm sm:text-base">{t('home.noProducts')}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">{t('home.checkBackLater')}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <Card className="border-border/40 overflow-hidden hidden md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border/40 bg-muted/30">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t('common.products')}</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t('admin.products.price')}</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t('common.stock')}</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t('common.sold')}</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t('common.status')}</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, index) => {
                                            const inStock = product.stockCount > 0
                                            return (
                                                <tr
                                                    key={product.id}
                                                    className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                                                                <img
                                                                    src={product.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                                                                    alt={product.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <Link
                                                                    href={`/buy/${product.id}`}
                                                                    className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                                                                >
                                                                    {product.name}
                                                                </Link>
                                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                                    {product.description || t('buy.noDescription')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="font-semibold text-primary">{Number(product.price)}</span>
                                                        <span className="text-muted-foreground text-sm ml-1">LDC</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={inStock ? "text-foreground" : "text-destructive"}>
                                                            {product.stockCount}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-muted-foreground">
                                                        {product.soldCount}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge
                                                            variant={inStock ? "default" : "secondary"}
                                                            className={inStock
                                                                ? "bg-emerald-500/10 text-emerald-600 border-0 hover:bg-emerald-500/20"
                                                                : "bg-gray-500/10 text-gray-500 border-0"
                                                            }
                                                        >
                                                            {inStock ? t('common.inStock') : t('common.outOfStock')}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                                <Link href={`/buy/${product.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            {isLoggedIn ? (
                                                                inStock ? (
                                                                    <ProductBuyButton productId={product.id} />
                                                                ) : (
                                                                    <Button size="sm" variant="secondary" disabled>
                                                                        {t('common.outOfStock')}
                                                                    </Button>
                                                                )
                                                            ) : (
                                                                <Button size="sm" asChild className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                                                                    <Link href="/api/auth/signin">
                                                                        {t('common.buyNow')}
                                                                    </Link>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                            {products.map((product) => {
                                const inStock = product.stockCount > 0
                                return (
                                    <Card key={product.id} className="border-border/40">
                                        <CardContent className="p-4">
                                            <div className="flex gap-3">
                                                <div className="h-16 w-16 rounded-lg bg-muted/50 overflow-hidden shrink-0">
                                                    <img
                                                        src={product.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/buy/${product.id}`}
                                                        className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 block mb-1"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                        {product.description || t('buy.noDescription')}
                                                    </p>
                                                    <div className="flex items-center gap-2 flex-wrap text-xs">
                                                        <span className="font-semibold text-primary">{Number(product.price)} LDC</span>
                                                        <span className="text-muted-foreground">·</span>
                                                        <span className={inStock ? "text-foreground" : "text-destructive"}>
                                                            {t('common.stock')}: {product.stockCount}
                                                        </span>
                                                        <span className="text-muted-foreground">·</span>
                                                        <span className="text-muted-foreground">
                                                            {t('common.sold')}: {product.soldCount}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Badge
                                                            variant={inStock ? "default" : "secondary"}
                                                            className={cn(
                                                                "text-xs",
                                                                inStock
                                                                    ? "bg-emerald-500/10 text-emerald-600 border-0"
                                                                    : "bg-gray-500/10 text-gray-500 border-0"
                                                            )}
                                                        >
                                                            {inStock ? t('common.inStock') : t('common.outOfStock')}
                                                        </Badge>
                                                        <div className="flex-1"></div>
                                                        {isLoggedIn ? (
                                                            inStock ? (
                                                                <ProductBuyButton productId={product.id} />
                                                            ) : (
                                                                <Button size="sm" variant="secondary" disabled className="text-xs">
                                                                    {t('common.outOfStock')}
                                                                </Button>
                                                            )
                                                        ) : (
                                                            <Button size="sm" asChild className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-xs">
                                                                <Link href="/api/auth/signin">
                                                                    {t('common.buyNow')}
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
