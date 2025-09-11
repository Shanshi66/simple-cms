# 全栈 Monorepo 项目模板

这是一个现代化的全栈 monorepo 项目模板，集成了最新的开发工具和最佳实践，特别适合初学者学习和企业级项目开发。

## 📋 项目概述

### 什么是 Monorepo？

Monorepo（单一代码库）是一种将多个相关项目存储在同一个代码库中的软件开发策略。与传统的每个项目一个仓库的方式不同，monorepo 允许你在一个地方管理前端、后端、共享组件库等多个相关项目。

### 为什么选择 Monorepo？

- **代码共享**：多个项目可以轻松共享组件、工具函数和类型定义
- **统一管理**：统一的依赖管理、构建流程和代码规范
- **原子性提交**：跨多个项目的功能可以在一次提交中完成
- **简化重构**：修改共享代码时可以同时更新所有使用的地方

## 🛠 技术栈介绍

### 前端技术

- **React 19**：最新版本的 React，提供更好的性能和开发体验
- **React Router 7**：最新的 React 路由库，支持文件系统路由和服务端渲染
- **Tailwind CSS 4**：原子化 CSS 框架，快速构建现代化界面
- **Vite**：极速的构建工具，提供快速的热更新体验
- **i18next**：国际化解决方案，支持多语言切换

### 后端技术

- **Hono**：轻量级、快速的 Web 框架，专为边缘计算优化
- **Drizzle ORM**：现代化的 TypeScript ORM，类型安全的数据库操作
- **Better Auth**：安全、易用的身份认证解决方案
- **Cloudflare Workers**：全球分布式的无服务器计算平台

### 共享工具

- **shadcn/ui**：基于 Radix UI 的高质量组件库
- **Turborepo**：高性能的 monorepo 构建系统
- **TypeScript**：静态类型检查，提高代码质量
- **ESLint + Prettier**：统一的代码风格和质量检查

## 📁 项目结构

```
monorepo-template/
├── apps/                    # 应用程序目录
│   ├── web/                # React 前端应用
│   └── service/            # Hono 后端 API
├── packages/               # 共享包目录
│   ├── ui/                 # UI 组件库
│   ├── eslint/             # ESLint 配置
│   ├── tsconfig/           # TypeScript 配置
│   ├── types/              # 共享类型定义
│   └── utils/              # 工具函数库
├── .husky/                 # Git 钩子配置
├── scripts/                # 构建脚本
├── turbo.json              # Turborepo 配置
├── package.json            # 根级依赖配置
└── pnpm-workspace.yaml     # pnpm 工作空间配置
```

## 🚀 快速开始

### 环境要求

确保你的开发环境满足以下要求：

- **Node.js**: 18.0 或以上版本
- **pnpm**: 9.0 或以上版本（推荐使用 pnpm 而不是 npm 或 yarn）

### 安装步骤

1. **克隆项目**

```bash
git clone <your-repo-url>
cd monorepo-template
```

2. **安装依赖**

```bash
# 使用 pnpm 安装所有依赖（包括子项目的依赖）
pnpm install
```

3. **启动开发服务器**

```bash
# 同时启动前端和后端开发服务器
pnpm dev
```

## 📝 package.json 命令详解

### 核心开发命令

#### `pnpm dev`

- **作用**：启动所有应用的开发服务器
- **实际执行**：`turbo run dev`
- **效果**：
  - 启动前端开发服务器（通常在 http://localhost:5173）
  - 启动后端 API 服务器（通常在 http://localhost:8787）
  - 自动监听文件变化，实时热更新
- **使用场景**：日常开发时使用

#### `pnpm build`

- **作用**：构建所有应用和包的生产版本
- **实际执行**：`turbo run build`
- **效果**：
  - 编译 TypeScript 代码
  - 优化和压缩前端资源
  - 生成生产环境可部署的文件
- **使用场景**：部署前构建、CI/CD 流程中使用

#### `pnpm lint`

- **作用**：检查所有项目的代码质量
- **实际执行**：`turbo run lint`
- **效果**：
  - 运行 ESLint 检查代码规范
  - 发现潜在的代码问题和错误
  - 确保代码风格统一
- **使用场景**：提交代码前检查、CI/CD 流程

#### `pnpm check-types`

- **作用**：检查所有项目的 TypeScript 类型
- **实际执行**：`turbo run check-types`
- **效果**：
  - 运行 TypeScript 编译器检查类型错误
  - 验证类型定义的正确性
  - 确保类型安全
- **使用场景**：开发过程中验证类型、CI/CD 流程

#### `pnpm format`

- **作用**：格式化所有项目的代码
- **实际执行**：`prettier --write "**/*.{ts,tsx,md}"`
- **效果**：
  - 统一代码格式和风格
  - 自动修复可修复的格式问题
  - 保持代码整洁美观
- **使用场景**：提交代码前整理格式

#### `pnpm prepare`

- **作用**：初始化 Husky Git 钩子
- **实际执行**：`husky`
- **效果**：
  - 安装 Git 钩子
  - 设置提交前代码检查
  - 配置提交信息规范检查
