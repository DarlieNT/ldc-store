
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            username?: string
            trustLevel?: number
            avatar_url?: string
        } & DefaultSession["user"]
    }

    interface User {
        username?: string
        trustLevel?: number
        avatar_url?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        username?: string
        trustLevel?: number
        avatar_url?: string
    }
}
