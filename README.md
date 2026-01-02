# LDC Shop (Next.js Edition)

[English](./README_EN.md)

---

基于 **Next.js 16**、**Vercel Postgres**、**Shadcn UI** 和 **Linux DO Connect** 构建的强大的无服务器虚拟商品商店。

> 💡 **也提供 Cloudflare Workers 版本：** [查看旧版部署指南 → `_legacy/README.md`](./_legacy/README.md)

## ✨ 特性
- **现代技术栈**: Next.js 16 (App Router), Tailwind CSS, TypeScript.
- **Vercel 原生**: 一键部署，自动配置 Vercel Postgres 数据库。
- **Linux DO 集成**: 内置 OIDC 登录和 EasyPay 支付支持。
- **管理后台**: 商品、库存、订单及退款管理。

## 🚀 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchatgptuk%2Fldc-shop&env=OAUTH_CLIENT_ID,OAUTH_CLIENT_SECRET,MERCHANT_ID,MERCHANT_KEY,ADMIN_USERS,NEXT_PUBLIC_APP_URL&envDescription=Required%20Environment%20Variables&project-name=ldc-shop&repository-name=ldc-shop&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

点击上方按钮将您自己的实例部署到 Vercel。

数据库 (Vercel Postgres) 将会自动配置并链接。

## ⚠️ 重要：必须绑定自定义域名

**请勿使用 Vercel 提供的默认域名 (`*.vercel.app`) 进行生产环境部署！**

由于 `vercel.app` 是共享域名，常被防火墙或支付平台列入低信誉名单，会导致 **支付回调 (Notify) 请求被拦截**，从而出现"支付成功但订单状态未更新"的问题。

**解决方案：**
部署后，请务必在 Vercel控制台绑定一个**自定义域名**（如 `store.yourdomain.com`），并使用该域名配置 `NEXT_PUBLIC_APP_URL` 和支付平台的通知地址。

## ⚠️ 重要：关于退款拦截问题 (Refund WAF Issue)

Linux DO Credit 的退款 API 受到 Cloudflare WAF 的严格保护，直接从服务器端发起请求可能会被拦截（报错 403 Forbidden）。

**目前的临时解决方案：**
本项目采用了**客户端 API 调用方案**（通过 Form 表单提交）。当管理员点击退款按钮时，会打开新标签页并由浏览器直接调用 Linux DO Credit 的退款 API。管理员需确认 API 返回成功后，返回本系统点击"标记已退款"来更新订单状态。

## ⚙️ 配置指南

部署时需要配置以下环境变量。

> **⚠️ 注意**: 
> 以下配置以域名 `store.chatgpt.org.uk` 为例，**部署时请务必替换为你自己的实际域名！**

### 1. Linux DO Connect (OIDC) 配置
前往 [connect.linux.do](https://connect.linux.do) 创建/配置应用：

*   **应用名称 (App Name)**: `LDC Store Next` (或任意名称)
*   **应用主页 (App Homepage)**: `https://store.chatgpt.org.uk`
*   **应用描述 (App Description)**: `LDC Store Next`
*   **回调地址 (Callback URL)**: `https://store.chatgpt.org.uk/api/auth/callback/linuxdo`

获取 **Client ID** 和 **Client Secret**，分别填入 Vercel 环境变量的 `OAUTH_CLIENT_ID` 和 `OAUTH_CLIENT_SECRET`。

### 2. EPay (Linux DO Credit) 配置
前往 [credit.linux.do](https://credit.linux.do) 创建/配置应用：

*   **应用名称**: `LDC Store Next` (或任意名称)
*   **应用地址**: `https://store.chatgpt.org.uk`
*   **回调 URI**: `https://store.chatgpt.org.uk/callback`
*   **通知 URL**: `https://store.chatgpt.org.uk/api/notify`

获取 **Client ID** 和 **Client Secret**，分别填入 Vercel 环境变量的 `MERCHANT_ID` 和 `MERCHANT_KEY`。

### 3. 其他变量
*   **ADMIN_USERS**: 管理员用户名，逗号分隔，例如 `chatgpt,admin`
*   **NEXT_PUBLIC_APP_URL**: 你的应用完整域名，例如 `https://store.chatgpt.org.uk`

## 🛠️ 本地开发

1.  克隆仓库。
2.  安装依赖:
    ```bash
    npm install
    ```
3.  链接 Vercel 项目 (用于拉取环境变量和数据库配置):
    ```bash
    vercel link
    vercel env pull .env.development.local
    ```
4.  运行数据库迁移:
    ```bash
    npx drizzle-kit push
    ```
5.  启动开发服务器:
    ```bash
    npm run dev
    ```

## 📄 许可证
MIT
