# LDC Shop

[中文](./README.md)

A modern virtual goods shop built with Next.js 16, React 19, Tailwind CSS 4, and Shadcn UI.

## ✨ Features

### 🎨 User Interface
- **Modern Design** - Beautiful gradient backgrounds, smooth animations, responsive layout
- **Dark Mode** - Full support for light/dark theme switching
- **Sidebar Navigation** - Collapsible sidebar with elegant navigation experience
- **Smooth Animations** - Page transitions, hover effects, seamless interactions

### 🛠️ Core Features
- **Product Management** - CRUD operations, inventory control, card key management, sorting
- **Order System** - Auto-delivery, order tracking, refund processing
- **Announcement System** - Publish system announcements, real-time viewing, unread notifications
- **Site Settings** - Customize site name, description, footer text
- **User Authentication** - Linux DO OAuth login, secure and reliable
- **Payment Integration** - Linux DO Credit payment

### 🌐 Tech Stack
- **Frontend Framework** - Next.js 16 App Router + React 19 + TypeScript
- **UI Components** - Tailwind CSS 4 + Shadcn UI + Lucide Icons
- **Database** - Drizzle ORM + Vercel Postgres
- **Authentication** - NextAuth 5 + Linux DO Connect (OIDC)
- **Internationalization** - Full English and Chinese translation support

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

## 📋 Feature List

### User Features
- ✅ Browse and search products
- ✅ One-click purchase and payment
- ✅ Order query and management
- ✅ View system announcements
- ✅ Dark mode toggle
- ✅ English/Chinese language switch

### Admin Dashboard
- ✅ Product management (add/edit/delete/publish)
- ✅ Inventory management (bulk import card keys, view usage status)
- ✅ Order management (view orders, process refunds)
- ✅ Announcement management (create/edit/delete announcements)
- ✅ Site settings (customize site information)
- ✅ Data statistics (today/week/month orders)

## ⚠️ Important Notes

**Custom Domain Required**

Do not use `*.vercel.app` domains - payment callbacks will be blocked. Bind a custom domain in Vercel dashboard.

**Refund Process**

Due to Linux DO Credit WAF restrictions, refunds require manual completion in browser:
1. Click "Refund" button in admin dashboard
2. Complete refund operation in the new tab
3. After confirming refund success, click "Mark as Refunded"

**Database Initialization**

Database tables will be created automatically on first deployment. For manual initialization, run:
```bash
npx drizzle-kit push
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (main)/            # Main application route group
│   ├── admin/             # Admin dashboard
│   │   ├── announcements/ # Announcement management
│   │   ├── cards/         # Card key management
│   │   ├── orders/        # Order management
│   │   ├── settings/      # Site settings
│   │   └── product/       # Product editing
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   └── notify/        # Payment callbacks
│   └── auth/              # Sign-in page
├── components/            # React components
│   ├── admin/             # Admin dashboard components
│   ├── ui/                # Shadcn UI components
│   └── icons/             # Icon components
├── lib/                   # Utilities
│   ├── db/                # Database config and queries
│   └── i18n/              # Internationalization config
├── actions/               # Server Actions
└── locales/               # Translation files (zh.json, en.json)
```

## 🎨 UI Components

Built with Shadcn UI, includes:
- Button, Card, Badge, Input, Textarea
- Dialog, DropdownMenu, ScrollArea
- Avatar, Label, Table
- Custom animations and transitions

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Credits

- [Next.js](https://nextjs.org/) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Linux DO](https://linux.do/) - Authentication and payment services
