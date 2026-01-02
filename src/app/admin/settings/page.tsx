import { getAllSiteSettings } from "@/lib/db/queries"
import { SettingsContent } from "@/components/admin/settings-content"

export default async function SettingsPage() {
    const settings = await getAllSiteSettings()

    return <SettingsContent settings={settings} />
}
