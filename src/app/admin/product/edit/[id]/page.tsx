import ProductForm from "@/components/admin/product-form"
import { getProduct } from "@/lib/db/queries"
import { notFound } from "next/navigation"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) return notFound()

    return <ProductForm product={product} />
}
