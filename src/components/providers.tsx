'use client'

import { I18nProvider } from '@/lib/i18n/context'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <I18nProvider>
                {children}
                <Toaster position="top-center" richColors />
            </I18nProvider>
        </ThemeProvider>
    )
}
