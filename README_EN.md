# LDC Shop (Next.js Edition)

[中文说明](./README.md)

---

A robust, serverless virtual goods shop built with **Next.js 16**, **Vercel Postgres**, **Shadcn UI**, and **Linux DO Connect**.

> 💡 **Also available as Cloudflare Workers version:** [View legacy deployment guide → `_legacy/README.md`](./_legacy/README.md)

## ✨ Features
- **Modern Stack**: Next.js 16 (App Router), Tailwind CSS, TypeScript.
- **Vercel Native**: One-click deploy with Vercel Postgres database.
- **Linux DO Integration**: Built-in OIDC Login and EasyPay support.
- **Admin Dashboard**: Products, Stock, Orders, and Refunds management.

## 🚀 One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchatgptuk%2Fldc-shop&env=OAUTH_CLIENT_ID,OAUTH_CLIENT_SECRET,MERCHANT_ID,MERCHANT_KEY,ADMIN_USERS,NEXT_PUBLIC_APP_URL&envDescription=Required%20Environment%20Variables&project-name=ldc-shop&repository-name=ldc-shop&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

Click the button above to deploy your own instance to Vercel.

The database (Vercel Postgres) will be automatically provisioned and linked.

## ⚠️ Important: Custom Domain Required

**Do NOT use the default Vercel domain (`*.vercel.app`) for production!**

Resulting from the shared nature of `vercel.app` domains, they are often flagged by firewalls or payment gateways as low-reputation. This will cause **Payment Callback (Notify) requests to be blocked**, leading to "Payment Success but Order Pending" issues.

**Solution:**
After deployment, you MUST bind a **Custom Domain** (e.g., `store.yourdomain.com`) in the Vercel dashboard and use this domain for `NEXT_PUBLIC_APP_URL` and the payment gateway notification URL.

## ⚠️ Important: Refund WAF Issue

The Refund API of Linux DO Credit is strictly protected by Cloudflare WAF. Direct server-side requests may be blocked (403 Forbidden).

**Current Workaround:**
This project uses a **Client-side API call** solution (via Form submission). When an admin clicks the "Refund" button, it opens a new tab and the browser directly calls the Linux DO Credit Refund API. After confirming success from the API response, the admin returns to the system and clicks "Mark Refunded" to update the order status.

## ⚙️ Configuration Guide

The following environment variables are required.

> **⚠️ NOTE**: 
> The following configuration uses `store.chatgpt.org.uk` as an example. **Please replace it with your ACTUAL domain when deploying!**

### 1. Linux DO Connect (OIDC)
Go to [connect.linux.do](https://connect.linux.do) to create/configure:

*   **App Name**: `LDC Store Next` (or any name)
*   **App Homepage**: `https://store.chatgpt.org.uk`
*   **App Description**: `LDC Store Next`
*   **Callback URL**: `https://store.chatgpt.org.uk/api/auth/callback/linuxdo`

Get **Client ID** and **Client Secret**, and fill them into Vercel Environment Variables as `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET`.

### 2. EPay (Linux DO Credit)
Go to [credit.linux.do](https://credit.linux.do) to create/configure:

*   **App Name**: `LDC Store Next` (or any name)
*   **App Address**: `https://store.chatgpt.org.uk`
*   **Callback URI**: `https://store.chatgpt.org.uk/callback`
*   **Notify URL**: `https://store.chatgpt.org.uk/api/notify`

Get **Client ID** and **Client Secret**, and fill them into Vercel Environment Variables as `MERCHANT_ID` and `MERCHANT_KEY`.

### 3. Other Variables
*   **ADMIN_USERS**: Admin usernames, comma separated (e.g., `chatgpt,admin`).
*   **NEXT_PUBLIC_APP_URL**: Your full app URL (e.g., `https://store.chatgpt.org.uk`).

## 🛠️ Local Development

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Link Vercel Project (for Env Vars & DB):
    ```bash
    vercel link
    vercel env pull .env.development.local
    ```
4.  Run migrations:
    ```bash
    npx drizzle-kit push
    ```
5.  Start dev server:
    ```bash
    npm run dev
    ```

## 📄 License
MIT
