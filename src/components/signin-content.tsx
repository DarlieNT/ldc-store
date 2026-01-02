'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/icons/logo'
import { LogIn, ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export function SignInContent() {
    const { t } = useI18n()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 p-4">
            <Card className="w-full max-w-md border-border/50 shadow-xl">
                <CardContent className="p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Logo className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                            {t('signin.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('signin.subtitle')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={() => signIn('linuxdo', { callbackUrl: '/' })}
                            className="w-full h-12 text-base font-medium group"
                            size="lg"
                        >
                            <LogIn className="h-5 w-5 mr-2" />
                            {t('signin.loginButton')}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    {t('signin.secureLogin')}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p>{t('signin.oauth')}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p>{t('signin.noPassword')}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p>{t('signin.revokable')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border text-center">
                        <p className="text-xs text-muted-foreground">
                            {t('signin.terms')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
