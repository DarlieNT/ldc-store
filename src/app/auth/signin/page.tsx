import { SignInContent } from "@/components/signin-content"
import { getAllSiteSettings } from "@/lib/db/queries"

export default async function SignInPage() {
    let settings: Record<string, string> = {}
    try {
        settings = await getAllSiteSettings()
    } catch (error) {
        console.error('Failed to load site settings:', error)
    }

    return <SignInContent settings={settings} />
}
