'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, X, Pin } from 'lucide-react'
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
    isPinned: boolean | null
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
            <DialogContent className="max-w-2xl max-h-[85vh] mx-4">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">{t('common.announcements')}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-2 sm:pr-4">
                    {announcements.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 text-muted-foreground">
                            <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">{t('common.noAnnouncements')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{announcement.title}</h3>
                                            {announcement.isPinned && (
                                                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 shrink-0 text-[10px] sm:text-xs h-5">
                                                    <Pin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                                    <span className="hidden sm:inline">{t('common.pinned')}</span>
                                                </Badge>
                                            )}
                                        </div>
                                        {announcement.createdAt && (
                                            <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                                                {new Date(announcement.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
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