- **使用场景**：项目初始化、新成员加入项目

### 特定项目命令

你也可以针对特定项目运行命令：

```bash
# 只启动前端开发服务器
pnpm dev --filter=web

# 只构建后端项目
pnpm build --filter=service

# 只检查 UI 组件库的类型
pnpm check-types --filter=@repo/ui
```

## 🔧 开发指南

### 添加新功能的步骤

1. 在相应的应用目录下创建新文件
2. 如果是共享功能，考虑放在 `packages/` 目录下
3. 运行 `pnpm lint` 检查代码质量
4. 运行 `pnpm check-types` 验证类型
5. 提交代码（会自动触发 pre-commit 检查）

### 代码提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复错误
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建工具或辅助工具的变动
```

### Git 钩子说明

项目配置了自动化的代码质量检查：

- **pre-commit**：提交前自动运行代码检查和格式化
- **commit-msg**：检查提交信息是否符合规范

详细说明请查看 [.husky/README.md](.husky/README.md)

## 🚢 部署说明

### 前端部署（Cloudflare Pages）

```bash
cd apps/web
pnpm deploy
```

### 后端部署（Cloudflare Workers）

```bash
cd apps/service
pnpm deploy
```

### 环境变量配置

部署前需要配置相应的环境变量，具体请查看各子项目的 README 文档。

## 🖼️ 图片上传功能

### 功能概述

系统提供了完整的图片上传功能，支持将本地图片自动上传到 Cloudflare R2 对象存储，并在博客内容中替换为在线图片链接。

### 环境变量配置

#### 后端服务 (apps/service)

在 `apps/service/wrangler.jsonc` 中配置以下环境变量：

```json
{
  "vars": {
    "ADMIN_API_KEY": "your-admin-api-key",
    "R2_PUBLIC_DOMAIN": "your-r2-public-domain.com"
  }
}
```

同时需要在 Cloudflare Workers 控制台中设置对应的生产环境变量。

#### CLI 工具 (apps/blog-library)

复制 `apps/blog-library/.env.example` 为 `.env` 并配置：

```bash
# CMS API 配置
CMS_BASE_URL=https://your-api-domain.com
ADMIN_API_KEY=your-admin-api-key

```

### 使用流程

#### 1. 编写博客内容

在 MDX 文件中正常使用本地图片路径：

```markdown
# 我的博客标题

![本地图片](./images/screenshot.png)

这里是博客内容...

![另一张图片](../assets/diagram.jpg)
```

#### 2. 上传图片到 R2

```bash
cd apps/blog-library
pnpm run imgUpload site1/zh-CN/my-blog-post.mdx
```

此命令会：

- 解析 MDX 文件中的本地图片引用
- 将本地图片上传到 Cloudflare R2
- 自动替换文件中的图片路径为 R2 URL

#### 3. 上传博客内容

```bash
cd apps/blog-library
pnpm run blogUpload site1/zh-CN/my-blog-post.mdx
```

**注意**：如果步骤 2 未执行，博客上传会失败并提示先处理本地图片。

### API 接口说明

#### 图片上传接口

- **URL**: `POST /image/upload`
- **认证**: Bearer Token (ADMIN_API_KEY)
- **Content-Type**: `multipart/form-data`

**请求参数**：

- `image`: 图片文件 (支持 jpg/jpeg/png/gif/webp)
- `siteId`: 站点ID
- `postSlug`: 文章slug

**响应示例**：

```json
{
  "success": true,
  "data": {
    "url": "https://r2-domain.com/site1/my-post/uuid.jpg",
    "path": "site1/my-post/uuid.jpg",
    "size": 102400,
    "contentType": "image/jpeg"
  }
}
```

### 命令说明

#### `pnpm run imgUpload <filepath>`

- **作用**: 上传指定 MDX 文件中的本地图片到 R2
- **示例**: `pnpm run imgUpload site1/zh-CN/first-blog.mdx`

#### `pnpm run blogUpload <filepath>`

- **作用**: 上传博客内容到 CMS
- **前置条件**: 必须先运行 `imgUpload` 处理本地图片
- **示例**: `pnpm run blogUpload site1/zh-CN/first-blog.mdx`

## 📚 学习资源

### 推荐阅读

- [Turborepo 官方文档](https://turbo.build/repo/docs)
- [React 19 新特性](https://react.dev/blog/2024/04/25/react-19)
- [Hono 官方文档](https://hono.dev/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

### 常见问题

1. **Q: 为什么使用 pnpm 而不是 npm？**
   A: pnpm 提供更快的安装速度、更少的磁盘空间占用和更严格的依赖管理。

2. **Q: 如何添加新的共享包？**
   A: 在 `packages/` 目录下创建新文件夹，参考现有包的结构配置 `package.json`。

3. **Q: 如何解决类型错误？**
   A: 运行 `pnpm check-types` 查看具体错误，然后根据 TypeScript 提示修复。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
