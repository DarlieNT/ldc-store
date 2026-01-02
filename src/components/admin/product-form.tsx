'use client'

import { saveProduct } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Package, Save, ArrowLeft, Loader2 } from "lucide-react"

export default function ProductForm({ product }: { product?: any }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { t } = useI18n()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await saveProduct(formData)
            toast.success(t('common.success'))
            router.push('/admin')
        } catch (e) {
            toast.error(t('common.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{product ? t('admin.productForm.editTitle') : t('admin.productForm.addTitle')}</CardTitle>
                            <CardDescription>Fill in the product details below</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-5">
                        {product && <input type="hidden" name="id" value={product.id} />}

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-medium">{t('admin.productForm.nameLabel')}</Label>
                            <Input id="name" name="name" defaultValue={product?.name} placeholder={t('admin.productForm.namePlaceholder')} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price" className="text-sm font-medium">{t('admin.productForm.priceLabel')}</Label>
                                <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} placeholder={t('admin.productForm.pricePlaceholder')} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-sm font-medium">{t('admin.productForm.categoryLabel')}</Label>
                                <Input id="category" name="category" defaultValue={product?.category} placeholder={t('admin.productForm.categoryPlaceholder')} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image" className="text-sm font-medium">{t('admin.productForm.imageLabel')}</Label>
                            <Input id="image" name="image" defaultValue={product?.image} placeholder={t('admin.productForm.imagePlaceholder')} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-sm font-medium">{t('admin.productForm.descLabel')}</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={product?.description}
                                placeholder={t('admin.productForm.descPlaceholder')}
                                rows={5}
                                className="resize-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={loading} className="gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('admin.productForm.saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {t('admin.productForm.saveButton')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
