'use client'

import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BuyButton } from "@/components/buy-button"
import { Package, Tag, AlertCircle, LogIn } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Product {
    id: string
    name: string
    description: string | null
    price: string
    image: string | null
    category: string | null
}

interface BuyContentProps {
    product: Product
    stockCount: number
    isLoggedIn: boolean
}

export function BuyContent({ product, stockCount, isLoggedIn }: BuyContentProps) {
    const { t } = useI18n()

    return (
        <main className="container py-6 sm:py-10 md:py-16 px-4">
            <div className="mx-auto max-w-4xl">
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4">
                        <div className="aspect-square bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm">
                            <img
                                src={product.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {product.category && product.category !== 'general' && (
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="secondary" className="capitalize text-xs">
                                    {product.category}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <Card className="border-border/50 shadow-sm h-fit">
                        <CardHeader className="space-y-4 pb-4 p-4 sm:p-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h1>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant={stockCount > 0 ? "outline" : "destructive"}
                                        className={stockCount > 0 ? "bg-emerald-500/10 text-emerald-600 border-0 text-xs" : "text-xs"}
                                    >
                                        <Package className="h-3 w-3 mr-1" />
                                        {stockCount > 0 ? `${t('common.stock')}: ${stockCount}` : t('common.outOfStock')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-bold text-primary">{Number(product.price)}</span>
                                <span className="text-base sm:text-lg text-muted-foreground">{t('common.credits')}</span>
                            </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="py-4 sm:py-6 p-4 sm:p-6">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">Description</h3>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                                {product.description || t('buy.noDescription')}
                            </p>
                        </CardContent>

                        <Separator />

                        <CardFooter className="pt-4 sm:pt-6 flex-col gap-4 p-4 sm:p-6">
                            {isLoggedIn ? (
                                stockCount > 0 ? (
                                    <BuyButton productId={product.id} />
                                ) : (
                                    <div className="w-full p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                        <span className="text-sm">{t('buy.outOfStockMessage')}</span>
                                    </div>
                                )
                            ) : (
                                <div className="w-full space-y-3">
                                    <div className="p-4 rounded-lg bg-muted text-muted-foreground flex items-center gap-3">
                                        <LogIn className="h-5 w-5 shrink-0" />
                                        <span className="text-sm">{t('buy.loginToBuy')}</span>
                                    </div>
                                    <Link href="/api/auth/signin" className="block">
                                        <Button className="w-full">
                                            <LogIn className="h-4 w-4 mr-2" />
                                            Sign In to Purchase
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </main>
    )
}
