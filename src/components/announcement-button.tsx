'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/lib/i18n/context'

interface Announcement {
    id: number
    title: string
    content: string
    createdAt: Date | null
}

export function AnnouncementButton({ announcements }: { announcements: Announcement[] }) {
    const [open, setOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const { t, locale } = useI18n()

    useEffect(() => {
        // Check for unread announcements
        const lastReadId = localStorage.getItem('lastReadAnnouncementId')
        const lastId = lastReadId ? parseInt(lastReadId) : 0
        const unread = announcements.filter(a => a.id > lastId).length
        setUnreadCount(unread)
    }, [announcements])

    const handleOpen = () => {
        setOpen(true)
        // Mark all as read
        if (announcements.length > 0) {
            const latestId = announcements[0].id
            localStorage.setItem('lastReadAnnouncementId', latestId.toString())
            setUnreadCount(0)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground relative"
                    onClick={handleOpen}
                >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{t('common.announcements')}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    {announcements.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>{t('common.noAnnouncements')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                                        {announcement.createdAt && (
                                            <span className="text-xs text-muted-foreground shrink-0">
                                                {new Date(announcement.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {announcement.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
