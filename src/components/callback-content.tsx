'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function CallbackContent({ params }: { params: any }) {
    const router = useRouter()
    const [debugInfo, setDebugInfo] = useState<string>('')

    useEffect(() => {
        let orderId = params.out_trade_no

        // Handle array case
        if (Array.isArray(orderId)) {
            orderId = orderId[0]
        }

        // Handle potential dumb append "123?out_trade_no=123"
        if (typeof orderId === 'string' && orderId.includes('?')) {
            orderId = orderId.split('?')[0]
        }

        if (orderId) {
            // Success - Redirect
            router.replace(`/order/${orderId}`)
        } else {
            // Failure - Show Debug Info
            setDebugInfo(JSON.stringify(params, null, 2))
            // Auto-redirect to home after 5s if they don't intervene? 
            // Better to let them see the error.
        }
    }, [params, router])

    if (!debugInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Processing payment callback...</p>
            </div>
        )
    }

    return (
        <div className="container py-12 flex flex-col items-center gap-6">
            <h1 className="text-2xl font-bold text-destructive">Redirect Failed</h1>
            <p className="text-muted-foreground text-center">
                Could not find Order ID in callback parameters. <br />
                Please verify your order history manually.
            </p>

            <div className="w-full max-w-md bg-muted p-4 rounded-lg overflow-auto font-mono text-xs">
                <p className="font-bold mb-2">Debug Info:</p>
                <pre>{debugInfo}</pre>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => router.push('/orders')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    Go to My Orders
                </button>
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 border rounded-md hover:bg-muted"
                >
                    Go Home
                </button>
            </div>
        </div>
    )
}
