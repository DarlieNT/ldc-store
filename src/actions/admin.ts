'use server'

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { products, cards, siteSettings, announcements } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// Check Admin Helper
// Check Admin Helper
export async function checkAdmin() {
    const session = await auth()
    const user = session?.user
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    if (!user || !user.username || !adminUsers.includes(user.username.toLowerCase())) {
        throw new Error("Unauthorized")
    }
}

export async function saveProduct(formData: FormData) {
    await checkAdmin()

    const id = formData.get('id') as string || `prod_${Date.now()}`
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = formData.get('price') as string
    const category = formData.get('category') as string
    const image = formData.get('image') as string

    await db.insert(products).values({
        id, name, description, price, category, image
    }).onConflictDoUpdate({
        target: products.id,
        set: { name, description, price, category, image }
    })

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function deleteProduct(id: string) {
    await checkAdmin()
    await db.delete(products).where(eq(products.id, id))
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function toggleProductStatus(id: string, isActive: boolean) {
    await checkAdmin()
    await db.update(products).set({ isActive }).where(eq(products.id, id))
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function reorderProduct(id: string, newOrder: number) {
    await checkAdmin()
    await db.update(products).set({ sortOrder: newOrder }).where(eq(products.id, id))
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function addCards(formData: FormData) {
    await checkAdmin()
    const productId = formData.get('product_id') as string
    const rawCards = formData.get('cards') as string

    const cardList = rawCards.split('\n').map(c => c.trim()).filter(c => c)
    if (cardList.length === 0) return

    await db.insert(cards).values(
        cardList.map(key => ({
            productId,
            cardKey: key
        }))
    )

    revalidatePath('/admin')
    revalidatePath('/')
}

export async function deleteCard(cardId: number) {
    await checkAdmin()

    // Only delete unused cards
    const card = await db.query.cards.findFirst({
        where: eq(cards.id, cardId)
    })

    if (!card) {
        throw new Error("Card not found")
    }

    if (card.isUsed) {
        throw new Error("Cannot delete used card")
    }

    await db.delete(cards).where(eq(cards.id, cardId))

    revalidatePath('/admin')
    revalidatePath('/')
}

// Site Settings
export async function saveSiteSettings(formData: FormData) {
    await checkAdmin()

    const siteName = formData.get('siteName') as string
    const siteDescription = formData.get('siteDescription') as string
    const footerText = formData.get('footerText') as string

    const settings = [
        { key: 'siteName', value: siteName || 'LDC Shop' },
        { key: 'siteDescription', value: siteDescription || '' },
        { key: 'footerText', value: footerText || '' },
    ]

    for (const setting of settings) {
        await db.insert(siteSettings)
            .values({ key: setting.key, value: setting.value, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: siteSettings.key,
                set: { value: setting.value, updatedAt: new Date() }
            })
    }

    revalidatePath('/', 'layout')
    revalidatePath('/admin', 'layout')
    revalidatePath('/admin/settings')
}

// Announcements
export async function createAnnouncementAction(formData: FormData) {
    await checkAdmin()

    const title = formData.get('title') as string
    const content = formData.get('content') as string

    if (!title || !content) {
        throw new Error('Title and content are required')
    }

    await db.insert(announcements).values({
        title,
        content,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    })

    revalidatePath('/', 'layout')
    revalidatePath('/admin', 'layout')
    revalidatePath('/admin/announcements')
}

export async function deleteAnnouncementAction(id: number) {
    await checkAdmin()

    await db.delete(announcements).where(eq(announcements.id, id))

    revalidatePath('/', 'layout')
    revalidatePath('/admin', 'layout')
    revalidatePath('/admin/announcements')
}

export async function toggleAnnouncementAction(id: number, isActive: boolean) {
    await checkAdmin()

    await db.update(announcements)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(announcements.id, id))

    revalidatePath('/', 'layout')
    revalidatePath('/admin', 'layout')
    revalidatePath('/admin/announcements')
}

export async function togglePinAnnouncementAction(id: number, isPinned: boolean) {
    await checkAdmin()

    await db.update(announcements)
        .set({ isPinned, updatedAt: new Date() })
        .where(eq(announcements.id, id))

    revalidatePath('/', 'layout')
    revalidatePath('/admin', 'layout')
    revalidatePath('/admin/announcements')
}
