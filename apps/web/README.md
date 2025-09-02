# Web 前端应用

这是基于 React 19 和 React Router 7 构建的现代化前端应用，集成了多语言支持、身份认证和现代化的 UI 组件库。

## 📋 应用概述

### 主要功能

- 🌐 **多语言支持**：内置中英文国际化，支持语言切换
- 🔐 **身份认证系统**：基于 Better Auth 的完整认证流程
- 🎨 **现代化 UI**：使用 shadcn/ui 组件库和 Tailwind CSS 4
- ⚡ **高性能**：服务端渲染(SSR)和热模块替换(HMR)
- 🚀 **边缘部署**：部署到 Cloudflare Pages，全球加速访问

### 技术特色

- **React 19**：最新版本的 React，更好的性能和开发体验
- **React Router 7**：文件系统路由，支持 SSR 和 SPA 模式
- **Tailwind CSS 4**：原子化 CSS，快速构建响应式界面
- **TypeScript**：全面的类型安全保障
- **Vite**：极速的开发服务器和构建工具

## 📁 项目结构详解

```
apps/web/
├── app/                          # 应用核心代码
│   ├── components/              # 页面级组件（暂时为空）
│   ├── config/                  # 配置文件
│   │   └── website.ts          # 网站基础配置
│   ├── entry.client.tsx        # 客户端入口文件
│   ├── entry.server.tsx        # 服务端入口文件
│   ├── i18n/                   # 国际化配置
│   │   ├── index.ts            # i18n 核心配置
│   │   └── messages/           # 语言文件
│   │       ├── en/             # 英文语言包
│   │       │   ├── common.ts   # 通用翻译
│   │       │   ├── index.ts    # 英文总入口
│   │       │   └── meta.ts     # SEO 元数据翻译
│   │       └── zh-CN/          # 中文语言包
│   │           ├── common.ts   # 通用翻译
│   │           ├── index.ts    # 中文总入口
│   │           └── meta.ts     # SEO 元数据翻译
│   ├── lib/                    # 工具库
│   │   └── auth.ts            # 身份认证客户端配置
│   ├── root.tsx               # 根组件，包含全局布局
│   ├── routes.ts              # 路由配置文件
│   └── routes/                # 页面路由目录
│       ├── layout.tsx         # 全局布局组件
│       ├── legal/             # 法律相关页面
│       │   ├── cookie.tsx     # Cookie 政策
│       │   ├── privacy.tsx    # 隐私政策
│       │   └── terms.tsx      # 服务条款
│       └── marketing/         # 营销页面
│           └── home.tsx       # 首页
├── public/                    # 静态资源
│   ├── favicon.ico           # 网站图标
│   └── logo.png             # 品牌 Logo
├── workers/                  # Cloudflare Workers 配置
│   └── app.ts               # Workers 入口文件
├── package.json             # 项目依赖和脚本
├── react-router.config.ts   # React Router 配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 构建配置
└── wrangler.jsonc          # Cloudflare 部署配置
```

## 🚀 开发指南

### package.json 命令详解

#### 核心开发命令

**`pnpm dev`**

- **作用**：启动开发服务器
- **实际执行**：`react-router dev`
- **访问地址**：http://localhost:5173
- **特性**：
  - 热模块替换（HMR）
  - 自动重新加载
  - 开发者工具集成
  - 源码映射支持

**`pnpm build`**

- **作用**：构建生产版本
- **实际执行**：`react-router build`
- **输出目录**：`build/` 或 `dist/`
- **优化内容**：
  - 代码压缩和混淆
  - 资源优化和合并
  - Tree-shaking 移除未使用代码
  - 生成静态资源清单

**`pnpm preview`**

- **作用**：预览生产构建版本
- **实际执行**：`pnpm run build && vite preview`
- **用途**：在本地验证生产版本的表现

#### 部署相关命令

**`pnpm deploy`**

- **作用**：构建并部署到 Cloudflare Pages
- **实际执行**：`pnpm run build && wrangler deploy`
- **前提条件**：需要配置 Cloudflare 账户和项目

**`pnpm cf-typegen`**

- **作用**：生成 Cloudflare 绑定的 TypeScript 类型
- **实际执行**：`wrangler types`
- **输出文件**：`worker-configuration.d.ts`

#### 代码质量命令

**`pnpm check-types`**

- **作用**：完整的 TypeScript 类型检查
- **实际执行**：
  1. `pnpm run cf-typegen` - 生成 Cloudflare 类型
  2. `react-router typegen` - 生成路由类型
  3. `tsc -b` - TypeScript 编译检查

**`pnpm lint`**

- **作用**：ESLint 代码质量检查
- **检查内容**：代码规范、潜在问题、最佳实践

**`pnpm format`**

- **作用**：Prettier 代码格式化
- **格式化范围**：TypeScript、TSX、Markdown 文件

### 开发工作流程

#### 1. 启动开发环境

```bash
# 在项目根目录
pnpm dev --filter=web

# 或者在 apps/web 目录下
cd apps/web
pnpm dev
```

