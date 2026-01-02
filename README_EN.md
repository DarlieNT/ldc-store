# LDC Shop

[中文](./README.md)

A modern virtual goods shop built with Next.js 16, React 19, Tailwind CSS 4, and Shadcn UI.

## Features

- **Modern Stack** - Next.js 16 App Router + React 19 + TypeScript
- **Beautiful UI** - Tailwind CSS 4 + Shadcn UI components
- **Database** - Drizzle ORM + Vercel Postgres
- **Authentication** - NextAuth 5 + Linux DO Connect (OIDC)
- **Payment** - Linux DO Credit (EPay)
- **i18n** - English and Chinese support
- **Admin Dashboard** - Products, inventory, orders, site settings

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDarlieNT%2Fldc-store&env=OAUTH_CLIENT_ID,OAUTH_CLIENT_SECRET,MERCHANT_ID,MERCHANT_KEY,ADMIN_USERS,NEXT_PUBLIC_APP_URL&envDescription=Required%20Environment%20Variables&project-name=ldc-store&repository-name=ldc-store&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

Click to deploy to Vercel. Database will be configured automatically.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OAUTH_CLIENT_ID` | Linux DO Connect Client ID |
| `OAUTH_CLIENT_SECRET` | Linux DO Connect Client Secret |
| `MERCHANT_ID` | Linux DO Credit Merchant ID |
| `MERCHANT_KEY` | Linux DO Credit Merchant Key |
| `ADMIN_USERS` | Admin usernames, comma separated |
| `NEXT_PUBLIC_APP_URL` | Full application URL |

## Configuration

### 1. Linux DO Connect

Go to [connect.linux.do](https://connect.linux.do) to create an app:

- **Callback URL**: `https://yourdomain.com/api/auth/callback/linuxdo`

### 2. Linux DO Credit

Go to [credit.linux.do](https://credit.linux.do) to create an app:

- **Callback URI**: `https://yourdomain.com/callback`
- **Notify URL**: `https://yourdomain.com/api/notify`

## Local Development

```bash
# Install dependencies
npm install

# Link Vercel project
vercel link
vercel env pull .env.development.local

# Run database migrations
npx drizzle-kit push

# Start dev server
npm run dev
```

## Important Notes

**Custom Domain Required**

Do not use `*.vercel.app` domains - payment callbacks will be blocked. Bind a custom domain in Vercel dashboard.

**Refund Feature**

Due to Linux DO Credit WAF restrictions, refunds must be completed manually in browser then marked as refunded.

## Project Structure

```
src/
├── app/                # Next.js pages
│   ├── admin/          # Admin dashboard
│   └── api/            # API routes
├── components/         # React components
│   ├── admin/          # Admin components
│   ├── ui/             # UI base components
│   └── icons/          # Icon components
├── lib/                # Utilities
│   ├── db/             # Database
│   └── i18n/           # Internationalization
├── actions/            # Server Actions
└── locales/            # Translation files
```

## License

MIT
