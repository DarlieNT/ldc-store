import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()
    const user = session?.user

    // Admin Check
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    if (!user || !user.username || !adminUsers.includes(user.username.toLowerCase())) {
        return notFound()
    }

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar username={user.username} avatar={user.avatar_url || undefined} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-8 lg:p-10">
                    {children}
                </div>
            </main>
        </div>
    )
}
