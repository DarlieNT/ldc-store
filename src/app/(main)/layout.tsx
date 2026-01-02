import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/app-layout"
import { getActiveAnnouncements, getAllSiteSettings } from "@/lib/db/queries"

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    const user = session?.user

    // Check if admin
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    const isAdmin = user?.username && adminUsers.includes(user.username.toLowerCase()) || false

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
        <AppLayout user={user} isAdmin={isAdmin} announcements={announcements} settings={settings}>
            {children}
        </AppLayout>
    )
}
