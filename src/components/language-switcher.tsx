'use client'

import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
    const { locale, setLocale, t } = useI18n()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                    <Globe className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
                <DropdownMenuItem
                    onClick={() => setLocale('en')}
                    className={locale === 'en' ? 'bg-primary/10 text-primary' : ''}
                >
                    {t('common.english')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setLocale('zh')}
                    className={locale === 'zh' ? 'bg-primary/10 text-primary' : ''}
                >
                    {t('common.chinese')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