#### 2. 添加新页面

```bash
# 在 app/routes/ 目录下创建新文件
touch app/routes/about.tsx
```

文件结构示例：

```tsx
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "关于我们" },
    { name: "description", content: "了解我们的产品和服务" },
  ];
}

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">关于我们</h1>
      <p>这是关于页面的内容</p>
    </div>
  );
}
```

#### 3. 添加多语言支持

```bash
# 1. 在语言文件中添加翻译
vim app/i18n/messages/zh-CN/common.ts
vim app/i18n/messages/en/common.ts

# 2. 在组件中使用翻译
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();

  return <h1>{t('common.welcome')}</h1>;
}
```

#### 4. 使用 UI 组件

```tsx
import { Button } from "@repo/ui/kit/shadcn/button";
import { LocaleSwitcher } from "@repo/ui/components/common/locale-switcher";

export default function HomePage() {
  return (
    <div>
      <LocaleSwitcher />
      <Button variant="outline">点击我</Button>
    </div>
  );
}
```

## 🔧 配置文件说明

### 1. `react-router.config.ts`

React Router 7 的核心配置文件：

```typescript
import { type Config } from "@react-router/dev/config";

export default {
  // 构建目标：Cloudflare Pages
  buildEnd: async () => {
    // 构建完成后的钩子
  },
  // 服务端渲染配置
  ssr: true,
  // 预渲染设置
  prerender: ["/", "/about"],
} satisfies Config;
```

### 2. `vite.config.ts`

Vite 构建工具配置：

- Cloudflare 插件集成
- TypeScript 路径映射
- Tailwind CSS 4 集成
- 开发服务器设置

### 3. `wrangler.jsonc`

Cloudflare 部署配置：

```json
{
  "name": "your-web-app",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "dist"
}
```

## 🌐 国际化(i18n)使用指南

### 语言文件结构

```typescript
// app/i18n/messages/zh-CN/common.ts
export const common = {
  welcome: "欢迎",
  login: "登录",
  logout: "退出",
} as const;

// app/i18n/messages/en/common.ts
export const common = {
  welcome: "Welcome",
  login: "Login",
  logout: "Logout",
} as const;
```

### 在组件中使用翻译

```tsx
import { useTranslation } from "react-i18next";

export default function NavBar() {
  const { t } = useTranslation();

  return (
    <nav>
      <h1>{t("common.welcome")}</h1>
      <button>{t("common.login")}</button>
    </nav>
  );
}
```

### 语言切换

```tsx
import { LocaleSwitcher } from "@repo/ui/components/common/locale-switcher";

export default function Header() {
  return (
    <header>
      <LocaleSwitcher />
    </header>
  );
}
```

## 🔐 身份认证集成

项目已集成 Better Auth 身份认证系统：

### 客户端配置

```typescript
// app/lib/auth.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8787/api",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### 在组件中使用

```tsx
import { useSession, signIn, signOut } from "~/lib/auth";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button onClick={() => signOut()}>退出 ({session.user.email})</button>
    );
  }

  return <button onClick={() => signIn()}>登录</button>;
}
```

## 🎨 样式和主题

### Tailwind CSS 4 使用

项目使用最新的 Tailwind CSS 4：

```tsx
export default function Card() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        卡片标题
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mt-2">卡片内容</p>
    </div>
  );
}
```

### 响应式设计

```tsx
export default function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 内容 */}
    </div>
  );
}
```

## 🚢 部署说明

### Cloudflare Pages 部署

1. **配置环境变量**：

```bash
# 在 Cloudflare Dashboard 中设置
CLIENT_URL=https://your-domain.com
BETTER_AUTH_SECRET=your-secret-key
```

2. **部署命令**：

```bash
pnpm deploy
```

3. **自动部署**：
   - 推送到主分支自动触发部署
   - 支持预览部署和生产部署
   - 内置 CDN 和边缘缓存

### 环境配置

开发环境需要配置 `.env` 文件：

```env
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:8787/api
```

## ❓ 常见问题

### 1. 开发服务器启动失败？

```bash
# 检查端口是否被占用
lsof -i :5173

# 清理依赖重新安装
rm -rf node_modules
pnpm install
```

### 2. 类型错误？

```bash
# 重新生成类型文件
pnpm cf-typegen
pnpm check-types
```

### 3. 国际化不工作？

检查语言文件是否正确导入：

```typescript
// app/i18n/messages/zh-CN/index.ts
export * from "./common";
export * from "./meta";
```

### 4. 组件库导入失败？

确认 `@repo/ui` 包已正确安装和构建：

```bash
# 在项目根目录
pnpm build --filter=@repo/ui
```

## 📚 学习资源

- [React Router 7 文档](https://reactrouter.com/)
- [React 19 新特性](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS 4 文档](https://tailwindcss.com/)
- [Vite 文档](https://vitejs.dev/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Better Auth 文档](https://www.better-auth.com/)
- [i18next React 文档](https://react.i18next.com/)
