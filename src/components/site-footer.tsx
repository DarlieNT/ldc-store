'use client'

import { useI18n } from "@/lib/i18n/context"
import { Logo } from "@/components/icons/logo"

export function SiteFooter() {
    const { t } = useI18n()

    return (
        <footer className="border-t border-border/50 bg-card/50">
            <div className="container py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Logo className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">LDC Shop</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t('footer.disclaimer')}
                    </p>
                </div>
            </div>
        </footer>
    )
}
