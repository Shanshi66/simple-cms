# Service 后端 API

这是基于 Hono 框架构建的现代化后端 API 服务，部署在 Cloudflare Workers 上，提供高性能的边缘计算能力和全球分布式访问。

## 📋 服务概述

### 主要功能

- 🔐 **身份认证**：基于 Better Auth 的完整用户认证系统
- 🗄️ **数据库管理**：使用 Drizzle ORM 和 SQLite 数据库
- 🚀 **边缘计算**：部署在 Cloudflare Workers，全球低延迟访问
- 🛡️ **CORS 支持**：跨域资源共享，支持前端应用调用
- 🔄 **热重载**：开发环境支持实时代码更新

### 技术特色

- **Hono**：轻量级、快速的 Web 框架，专为边缘环境优化
- **Better Auth**：现代化的身份认证解决方案，支持多种登录方式
- **Drizzle ORM**：类型安全的数据库 ORM，支持迁移和查询构建
- **TypeScript**：全面的类型安全保障
- **Cloudflare Workers**：无服务器架构，按需扩展

## 📁 项目结构详解

```
apps/service/
├── src/                           # 源代码目录
│   ├── db/                       # 数据库相关
│   │   ├── index.ts             # 数据库连接和配置
│   │   ├── migrations/          # 数据库迁移文件
│   │   │   ├── 0000_careless_darkhawk.sql # 初始迁移SQL
│   │   │   └── meta/            # 迁移元数据
│   │   │       ├── 0000_snapshot.json   # 数据库快照
│   │   │       └── _journal.json        # 迁移日志
│   │   └── schema/              # 数据库模式定义
│   │       ├── auth.ts         # 认证相关表结构
│   │       └── index.ts        # 模式导出入口
│   ├── lib/                     # 工具库
│   │   ├── auth.ts             # Better Auth 配置
│   │   └── index.ts            # 工具函数导出
│   ├── routes/                 # API 路由
│   │   └── auth.ts             # 认证相关路由
│   ├── types/                  # 类型定义
│   │   └── bindings.ts         # Cloudflare 绑定类型
│   └── index.ts                # 应用入口文件
├── drizzle.config.ts           # Drizzle ORM 配置
├── package.json                # 项目依赖和脚本
├── tsconfig.json              # TypeScript 配置
└── wrangler.jsonc             # Cloudflare Workers 配置
```

## 🚀 开发指南

### package.json 命令详解

#### 核心开发命令

**`pnpm dev`**

- **作用**：启动开发服务器
- **实际执行**：`wrangler dev`
- **访问地址**：http://localhost:8787
- **特性**：
  - 实时热重载
  - 本地 D1 数据库模拟
  - 完整的 Cloudflare Workers 环境模拟
  - 自动重启服务

**`pnpm build`**

- **作用**：构建和测试部署包
- **实际执行**：`tsc && wrangler deploy --dry-run`
- **功能**：
  - TypeScript 编译检查
  - 部署包构建验证
  - 资源大小分析
  - 部署前置检查

**`pnpm deploy`**

- **作用**：部署到 Cloudflare Workers
- **实际执行**：`wrangler deploy --minify`
- **效果**：
  - 代码压缩优化
  - 上传到 Cloudflare 边缘网络
  - 自动更新线上服务
  - 生成部署 URL

#### 类型和质量命令

**`pnpm cf-typegen`**

- **作用**：生成 Cloudflare 绑定类型
- **实际执行**：`wrangler types --env-interface CloudflareBindings`
- **输出文件**：更新 `src/types/bindings.ts`
- **用途**：确保环境变量和绑定的类型安全

**`pnpm check-types`**

- **作用**：TypeScript 类型检查
- **实际执行**：`tsc --noEmit`
- **检查内容**：类型定义正确性、接口匹配

**`pnpm lint`**

- **作用**：ESLint 代码质量检查
- **检查内容**：代码规范、潜在问题、最佳实践

**`pnpm format`**

- **作用**：Prettier 代码格式化
- **格式化范围**：TypeScript、JSON、Markdown 文件

#### 数据库管理命令

**`pnpm db:generate`**

