import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/app-layout"
import { getActiveAnnouncements } from "@/lib/db/queries"

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

    // Get announcements
    let announcements: any[] = []
    try {
        announcements = await getActiveAnnouncements()
    } catch (error) {
        console.error('Failed to load announcements:', error)
    }

    return (
        <AppLayout user={user} isAdmin={isAdmin} announcements={announcements}>
            {children}
        </AppLayout>
    )
}
