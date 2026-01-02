'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Bell, Settings, Plus, Moon, Sun, User, LogIn } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'
import { signOut } from 'next-auth/react'

interface AppHeaderProps {
    user?: {
        name?: string | null
        username?: string | null
        avatar_url?: string | null
    } | null
    isAdmin?: boolean
}

export function AppHeader({ user, isAdmin }: AppHeaderProps) {
    const { theme, setTheme } = useTheme()
    const { t, locale, setLocale } = useI18n()
    const [searchFocused, setSearchFocused] = useState(false)

    return (
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
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={t('common.search') || '搜索'}
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
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                        <Bell className="h-4 w-4" />
                    </Button>

                    {/* Settings */}
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" asChild>
                        <Link href={isAdmin ? "/admin/settings" : "/settings"}>
                            <Settings className="h-4 w-4" />
                        </Link>
                    </Button>

                    {/* Add Button */}
                    {isAdmin && (
                        <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90" asChild>
                            <Link href="/admin">
                                <Plus className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>

                    {/* Language */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-foreground">
                                {locale === 'zh' ? '中' : 'EN'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocale('zh')}>中文</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocale('en')}>English</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
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
    )
}
