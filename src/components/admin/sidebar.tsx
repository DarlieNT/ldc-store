'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Package, CreditCard, LogOut, LayoutDashboard, Settings, ChevronLeft, User, Home, Bell } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/icons/logo"

interface NavItem {
    href: string
    icon: React.ElementType
    label: string
    exact?: boolean
}

export function AdminSidebar({ username, avatar }: { username: string; avatar?: string }) {
    const { t } = useI18n()
    const pathname = usePathname()

    const navItems: NavItem[] = [
        { href: "/admin", icon: LayoutDashboard, label: t('common.dashboardProducts'), exact: true },
        { href: "/admin/orders", icon: CreditCard, label: t('common.ordersRefunds') },
        { href: "/admin/announcements", icon: Bell, label: t('common.announcementManagement') },
        { href: "/admin/settings", icon: Settings, label: t('admin.settings.title') || 'Settings' },
    ]

    const isActive = (item: NavItem) => {
        if (item.exact) {
            return pathname === item.href
        }
        return pathname.startsWith(item.href)
    }

    return (
        <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border/50 min-h-screen">
            <div className="flex items-center gap-3 px-6 h-14 border-b border-border/50">
                <Logo className="h-7 w-7 text-primary" />
                <span className="font-semibold text-foreground">Admin</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors mb-4">
                    <Home className="h-4 w-4" />
                    <span>{t('common.backToHome') || 'Back to Home'}</span>
                </Link>

                <div className="text-xs font-medium text-muted-foreground/70 px-3 py-2 uppercase tracking-wider">
                    {t('common.management') || 'Management'}
                </div>

                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all",
                            isActive(item)
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 px-3 py-2 mb-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={avatar} alt={username} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{username}</p>
                        <p className="text-xs text-muted-foreground">{t('common.admin')}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    {t('common.logout')}
                </Button>
            </div>
        </aside>
    )
}
