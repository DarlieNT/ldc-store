# LDC Shop

[English](./README_EN.md)

一个现代化的虚拟商品商店，基于 Next.js 16、React 19、Tailwind CSS 4 和 Shadcn UI 构建。

## ✨ 特性

### 🎨 用户界面
- **现代化设计** - 精美的渐变背景、流畅的动画过渡、响应式布局
- **暗色模式** - 完整支持亮色/暗色主题切换
- **侧边栏导航** - 可折叠的侧边栏，优雅的导航体验
- **流畅动画** - 页面切换动画、hover 效果、平滑过渡

### 🛠️ 核心功能
- **商品管理** - 商品 CRUD、库存管理、卡密管理、商品排序
- **订单系统** - 自动发货、订单追踪、退款处理
- **公告系统** - 发布系统公告、用户实时查看、未读提醒
- **站点设置** - 自定义站点名称、描述、页脚文字
- **用户认证** - Linux DO OAuth 登录，安全可靠
- **支付集成** - Linux DO Credit 积分支付

### 🌐 技术栈
- **前端框架** - Next.js 16 App Router + React 19 + TypeScript
- **UI 组件** - Tailwind CSS 4 + Shadcn UI + Lucide Icons
- **数据库** - Drizzle ORM + Vercel Postgres
- **身份认证** - NextAuth 5 + Linux DO Connect (OIDC)
- **国际化** - 中英文双语支持，完整翻译

## 快速部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDarlieNT%2Fldc-store&env=OAUTH_CLIENT_ID,OAUTH_CLIENT_SECRET,MERCHANT_ID,MERCHANT_KEY,ADMIN_USERS,NEXT_PUBLIC_APP_URL&envDescription=Required%20Environment%20Variables&project-name=ldc-store&repository-name=ldc-store&stores=%5B%7B%22type%22%3A%22postgres%22%7D%5D)

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

## 📋 功能清单

### 用户端
- ✅ 商品浏览和搜索
- ✅ 一键购买和支付
- ✅ 订单查询和管理
- ✅ 查看系统公告
- ✅ 暗色模式切换
- ✅ 中英文语言切换

### 管理后台
- ✅ 商品管理（添加/编辑/删除/上下架）
- ✅ 库存管理（批量导入卡密、查看使用状态）
- ✅ 订单管理（查看订单、处理退款）
- ✅ 公告管理（发布/编辑/删除公告）
- ✅ 站点设置（自定义站点信息）
- ✅ 数据统计（今日/本周/本月订单）

## ⚠️ 注意事项

**必须绑定自定义域名**

不要使用 `*.vercel.app` 域名，会导致支付回调被拦截。请在 Vercel 控制台绑定自定义域名。

**退款功能说明**

由于 Linux DO Credit 的 WAF 限制，退款需要在浏览器中手动完成后标记状态。具体流程：
1. 在管理后台点击"退款"按钮
2. 在新标签页中完成退款操作
3. 确认退款成功后，点击"标记已退款"

**数据库初始化**

首次部署后，数据库表会自动创建。如需手动初始化，运行：
```bash
npx drizzle-kit push
```

## 📁 目录结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── (main)/            # 主应用路由组
│   ├── admin/             # 管理后台
│   │   ├── announcements/ # 公告管理
│   │   ├── cards/         # 卡密管理
│   │   ├── orders/        # 订单管理
│   │   ├── settings/      # 站点设置
│   │   └── product/       # 商品编辑
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关
│   │   └── notify/        # 支付回调
│   └── auth/              # 登录页面
├── components/            # React 组件
│   ├── admin/             # 管理后台组件
│   ├── ui/                # Shadcn UI 组件
│   └── icons/             # 图标组件
├── lib/                   # 工具库
│   ├── db/                # 数据库配置和查询
│   └── i18n/              # 国际化配置
├── actions/               # Server Actions
└── locales/               # 翻译文件 (zh.json, en.json)
```

## 🎨 UI 组件

项目使用 Shadcn UI 构建，包含以下组件：
- Button, Card, Badge, Input, Textarea
- Dialog, DropdownMenu, ScrollArea
- Avatar, Label, Table
- 自定义动画和过渡效果

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Shadcn UI](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Linux DO](https://linux.do/) - 认证和支付服务
