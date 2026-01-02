import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { getActiveAnnouncements } from "@/lib/db/queries"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    const user = session?.user

    // Admin Check
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    if (!user || !user.username || !adminUsers.includes(user.username.toLowerCase())) {
        return notFound()
    }

    // Get announcements
    let announcements: any[] = []
    try {
        announcements = await getActiveAnnouncements()
    } catch (error) {
        console.error('Failed to load announcements:', error)
    }

    return (
        <AppLayout user={user} isAdmin={true} announcements={announcements}>
            {children}
        </AppLayout>
    )
}
