'use client'

import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { addCards, deleteCard } from "@/actions/admin"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CopyButton } from "@/components/copy-button"
import { Trash2, Plus, Package, Layers } from "lucide-react"

interface CardData {
    id: number
    cardKey: string
}

interface CardsContentProps {
    productId: string
    productName: string
    unusedCards: CardData[]
}

export function CardsContent({ productId, productName, unusedCards }: CardsContentProps) {
    const { t } = useI18n()

    const handleSubmit = async (formData: FormData) => {
        try {
            await addCards(formData)
            toast.success(t('common.success'))
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    return (
        <div className="p-6 space-y-8 max-w-5xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">{t('admin.cards.title')}</h1>
                    <p className="text-muted-foreground">{productName}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{unusedCards.length}</div>
                        <div className="text-xs text-muted-foreground">{t('admin.cards.available')}</div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            {t('admin.cards.addCards')}
                        </CardTitle>
                        <CardDescription>Enter one card per line</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="space-y-4">
                            <input type="hidden" name="product_id" value={productId} />
                            <Textarea
                                name="cards"
                                placeholder={t('admin.cards.placeholder')}
                                rows={12}
                                className="font-mono text-sm resize-none"
                                required
                            />
                            <Button type="submit" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                {t('common.add')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {t('admin.cards.available')}
                        </CardTitle>
                        <CardDescription>{unusedCards.length} cards in stock</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto space-y-2">
                        {unusedCards.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">{t('admin.cards.noCards')}</p>
                            </div>
                        ) : (
                            unusedCards.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-mono gap-2 group">
                                    <CopyButton text={c.cardKey} truncate maxLength={30} />
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={async () => {
                                            if (confirm(t('common.confirm') + '?')) {
                                                try {
                                                    await deleteCard(c.id)
                                                    toast.success(t('common.success'))
                                                } catch (e: any) {
                                                    toast.error(e.message)
                                                }
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
