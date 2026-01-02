'use client'

import { useState, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'
import {
    Home,
    Store,
    ShoppingCart,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    Package
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/icons/logo'

interface SidebarContextType {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
    collapsed: false,
    setCollapsed: () => {}
})

export const useSidebar = () => useContext(SidebarContext)

interface NavItem {
    href: string
    icon: React.ElementType
    label: string
    exact?: boolean
}

interface NavSection {
    title?: string
    items: NavItem[]
}

export function AppSidebar({
    user,
    isAdmin
}: {
    user?: { name?: string | null; username?: string | null; avatar_url?: string | null } | null
    isAdmin?: boolean
}) {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const { t } = useI18n()

    const mainNav: NavSection[] = [
        {
            items: [
                { href: '/', icon: Home, label: t('common.home') || '首页', exact: true },
                { href: '/products', icon: Store, label: t('common.market') || '集市' },
            ]
        },
        {
            title: t('common.myAccount') || '我的',
            items: [
                { href: '/orders', icon: ShoppingCart, label: t('common.myOrders') },
            ]
        }
    ]

    if (isAdmin) {
        mainNav.push({
            title: t('common.management') || '管理',
            items: [
                { href: '/admin', icon: Package, label: t('common.products') || '商品管理', exact: true },
                { href: '/admin/orders', icon: FileText, label: t('common.orders') || '订单管理' },
                { href: '/admin/settings', icon: Settings, label: t('admin.settings.title') || '设置' },
            ]
        })
    }

    const isActive = (item: NavItem) => {
        if (item.exact) return pathname === item.href
        return pathname.startsWith(item.href)
    }

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border/40 transition-all duration-300 ease-in-out flex flex-col",
                    collapsed ? "w-16" : "w-60"
                )}
            >
                {/* Logo */}
                <div className={cn(
                    "h-14 flex items-center border-b border-border/40 transition-all duration-300",
                    collapsed ? "px-4 justify-center" : "px-5"
                )}>
                    <Link href="/" className="flex items-center gap-3">
                        <Logo className="h-7 w-7 text-primary shrink-0" />
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="font-semibold text-foreground text-sm">LDC Shop</span>
                                <span className="text-xs text-muted-foreground">{user?.username || 'Guest'}</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                    {mainNav.map((section, sectionIndex) => (
                        <div key={sectionIndex} className={sectionIndex > 0 ? "mt-6" : ""}>
                            {section.title && !collapsed && (
                                <div className="px-3 mb-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                                    {section.title}
                                </div>
                            )}
                            {section.title && collapsed && sectionIndex > 0 && (
                                <div className="mx-auto w-8 h-px bg-border/60 mb-3" />
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg transition-all duration-200",
                                            collapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5",
                                            isActive(item)
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        )}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {!collapsed && <span className="text-sm">{item.label}</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User & Collapse */}
                <div className="border-t border-border/40 p-3">
                    {user && !collapsed && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">{t('common.logout')}</span>
                        </button>
                    )}
                    {user && collapsed && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title={t('common.logout')}
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn(
                            "flex items-center gap-3 w-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors mt-1",
                            collapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5"
                        )}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="text-sm">收起</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </SidebarContext.Provider>
    )
}

export function SidebarPlaceholder() {
    const { collapsed } = useSidebar()
    return (
        <div
            className={cn(
                "shrink-0 transition-all duration-300",
                collapsed ? "w-16" : "w-60"
            )}
        />
    )
}
