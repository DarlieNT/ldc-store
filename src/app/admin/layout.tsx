import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { getActiveAnnouncements, getAllSiteSettings } from "@/lib/db/queries"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    const user = session?.user

    // Admin Check
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    if (!user || !user.username || !adminUsers.includes(user.username.toLowerCase())) {
        return notFound()
    }

    // Get announcements and settings
    let announcements: any[] = []
    let settings: Record<string, string> = {}
    try {
        [announcements, settings] = await Promise.all([
            getActiveAnnouncements(),
            getAllSiteSettings()
        ])
    } catch (error) {
        console.error('Failed to load data:', error)
    }

    return (
        <AppLayout user={user} isAdmin={true} announcements={announcements} settings={settings}>
            {children}
        </AppLayout>
    )
}
