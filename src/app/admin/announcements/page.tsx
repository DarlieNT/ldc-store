import { getAllAnnouncements } from "@/lib/db/queries"
import { AnnouncementsContent } from "@/components/admin/announcements-content"

export default async function AnnouncementsPage() {
    const announcements = await getAllAnnouncements()

    return <AnnouncementsContent announcements={announcements} />
}
