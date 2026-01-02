"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { LogIn } from "lucide-react"

export function SignInButton() {
    const { t } = useI18n()

    return (
        <Button
            size="sm"
            onClick={() => signIn("linuxdo")}
            className="gap-2"
        >
            <LogIn className="h-4 w-4" />
            {t('common.login')}
        </Button>
    )
}
