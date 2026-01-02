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
import { Plus, Trash2, Eye, EyeOff, Pin, PinOff, Pencil } from 'lucide-react'
import { createAnnouncementAction, updateAnnouncementAction, deleteAnnouncementAction, toggleAnnouncementAction, togglePinAnnouncementAction } from '@/actions/admin'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Announcement {
    id: number
    title: string
    content: string
    isActive: boolean | null
    isPinned: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
}

export function AnnouncementsContent({ announcements }: { announcements: Announcement[] }) {
    const { t, locale } = useI18n()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const form = e.currentTarget
        try {
            const formData = new FormData(form)
            if (editingAnnouncement) {
                await updateAnnouncementAction(editingAnnouncement.id, formData)
                toast.success(t('common.announcementUpdated') || 'Announcement updated successfully')
                setEditingAnnouncement(null)
            } else {
                await createAnnouncementAction(formData)
                toast.success(t('common.announcementCreated'))
            }
            form.reset()
            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || (editingAnnouncement ? t('common.updateFailed') : t('common.createFailed')))
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement)
        setOpen(true)
    }

    const handleCloseDialog = () => {
        setOpen(false)
        setEditingAnnouncement(null)
    }

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.deleteConfirm'))) return

        try {
            await deleteAnnouncementAction(id)
            toast.success(t('common.announcementDeleted'))
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || t('common.deleteFailed'))
        }
    }

    const handleToggle = async (id: number, isActive: boolean) => {
        try {
            await toggleAnnouncementAction(id, !isActive)
            toast.success(isActive ? t('common.announcementHidden') : t('common.announcementShown'))
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || t('common.operationFailed'))
        }
    }

    const handleTogglePin = async (id: number, isPinned: boolean) => {
        try {
            await togglePinAnnouncementAction(id, !isPinned)
            toast.success(isPinned ? t('common.announcementUnpinned') : t('common.announcementPinned'))
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || t('common.operationFailed'))
        }
    }

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold truncate">{t('common.announcementManagement')}</h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">{t('common.manageSystemAnnouncements')}</p>
                </div>

                <Dialog open={open} onOpenChange={handleCloseDialog}>
                    <DialogTrigger asChild>
                        <Button className="h-9 sm:h-10 shrink-0" onClick={() => setEditingAnnouncement(null)}>
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{t('common.createAnnouncement')}</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl mx-4">
                        <DialogHeader>
                            <DialogTitle>
                                {editingAnnouncement ? (t('common.editAnnouncement') || 'Edit Announcement') : t('common.createAnnouncement')}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">{t('common.title')}</label>
                                <Input
                                    name="title"
                                    defaultValue={editingAnnouncement?.title || ''}
                                    placeholder={t('common.enterAnnouncementTitle')}
                                    required
                                    disabled={loading}
                                    key={editingAnnouncement?.id || 'new'}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">{t('common.content')}</label>
                                <Textarea
                                    name="content"
                                    defaultValue={editingAnnouncement?.content || ''}
                                    placeholder={t('common.enterAnnouncementContent')}
                                    rows={6}
                                    required
                                    disabled={loading}
                                    key={editingAnnouncement?.id || 'new'}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseDialog}
                                    disabled={loading}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (editingAnnouncement ? (t('common.updating') || 'Updating...') : t('common.creating')) : (editingAnnouncement ? (t('common.update') || 'Update') : t('common.create'))}
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
                <div className="grid gap-3 sm:gap-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-base sm:text-lg truncate">{announcement.title}</h3>
                                            {announcement.isPinned && (
                                                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 shrink-0 text-xs">
                                                    <Pin className="h-3 w-3 mr-1" />
                                                    {t('common.pinned')}
                                                </Badge>
                                            )}
                                            <Badge variant={announcement.isActive ? 'default' : 'secondary'} className="text-xs">
                                                {announcement.isActive ? t('common.visible') : t('common.hidden')}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
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
                                            className="h-9 w-9"
                                            onClick={() => handleTogglePin(announcement.id, announcement.isPinned || false)}
                                            title={announcement.isPinned ? t('common.announcementUnpinned') : t('common.announcementPinned')}
                                        >
                                            {announcement.isPinned ? (
                                                <PinOff className="h-4 w-4" />
                                            ) : (
                                                <Pin className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9"
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
                                            className="h-9 w-9"
                                            onClick={() => handleEdit(announcement)}
                                            title={t('common.edit') || 'Edit'}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9"
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
