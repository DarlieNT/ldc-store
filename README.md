# LDC Shop

[English](./README_EN.md)

一个现代化的虚拟商品商店，基于 Next.js 16、React 19、Tailwind CSS 4 和 Shadcn UI 构建。

## 特性

- **现代技术栈** - Next.js 16 App Router + React 19 + TypeScript
- **精美 UI** - Tailwind CSS 4 + Shadcn UI 组件库
- **数据库** - Drizzle ORM + Vercel Postgres
- **身份认证** - NextAuth 5 + Linux DO Connect (OIDC)
- **支付集成** - Linux DO Credit (EPay)
- **国际化** - 中英文双语支持
- **管理后台** - 商品管理、库存管理、订单管理、站点设置

## 快速部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchatgptuk%2Fldc-shop&env=OAUTH_CLIENT_ID,OAUTH_CLIENT_SECRET,MERCHANT_ID,MERCHANT_KEY,ADMIN_USERS,NEXT_PUBLIC_APP_URL&envDescription=Required%20Environment%20Variables&project-name=ldc-shop&repository-name=ldc-shop&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

点击按钮一键部署到 Vercel，数据库会自动配置。

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `OAUTH_CLIENT_ID` | Linux DO Connect 客户端 ID |
| `OAUTH_CLIENT_SECRET` | Linux DO Connect 客户端密钥 |
| `MERCHANT_ID` | Linux DO Credit 商户 ID |
| `MERCHANT_KEY` | Linux DO Credit 商户密钥 |
| `ADMIN_USERS` | 管理员用户名，逗号分隔 |
| `NEXT_PUBLIC_APP_URL` | 应用完整 URL |

## 配置步骤

### 1. Linux DO Connect

前往 [connect.linux.do](https://connect.linux.do) 创建应用：

- **回调地址**: `https://你的域名/api/auth/callback/linuxdo`

### 2. Linux DO Credit

前往 [credit.linux.do](https://credit.linux.do) 创建应用：

- **回调 URI**: `https://你的域名/callback`
- **通知 URL**: `https://你的域名/api/notify`

## 本地开发

```bash
# 安装依赖
npm install

# 链接 Vercel 项目
vercel link
vercel env pull .env.development.local

# 数据库迁移
npx drizzle-kit push

# 启动开发服务器
npm run dev
```

## 注意事项

**必须绑定自定义域名**

不要使用 `*.vercel.app` 域名，会导致支付回调被拦截。请在 Vercel 控制台绑定自定义域名。

**退款功能**

由于 Linux DO Credit 的 WAF 限制，退款需要在浏览器中手动完成后标记状态。

## 目录结构

```
src/
├── app/                # Next.js 页面
│   ├── admin/          # 管理后台
│   └── api/            # API 路由
├── components/         # React 组件
│   ├── admin/          # 管理后台组件
│   ├── ui/             # UI 基础组件
│   └── icons/          # 图标组件
├── lib/                # 工具库
│   ├── db/             # 数据库相关
│   └── i18n/           # 国际化
├── actions/            # Server Actions
└── locales/            # 翻译文件
```

## 许可证

MIT
