import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Settings, Bell, User } from "lucide-react"
import { SignInButton } from "@/components/signin-button"
import { SignOutButton } from "@/components/signout-button"
import { HeaderNav, HeaderUserMenuItems, LanguageSwitcher } from "@/components/header-client-parts"
import { Logo } from "@/components/icons/logo"
import { getSiteSetting } from "@/lib/db/queries"

export async function SiteHeader() {
    const session = await auth()
    const user = session?.user

    // Check if admin (case-insensitive)
    const adminUsers = process.env.ADMIN_USERS?.toLowerCase().split(',') || []
    const isAdmin = user?.username && adminUsers.includes(user.username.toLowerCase()) || false

    // Get site name from settings
    let siteName = 'LDC Shop'
    try {
        const dbSiteName = await getSiteSetting('siteName')
        if (dbSiteName) siteName = dbSiteName
    } catch {
        // Use default if DB not available
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border/50">
            <div className="container flex h-14 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <Logo className="h-7 w-7 text-primary" />
                        <span className="text-base font-semibold text-foreground">{siteName}</span>
                    </Link>
                    <HeaderNav isAdmin={isAdmin} />
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center h-9 px-3 gap-2 bg-muted/60 hover:bg-muted rounded-lg text-muted-foreground text-sm cursor-pointer transition-colors border border-transparent hover:border-border">
                        <Search className="h-4 w-4" />
                        <span className="hidden lg:inline">Search...</span>
                        <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-card px-1.5 font-mono text-xs text-muted-foreground">
                            <span className="text-xs">Ctrl</span>K
                        </kbd>
                    </div>

                    <nav className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                            <Bell className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                            <Settings className="h-4 w-4" />
                        </Button>
                        <LanguageSwitcher />

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar_url || ''} alt={user.name || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 mt-1" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1.5">
                                            <p className="text-sm font-semibold leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">ID: {user.id}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <HeaderUserMenuItems isAdmin={isAdmin} />
                                    <DropdownMenuSeparator />
                                    <SignOutButton />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SignInButton />
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