- **作用**：生成数据库迁移文件
- **实际执行**：`drizzle-kit generate`
- **使用场景**：修改数据库 schema 后生成迁移
- **输出**：在 `src/db/migrations/` 目录下生成 SQL 文件

**`pnpm db:migrate`**

- **作用**：执行数据库迁移
- **实际执行**：`drizzle-kit migrate`
- **功能**：将 schema 变更应用到实际数据库
- **环境**：支持本地开发和生产环境

### 开发工作流程

#### 1. 启动开发环境

```bash
# 在项目根目录
pnpm dev --filter=service

# 或者在 apps/service 目录下
cd apps/service
pnpm dev
```

#### 2. 添加新的 API 路由

```bash
# 创建新的路由文件
touch src/routes/users.ts
```

路由文件示例：

```typescript
import { Hono } from "hono";
import type { CFBindings } from "@/types/bindings";

const users = new Hono<{ Bindings: CFBindings }>();

// GET /api/users
users.get("/", async (c) => {
  const db = createDb(c.env.DB);

  const userList = await db.select().from(user);

  return c.json({
    success: true,
    data: userList,
  });
});

// POST /api/users
users.post("/", async (c) => {
  const body = await c.req.json();
  const db = createDb(c.env.DB);

  const newUser = await db.insert(user).values(body).returning();

  return c.json({
    success: true,
    data: newUser[0],
  });
});

export default users;
```

然后在主应用中注册路由：

```typescript
// src/index.ts
import users from "./routes/users";

app.route("/api/users", users);
```

#### 3. 修改数据库 Schema

```typescript
// src/db/schema/users.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const profile = sqliteTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});
```

生成和应用迁移：

```bash
# 1. 生成迁移文件
pnpm db:generate

# 2. 应用迁移（开发环境）
pnpm db:migrate
```

#### 4. 添加身份认证中间件

```typescript
// src/routes/protected.ts
import { createAuth } from "@/lib/auth";

const protected = new Hono<{ Bindings: CFBindings }>();

// 认证中间件
protected.use("/*", async (c, next) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("session", session);
  await next();
});

// 受保护的路由
protected.get("/profile", async (c) => {
  const session = c.get("session");
  return c.json({ user: session.user });
});

export default protected;
```

## 🔧 配置文件说明

### 1. `drizzle.config.ts`

Drizzle ORM 配置文件：

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // 迁移文件输出目录
  out: "./src/db/migrations",
  // Schema 文件位置
  schema: "./src/db/schema/index.ts",
  // 数据库方言
  dialect: "sqlite",
  // 驱动类型
  driver: "d1-http",
  // D1 数据库连接配置
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
```

### 2. `wrangler.jsonc`

Cloudflare Workers 部署配置：

```json
{
  "name": "your-api-service",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  "vars": {
    "NODE_ENV": "production"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-database",
      "database_id": "your-database-id"
    }
  ]
}
```

### 3. `src/types/bindings.ts`

Cloudflare 环境绑定类型：

```typescript
export interface CFBindings {
  // D1 数据库绑定
  DB: D1Database;

  // 环境变量
  NODE_ENV: string;
  BETTER_AUTH_SECRET: string;
  BASE_URL: string;
  CLIENT_URL: string;

  // KV 存储（如需要）
  CACHE: KVNamespace;

  // R2 存储（如需要）
  BUCKET: R2Bucket;
}
```

## 🗄️ 数据库管理

### Schema 设计

项目使用 Drizzle ORM 管理数据库结构：

```typescript
// src/db/schema/auth.ts
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});
```

### 数据库操作示例

```typescript
import { createDb } from "@/db";
import { user } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

// 获取数据库实例
const db = createDb(c.env.DB);

// 查询操作
const users = await db.select().from(user);
const specificUser = await db.select().from(user).where(eq(user.id, userId));

// 插入操作
const newUser = await db
  .insert(user)
  .values({
    id: generateId(),
    name: "John Doe",
    email: "john@example.com",
    emailVerified: false,
  })
  .returning();

// 更新操作
await db.update(user).set({ emailVerified: true }).where(eq(user.id, userId));

// 删除操作
await db.delete(user).where(eq(user.id, userId));
```

### 数据库迁移流程

```bash
# 1. 修改 Schema 文件
vim src/db/schema/auth.ts

