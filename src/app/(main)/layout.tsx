import { auth } from "@/lib/auth"
import { AppLayout } from "@/components/app-layout"

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

    return (
        <AppLayout user={user} isAdmin={isAdmin}>
            {children}
        </AppLayout>
    )
}
