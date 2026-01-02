'use client'

import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { saveSiteSettings } from "@/actions/admin"
import { toast } from "sonner"
import { useState } from "react"
import { Settings, Save, Loader2, Globe, Type, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

interface SettingsContentProps {
    settings: Record<string, string>
}

export function SettingsContent({ settings }: SettingsContentProps) {
    const { t } = useI18n()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            await saveSiteSettings(formData)
            toast.success(t('common.success'))
            router.refresh()
        } catch (e: any) {
            toast.error(e.message || t('common.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-8 max-w-2xl">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{t('admin.settings.title')}</h1>
                    <p className="text-muted-foreground text-sm">{t('admin.settings.subtitle')}</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {t('admin.settings.siteInfo')}
                    </CardTitle>
                    <CardDescription>{t('admin.settings.siteInfoDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="siteName" className="text-sm font-medium flex items-center gap-2">
                                <Type className="h-3.5 w-3.5" />
                                {t('admin.settings.siteName')}
                            </Label>
                            <Input
                                id="siteName"
                                name="siteName"
                                defaultValue={settings.siteName || 'LDC Shop'}
                                placeholder="LDC Shop"
                            />
                            <p className="text-xs text-muted-foreground">{t('admin.settings.siteNameHint')}</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="siteDescription" className="text-sm font-medium flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5" />
                                {t('admin.settings.siteDescription')}
                            </Label>
                            <Textarea
                                id="siteDescription"
                                name="siteDescription"
                                defaultValue={settings.siteDescription || ''}
                                placeholder={t('admin.settings.siteDescriptionPlaceholder')}
                                rows={3}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">{t('admin.settings.siteDescriptionHint')}</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="footerText" className="text-sm font-medium">
                                {t('admin.settings.footerText')}
                            </Label>
                            <Input
                                id="footerText"
                                name="footerText"
                                defaultValue={settings.footerText || ''}
                                placeholder={t('admin.settings.footerTextPlaceholder')}
                            />
                            <p className="text-xs text-muted-foreground">{t('admin.settings.footerTextHint')}</p>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={loading} className="gap-2">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('common.saving') || 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {t('common.save')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
