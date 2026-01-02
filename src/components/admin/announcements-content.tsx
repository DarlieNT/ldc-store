'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { createAnnouncementAction, deleteAnnouncementAction, toggleAnnouncementAction } from '@/actions/admin'
import { toast } from 'sonner'

interface Announcement {
    id: number
    title: string
    content: string
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
}

export function AnnouncementsContent({ announcements }: { announcements: Announcement[] }) {
    const { t, locale } = useI18n()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const form = e.currentTarget
        try {
            const formData = new FormData(form)
            await createAnnouncementAction(formData)
            toast.success(t('common.announcementCreated'))
            form.reset()
            setOpen(false)
            window.location.reload()
        } catch (error: any) {
            toast.error(error.message || t('common.createFailed'))
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.deleteConfirm'))) return

        try {
            await deleteAnnouncementAction(id)
            toast.success(t('common.announcementDeleted'))
            window.location.reload()
        } catch (error: any) {
            toast.error(error.message || t('common.deleteFailed'))
        }
    }

    const handleToggle = async (id: number, isActive: boolean) => {
        try {
            await toggleAnnouncementAction(id, !isActive)
            toast.success(isActive ? t('common.announcementHidden') : t('common.announcementShown'))
            window.location.reload()
        } catch (error: any) {
            toast.error(error.message || t('common.operationFailed'))
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('common.announcementManagement')}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{t('common.manageSystemAnnouncements')}</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('common.createAnnouncement')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{t('common.createAnnouncement')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">{t('common.title')}</label>
                                <Input
                                    name="title"
                                    placeholder={t('common.enterAnnouncementTitle')}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">{t('common.content')}</label>
                                <Textarea
                                    name="content"
                                    placeholder={t('common.enterAnnouncementContent')}
                                    rows={6}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={loading}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? t('common.creating') : t('common.create')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {announcements.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <p className="text-muted-foreground">{t('common.noAnnouncements')}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg">{announcement.title}</h3>
                                            <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                                                {announcement.isActive ? t('common.visible') : t('common.hidden')}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground whitespace-pre-wrap">
                                            {announcement.content}
                                        </p>
                                        {announcement.createdAt && (
                                            <p className="text-xs text-muted-foreground">
                                                {t('common.createdAt')} {new Date(announcement.createdAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleToggle(announcement.id, announcement.isActive || false)}
                                        >
                                            {announcement.isActive ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDelete(announcement.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
