'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Home,
    ShoppingCart,
    FileText,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User,
    Package,
    Search,
    Plus,
    Moon,
    Sun,
    LogIn,
    Bell
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/icons/logo'
import { AnnouncementButton } from '@/components/announcement-button'

// Sidebar Context
interface SidebarContextType {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
    collapsed: false,
    setCollapsed: () => {}
})

export const useSidebar = () => useContext(SidebarContext)

// Types
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

interface Announcement {
    id: number
    title: string
    content: string
    createdAt: Date | null
}

interface AppLayoutProps {
    children: ReactNode
    user?: {
        id?: string
        name?: string | null
        username?: string | null
        avatar_url?: string | null
    } | null
    isAdmin?: boolean
    announcements?: Announcement[]
}

export function AppLayout({ children, user, isAdmin, announcements = [] }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const { t, locale, setLocale } = useI18n()
    const { theme, setTheme } = useTheme()
    const [searchFocused, setSearchFocused] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const mainNav: NavSection[] = [
        {
            items: [
                { href: '/', icon: Home, label: t('common.home'), exact: true },
            ]
        }
    ]

    if (user) {
        mainNav.push({
            title: t('common.myAccount'),
            items: [
                { href: '/orders', icon: ShoppingCart, label: t('common.myOrders') },
            ]
        })
    }

    if (isAdmin) {
        mainNav.push({
            title: t('common.management'),
            items: [
                { href: '/admin', icon: Package, label: t('common.products'), exact: true },
                { href: '/admin/orders', icon: FileText, label: t('common.orders') },
                { href: '/admin/announcements', icon: Bell, label: t('common.announcementManagement') },
                { href: '/admin/settings', icon: Settings, label: t('admin.settings.title') || 'Settings' },
            ]
        })
    }

    const isActive = (item: NavItem) => {
        if (item.exact) return pathname === item.href
        return pathname.startsWith(item.href)
    }

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            <div className="min-h-screen bg-background">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border/40 transition-all duration-300 ease-in-out flex flex-col",
                        collapsed ? "w-[68px]" : "w-[220px]"
                    )}
                >
                    {/* Logo */}
                    <div className={cn(
                        "h-14 flex items-center border-b border-border/40 transition-all duration-300",
                        collapsed ? "px-4 justify-center" : "px-4"
                    )}>
                        <Link href="/" className="flex items-center gap-3 overflow-hidden">
                            <Logo className="h-7 w-7 text-primary shrink-0" />
                            <div className={cn(
                                "flex flex-col transition-all duration-300 overflow-hidden",
                                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                            )}>
                                <span className="font-semibold text-foreground text-sm whitespace-nowrap">LDC Shop</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{user?.username || t('common.guest')}</span>
                            </div>
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
                                {collapsed && sectionIndex > 0 && (
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
                                            <span className={cn(
                                                "text-sm transition-all duration-300 overflow-hidden whitespace-nowrap",
                                                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                            )}>
                                                {item.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-border/40 p-3 space-y-1">
                        {user && (
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className={cn(
                                    "flex items-center gap-3 w-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
                                    collapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5"
                                )}
                                title={collapsed ? t('common.logout') : undefined}
                            >
                                <LogOut className="h-4 w-4 shrink-0" />
                                <span className={cn(
                                    "text-sm transition-all duration-300 overflow-hidden whitespace-nowrap",
                                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                                )}>
                                    {t('common.logout')}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className={cn(
                                "flex items-center gap-3 w-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
                                collapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5"
                            )}
                        >
                            {collapsed ? (
                                <ChevronRight className="h-4 w-4 shrink-0" />
                            ) : (
                                <>
                                    <ChevronLeft className="h-4 w-4 shrink-0" />
                                    <span className="text-sm">{t('common.collapse')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className={cn(
                    "transition-all duration-300",
                    collapsed ? "ml-[68px]" : "ml-[220px]"
                )}>
                    {/* Header */}
                    <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-md border-b border-border/40">
                        <div className="h-full px-6 flex items-center justify-between gap-4">
                            {/* Search */}
                            <div className="flex-1 max-w-md">
                                <div
                                    className={cn(
                                        "flex items-center gap-2 h-9 px-3 rounded-lg border transition-all duration-200",
                                        searchFocused
                                            ? "border-primary bg-background shadow-sm"
                                            : "border-transparent bg-muted/50 hover:bg-muted"
                                    )}
                                >
                                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={t('common.search')}
                                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                    />
                                    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                                        ⌘K
                                    </kbd>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {/* Announcements */}
                                <AnnouncementButton announcements={announcements} />

                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" asChild>
                                    <Link href={isAdmin ? "/admin/settings" : "/"}>
                                        <Settings className="h-4 w-4" />
                                    </Link>
                                </Button>

                                {isAdmin && (
                                    <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90" asChild>
                                        <Link href="/admin">
                                            <Plus className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                >
                                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-foreground font-normal">
                                            {locale === 'zh' ? t('common.chinese') : 'EN'}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setLocale('zh')}>{t('common.chinese')}</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLocale('en')}>{t('common.english')}</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <div className="px-2 py-1.5 border-b border-border mb-1">
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                                            </div>
                                            <DropdownMenuItem asChild>
                                                <Link href="/orders">{t('common.myOrders')}</Link>
                                            </DropdownMenuItem>
                                            {isAdmin && (
                                                <DropdownMenuItem asChild>
                                                    <Link href="/admin">{t('common.admin')}</Link>
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                                                {t('common.logout')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Button variant="ghost" size="sm" className="h-9 gap-2" asChild>
                                        <Link href="/api/auth/signin">
                                            <LogIn className="h-4 w-4" />
                                            {t('common.login')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="min-h-[calc(100vh-3.5rem)]">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    )
}
