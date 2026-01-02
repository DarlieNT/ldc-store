'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Logo } from "@/components/icons/logo"

export function SiteFooter() {
    const { t } = useI18n()

    return (
        <footer className="border-t border-border/50 bg-card/50">
            <div className="container py-8 md:py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <Logo className="h-6 w-6 text-primary" />
                        <span className="font-semibold text-foreground">LDC Shop</span>
                    </div>
                    <p className="text-center text-sm text-muted-foreground max-w-md">
                        {t('footer.disclaimer')}
                    </p>
                    <a
                        href="https://chatgpt.org.uk"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        {t('footer.poweredBy')}
                    </a>
                </div>
            </div>
        </footer>
    )
}