# 2. 生成迁移文件
pnpm db:generate

# 3. 查看生成的迁移
cat src/db/migrations/0001_*.sql

# 4. 应用迁移到开发环境
pnpm db:migrate

# 5. 应用迁移到生产环境
wrangler d1 migrations apply your-database --remote
```

## 🔐 身份认证系统

### Better Auth 配置

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const createAuth = (binding: CFBindings) => {
  const db = drizzle(binding.DB, { schema, casing: "snake_case" });

  return betterAuth({
    // 密钥配置
    secret: binding.BETTER_AUTH_SECRET,
    baseURL: binding.BASE_URL,

    // 数据库适配器
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),

    // 信任的来源
    trustedOrigins: [binding.BASE_URL, binding.CLIENT_URL],

    // 会话配置
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60, // 1小时缓存
      },
      expiresIn: 60 * 60 * 24 * 7, // 7天有效期
      updateAge: 60 * 60 * 24, // 1天更新一次
    },

    // 邮箱密码登录
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },

    // 邮箱验证
    emailVerification: {
      autoSignInAfterVerification: true,
    },
  });
};
```

### API 路由集成

```typescript
// src/routes/auth.ts
import { createAuth } from "@/lib/auth";

const auth = new Hono<{ Bindings: CFBindings }>();

// 处理所有认证相关请求
auth.on(["POST", "GET"], "/*", async (c) => {
  const authInstance = createAuth(c.env);
  return authInstance.handler(c.req.raw);
});

export default auth;
```

## 🌐 CORS 配置

项目已配置 CORS 支持前端跨域访问：

```typescript
// src/index.ts
import { cors } from "hono/cors";

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => c.env.CLIENT_URL,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);
```

## 🚢 部署说明

### 环境变量配置

#### 开发环境 (`.env`)

```env
# Cloudflare 配置
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-database-id
CLOUDFLARE_D1_TOKEN=your-d1-token

# 应用配置
BETTER_AUTH_SECRET=your-secret-key
BASE_URL=http://localhost:8787
CLIENT_URL=http://localhost:5173
```

#### 生产环境 (Cloudflare Dashboard)

在 Cloudflare Workers 设置中配置：

- `BETTER_AUTH_SECRET`: 随机生成的密钥
- `BASE_URL`: https://your-api-domain.com
- `CLIENT_URL`: https://your-frontend-domain.com

### 部署步骤

1. **创建 D1 数据库**：

```bash
wrangler d1 create your-database-name
```

2. **运行迁移**：

```bash
wrangler d1 migrations apply your-database-name --remote
```

3. **部署服务**：

```bash
pnpm deploy
```

4. **验证部署**：

```bash
curl https://your-api-domain.com/api/auth/session
```

### 监控和日志

```bash
# 查看实时日志
wrangler tail

# 查看部署状态
wrangler deployments list

# 查看分析数据
wrangler analytics
```

## ❓ 常见问题

### 1. 开发服务器启动失败？

```bash
# 检查 wrangler 版本
wrangler --version

# 重新登录 Cloudflare
wrangler auth login

# 清理缓存
rm -rf .wrangler
pnpm dev
```

### 2. 数据库迁移失败？

```bash
# 检查数据库连接
wrangler d1 info your-database-name

# 重置本地数据库
rm -rf .wrangler/state
pnpm db:migrate
```

### 3. 类型错误？

```bash
# 重新生成 Cloudflare 类型
pnpm cf-typegen

# 检查类型定义
pnpm check-types
```

### 4. CORS 问题？

检查 `CLIENT_URL` 环境变量是否正确设置，确保与前端域名匹配。

### 5. 身份认证不工作？

```bash
# 检查密钥配置
echo $BETTER_AUTH_SECRET

# 验证数据库表结构
wrangler d1 execute your-database-name --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## 📚 学习资源

- [Hono 官方文档](https://hono.dev/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Better Auth 文档](https://www.better-auth.com/)
- [Cloudflare D1 数据库](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

## 🔗 相关链接

- [前端应用文档](../web/README.md)
- [UI 组件库](../../packages/ui/README.md)
- [项目根目录](../../README.md)
