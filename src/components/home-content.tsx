'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, ArrowRight } from "lucide-react"

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

export function HomeContent({ products }: { products: Product[] }) {
    const { t } = useI18n()

    return (
        <main className="container py-10 md:py-16">
            <section className="mb-12 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-3">
                    {t('common.appName')}
                </h1>
                <p className="mx-auto max-w-[600px] text-muted-foreground">
                    {t('home.subtitle')}
                </p>
            </section>

            {products.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-card">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{t('home.noProducts')}</h3>
                    <p className="text-muted-foreground">{t('home.checkBackLater')}</p>
                </div>
            ) : (
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <Card key={product.id} className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden">
                                <img
                                    src={product.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                                    alt={product.name}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                                {product.category && product.category !== 'general' && (
                                    <Badge className="absolute top-3 left-3 capitalize bg-primary/90 hover:bg-primary text-xs">
                                        {product.category}
                                    </Badge>
                                )}
                                {product.stockCount === 0 && (
                                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                        <Badge variant="destructive" className="text-sm">{t('common.outOfStock')}</Badge>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 min-h-[40px]">
                                    {product.description || t('buy.noDescription')}
                                </p>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-2xl font-bold text-primary">{Number(product.price)}</span>
                                        <span className="text-muted-foreground text-sm ml-1">{t('common.credits')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <ShoppingCart className="h-3 w-3" />
                                            {product.soldCount}
                                        </span>
                                        <span className="text-border">|</span>
                                        <span>{t('common.stock')}: {product.stockCount}</span>
                                    </div>
                                </div>
                                <Link href={`/buy/${product.id}`} className="block">
                                    <Button className="w-full group/btn" disabled={product.stockCount === 0}>
                                        {t('common.viewDetails')}
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}
        </main>
    )
}
