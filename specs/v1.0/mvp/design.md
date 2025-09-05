# 多网站多语言博客CMS系统 - 架构设计文档

## 1. 系统概述

### 1.1 架构原则

- **极简设计**: 严格按照PRD需求，避免过度设计
- **单一职责**: 专注多网站多语言博客内容管理和分发
- **无服务器**: 基于Cloudflare生态，零运维成本
- **API优先**: 纯后端服务，通过RESTful API提供数据

### 1.2 技术栈选择

**后端服务**:

- **框架**: Hono.js - 轻量级Web框架，完美适配Cloudflare Workers
- **运行时**: Cloudflare Workers - 全球边缘计算，低延迟
- **数据库**: Cloudflare D1 (SQLite) - 无服务器SQL数据库
- **ORM**: Drizzle ORM - TypeScript优先，性能优异

**开发工具**:

- **包管理**: pnpm - 高效的monorepo包管理
- **构建工具**: Wrangler - Cloudflare官方部署工具
- **类型检查**: TypeScript - 完整类型安全

## 2. 数据库设计

### 2.1 表结构设计

**sites表** - 网站管理

```sql
CREATE TABLE sites (
  id TEXT PRIMARY KEY,                    -- UUID主键
  name TEXT NOT NULL,                     -- 网站名称
  description TEXT,                       -- 网站描述
  created_at INTEGER NOT NULL,            -- 创建时间戳
  updated_at INTEGER NOT NULL             -- 更新时间戳
);
```

**api_keys表** - API访问控制

```sql
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,                    -- UUID主键
  site_id TEXT NOT NULL REFERENCES sites(id),  -- 所属网站
  key_hash TEXT NOT NULL UNIQUE,          -- API密钥哈希值
  name TEXT NOT NULL,                     -- 密钥名称
  expires_at INTEGER,                     -- 过期时间(可选)
  created_at INTEGER NOT NULL,            -- 创建时间戳
  updated_at INTEGER NOT NULL             -- 更新时间戳
);
```

**articles_metadata表** - 文章元数据(列表页查询)

```sql
CREATE TABLE articles_metadata (
  id TEXT PRIMARY KEY,                    -- UUID主键
  site_id TEXT NOT NULL REFERENCES sites(id),  -- 所属网站
  language TEXT NOT NULL,                 -- 语言代码 (en, zh, ja)
  slug TEXT NOT NULL,                     -- 文章URL标识符
  title TEXT NOT NULL,                    -- 文章标题
  excerpt TEXT NOT NULL,                  -- 文章摘要
  date TEXT NOT NULL,                     -- 发布日期 (YYYY-MM-DD)
  status TEXT NOT NULL DEFAULT 'draft',   -- 文章状态 ('draft':草稿, 'published':已发布)
  created_at INTEGER NOT NULL,            -- 创建时间戳
  updated_at INTEGER NOT NULL,            -- 更新时间戳

  UNIQUE(site_id, language, slug)         -- 确保同一站点同一语言下slug唯一
);
```

**articles_content表** - 文章完整内容(详情页查询)

```sql
CREATE TABLE articles_content (
  article_id TEXT PRIMARY KEY REFERENCES articles_metadata(id) ON DELETE CASCADE,
  content TEXT NOT NULL,                  -- MDX完整内容
  updated_at INTEGER NOT NULL             -- 更新时间戳
);
```

### 2.2 索引设计

```sql
-- 文章列表查询索引：按网站、语言、状态查询
CREATE INDEX idx_metadata_site_lang_status ON articles_metadata(site_id, language, status, date DESC);

-- 文章列表查询索引：按网站、状态查询(支持所有语言)
CREATE INDEX idx_metadata_site_status ON articles_metadata(site_id, status, date DESC);

-- 单篇文章元数据查询索引
CREATE INDEX idx_metadata_detail ON articles_metadata(site_id, language, slug);
```

### 2.3 数据示例

**sites表示例**:

```json
{
  "id": "site_01234567-89ab-cdef-0123-456789abcdef",
  "name": "个人博客",
  "description": "我的个人技术博客网站",
  "created_at": 1725264000000,
  "updated_at": 1725264000000
}
```

**articles_metadata表示例**:

```json
{
  "id": "01234567-89ab-cdef-0123-456789abcdef",
  "site_id": "site_01234567-89ab-cdef-0123-456789abcdef",
  "language": "zh",
  "slug": "my-first-post",
  "title": "我的第一篇博客",
  "excerpt": "这是我的第一篇技术博客，记录学习心得...",
  "date": "2025-09-02",
  "status": "published",
  "created_at": 1725264000000,
  "updated_at": 1725264000000
}
```

**articles_content表示例**:

```json
{
  "article_id": "01234567-89ab-cdef-0123-456789abcdef",
  "content": "---\ntitle: 我的第一篇博客\nslug: my-first-post\ndate: 2025-09-02\nlanguage: zh\nexcerpt: 这是我的第一篇技术博客，记录学习心得...\n---\n\n# 博客正文内容\n\n这里是博客的具体内容...",
  "updated_at": 1725264000000
}
```

## 3. API接口设计

### 3.1 接口规范

**基础URL**: `https://your-api.your-domain.workers.dev`

**响应格式**: JSON  
**认证方式**: API Key (Header: `Authorization: Bearer {api_key}`)  
**错误处理**: 标准HTTP状态码 + JSON错误信息

### 3.2 核心接口

#### 3.2.1 获取文章列表(仅元数据)

```http
GET /api/sites/{site}/articles?lang={language}&status={status}&page={page}&limit={limit}
Authorization: Bearer {api_key}
```

**路径参数**:

- `site` (必填): 网站标识，如 `personal-blog`

**查询参数**:

- `lang` (可选): 语言代码，如 `zh`, `en`, `ja`，不传则返回所有语言
- `status` (可选): 文章状态，`draft`=草稿，`published`=已发布，不传=返回所有状态
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认20，最大100

**响应示例**:

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "01234567-89ab-cdef-0123-456789abcdef",
        "site_id": "site_01234567-89ab-cdef-0123-456789abcdef",
        "language": "zh",
        "slug": "my-first-post",
        "title": "我的第一篇博客",
        "excerpt": "这是我的第一篇技术博客，记录学习心得...",
        "date": "2025-09-02",
        "status": "published",
        "created_at": "2025-09-02T08:00:00.000Z",
        "updated_at": "2025-09-02T08:00:00.000Z"
      },
      {
        "id": "01234567-89ab-cdef-0123-456789abcdef",
        "site_id": "site_01234567-89ab-cdef-0123-456789abcdef",
        "language": "en",
        "slug": "my-first-post",
        "title": "My First Blog Post",
        "excerpt": "This is my first technical blog post...",
        "date": "2025-09-02",
        "status": "draft",
        "created_at": "2025-09-02T08:00:00.000Z",
        "updated_at": "2025-09-02T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    }
  }
}
```

#### 3.2.2 获取单篇文章详情(包含完整内容)

```http
GET /api/sites/{site}/articles/{language}/{slug}
Authorization: Bearer {api_key}
```

**路径参数**:

- `site`: 网站标识
- `language`: 语言代码
- `slug`: 文章标识符

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "01234567-89ab-cdef-0123-456789abcdef",
    "site_id": "site_01234567-89ab-cdef-0123-456789abcdef",
    "language": "zh",
    "slug": "my-first-post",
    "title": "我的第一篇博客",
    "excerpt": "这是我的第一篇技术博客，记录学习心得...",
    "content": "---\ntitle: 我的第一篇博客\nslug: my-first-post\ndate: 2025-09-02\nlanguage: zh\nexcerpt: 这是我的第一篇技术博客，记录学习心得...\n---\n\n# 博客正文内容\n\n这里是博客的具体内容...",
    "date": "2025-09-02",
    "status": "published",
    "created_at": "2025-09-02T08:00:00.000Z",
    "updated_at": "2025-09-02T08:00:00.000Z"
  }
}
```

#### 3.2.3 创建文章

```http
POST /api/sites/{site}/articles
Authorization: Bearer {api_key}
Content-Type: application/json
```

**路径参数**:

- `site` (必填): 网站标识

**请求体**:

```json
{
  "language": "zh",
  "slug": "my-first-post",
  "title": "我的第一篇博客",
  "excerpt": "这是我的第一篇技术博客，记录学习心得...",
  "date": "2025-09-02",
  "status": "draft",
  "content": "# 博客正文内容\n\n这里是博客的具体内容，支持完整的MDX语法。\n\n## 章节标题\n\n可以包含代码块、图片、链接等。"
}
```

**字段说明**:

- `language` (必填): 语言代码
- `slug` (必填): 文章URL标识符
- `title` (必填): 文章标题
- `excerpt` (必填): 文章摘要
- `date` (必填): 发布日期，格式：YYYY-MM-DD
- `status` (可选): 文章状态，`draft`=草稿，`published`=已发布，默认`draft`
- `content` (必填): 文章正文内容（Markdown格式）

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "01234567-89ab-cdef-0123-456789abcdef",
    "message": "文章创建成功",
    "article": {
      "id": "01234567-89ab-cdef-0123-456789abcdef",
      "site_id": "site_01234567-89ab-cdef-0123-456789abcdef",
      "language": "zh",
      "slug": "my-first-post",
      "title": "我的第一篇博客",
      "excerpt": "这是我的第一篇技术博客，记录学习心得...",
      "date": "2025-09-02",
      "status": "draft",
      "created_at": "2025-09-02T08:00:00.000Z",
      "updated_at": "2025-09-02T08:00:00.000Z"
    }
  }
}
```

### 3.3 错误响应格式

```json
{
  "success": false,
  "error": {
    "message": "文章不存在",
    "code": "ARTICLE_NOT_FOUND"
  }
}
```

**字段说明**:

- `message` (必填): 错误描述信息
- `code` (可选): 错误代码，便于程序化处理

**常见错误码**:

- `UNAUTHORIZED`: API Key无效或缺失
- `FORBIDDEN`: API Key没有访问此网站的权限
- `INVALID_PARAMETERS`: 请求参数无效
- `ARTICLE_NOT_FOUND`: 文章不存在
- `ARTICLE_EXISTS`: 文章已存在(创建时)
- `SITE_NOT_FOUND`: 网站不存在
- `DATABASE_ERROR`: 数据库操作错误
- `INTERNAL_ERROR`: 服务器内部错误

## 4. 项目目录结构

### 4.1 整体结构

```
simple-cms/
├── apps/
│   └── service/                    # Hono API后端服务
│       ├── src/
│       │   ├── routes/            # API路由定义
│       │   │   └── articles.ts    # 文章相关路由
│       │   ├── db/               # 数据库相关
│       │   │   ├── schema/       # 数据表定义
│       │   │   │   ├── sites.ts
│       │   │   │   ├── api-keys.ts
│       │   │   │   ├── articles.ts
│       │   │   │   └── index.ts
│       │   │   └── index.ts      # 数据库连接
│       │   ├── lib/              # 工具库
│       │   │   └── utils.ts      # 通用工具
│       │   ├── types/            # TypeScript类型定义
│       │   │   └── api.ts
│       │   └── index.ts          # 应用入口
│       ├── package.json
│       ├── wrangler.toml         # Cloudflare Workers配置
│       └── drizzle.config.ts     # Drizzle ORM配置
├── content/                       # 本地MDX文件存储
│   ├── personal-blog/            # 个人博客网站
│   │   ├── en/                   # 英文博客
│   │   │   ├── tech-post-1.mdx
│   │   │   └── life-story.mdx
│   │   ├── zh/                   # 中文博客
│   │   │   ├── my-first-post.mdx
│   │   │   └── daily-notes.mdx
│   │   └── ja/                   # 日文博客
│   │       └── hello-world.mdx
│   ├── work-portfolio/           # 工作作品集网站
│   │   ├── en/
│   │   │   └── project-intro.mdx
│   │   └── zh/
│   │       └── project-intro.mdx
│   └── documentation/            # 技术文档网站
│       ├── en/
│       │   └── api-guide.mdx
│       └── zh/
│           └── api-guide.mdx
├── scripts/                      # 本地工具脚本
│   ├── upload.ts                # MDX解析、验证和发布脚本
│   └── validate.ts              # 独立的MDX格式验证脚本
├── packages/                    # 共享包
│   ├── types/                   # 共享TypeScript类型
│   │   └── src/
│   │       └── api.ts           # API响应类型定义
│   └── mdx-utils/               # MDX处理工具包（本地使用）
│       ├── src/
│       │   ├── parser.ts        # MDX解析（frontmatter + content）
│       │   ├── validator.ts     # 本地MDX格式验证
│       │   └── types.ts         # MDX相关类型定义
│       └── package.json
└── docs/                        # 文档目录
    ├── architecture.md          # 架构文档(本文件)
    └── v1.0.0/
        └── prd.md              # 产品需求文档
```

### 4.2 服务端应用结构

**apps/service/src/routes/articles.ts** - 文章路由

```typescript
import { Hono } from "hono";
import { articlesService } from "../services/articles";

const router = new Hono();

// GET /api/sites/{site}/articles?lang={lang}&status={status}
router.get("/sites/:site/articles", articlesService.getArticlesList);

// GET /api/sites/{site}/articles/{lang}/{slug}
router.get(
  "/sites/:site/articles/:lang/:slug",
  articlesService.getArticleDetail,
);

// POST /api/sites/{site}/articles
router.post("/sites/:site/articles", articlesService.createArticle);

export default router;
```

## 5. MDX文件格式规范

### 5.1 标准格式

```markdown
---
title: 文章标题
slug: article-slug
date: 2025-09-02
language: zh
---

# 文章正文标题

这里是文章的正文内容，支持完整的MDX语法。

## 章节标题

可以包含：

- 代码块
- 图片
- 链接
- 列表等markdown元素
```

### 5.2 Frontmatter字段说明

| 字段     | 类型   | 必填 | 说明                                 |
| -------- | ------ | ---- | ------------------------------------ |
| title    | string | 是   | 文章标题                             |
| slug     | string | 是   | URL标识符，同一网站同一语言下唯一    |
| date     | string | 是   | 发布日期，格式：YYYY-MM-DD           |
| language | string | 是   | 语言代码：en、zh、ja等               |
| excerpt  | string | 是   | 文章摘要，用于列表页显示             |
| status   | string | 否   | 文章状态，draft/published，默认draft |

### 5.3 内容规范

- **编码**: 使用UTF-8编码
- **换行**: 使用LF(\n)换行符
- **图片**: 支持相对路径和绝对URL
- **代码块**: 支持语法高亮标记
- **链接**: 支持内部链接和外部链接

## 6. 本地开发工具

### 6.1 单文件上传脚本设计

**1.0.0版本特性**: 专注于单篇文章上传，集成MDX格式检验

**工作流程**:

1. **读取MDX文件**: 读取本地MDX文件内容
2. **MDX格式检验**: 自动验证MDX文件格式和必填字段
3. **解析Frontmatter**: 提取title、slug、date、language、excerpt、status等元数据
4. **提取正文**: 获取frontmatter之后的markdown内容
5. **数据验证**: 验证业务逻辑和数据完整性
6. **API请求**: 组装JSON数据发送到API创建文章

**scripts/upload.ts** - 单文件发布（含格式检验）

```bash
# 解析、验证并发布指定MDX文件（状态由frontmatter中的status字段决定）
pnpm upload content/personal-blog/zh/my-post.mdx
```

**设计原则**：

- **单一数据源**：文章状态完全由MDX文件frontmatter中的`status`字段控制
- **自动验证**：上传前自动进行MDX格式检验，验证失败则阻止上传
- **职责分离**：上传专注于发布，验证使用专门的`validate`命令

### 6.2 MDX格式检验详细说明

**检验规则**:

1. **文件格式检验**:

   - 文件必须以 `.mdx` 扩展名结尾
   - 文件编码必须为 UTF-8
   - 换行符必须为 LF (\n)

2. **Frontmatter检验**:

   - 必须以 `---` 开始和结束
   - 必填字段：`title`, `slug`, `date`, `language`, `excerpt`
   - `date` 格式必须为 `YYYY-MM-DD`
   - `language` 必须为有效的语言代码（en, zh, ja等）
   - `status` 如果提供，必须为 `draft` 或 `published`
   - `slug` 必须符合URL规范（只含字母、数字、连字符）

3. **内容检验**:
   - Frontmatter之后必须有正文内容
   - 正文长度必须大于0
   - 支持标准Markdown语法检验

**scripts/validate.ts** - 独立MDX格式验证

```bash
# 验证单个文件
pnpm validate content/personal-blog/zh/my-post.mdx

# 验证指定目录下所有文件
pnpm validate content/personal-blog/

# 详细验证报告
pnpm validate content/personal-blog/zh/my-post.mdx --verbose
```

**验证与上传的关系**:

- `upload.ts` 脚本会自动调用验证逻辑作为上传前置条件
- 验证失败时会阻止上传并显示详细错误信息
- 独立验证使用 `validate.ts` 脚本，支持单文件和目录验证

### 6.3 1.0.0版本完整使用示例

**场景**：创建并发布一篇中文博客文章

```bash
# 1. 创建MDX文件：content/personal-blog/zh/my-first-post.mdx
# 内容示例：
---
title: 我的第一篇博客
slug: my-first-post
date: 2025-09-03
language: zh
excerpt: 这是我的第一篇技术博客文章
status: draft
---

# 我的第一篇博客

这里是博客的正文内容...

# 2. （可选）独立验证文件格式
pnpm validate content/personal-blog/zh/my-first-post.mdx

# 3. 上传文章（自动验证+发布，状态为draft）
pnpm upload content/personal-blog/zh/my-first-post.mdx

# 4. 要发布为正式文章，修改MDX文件中的status为published，然后重新上传
# 修改frontmatter：status: published
pnpm upload content/personal-blog/zh/my-first-post.mdx
```

**工作流程说明**：

1. **内容创建**：在MDX文件的frontmatter中设置所有必要字段
2. **状态控制**：通过`status`字段控制文章是草稿还是发布状态
3. **自动验证**：上传时自动验证，无需额外参数
4. **简化命令**：一个命令完成验证和上传

## 7. 部署架构

### 7.1 Cloudflare Workers配置

**wrangler.toml**:

```toml
name = "simple-cms-api"
main = "src/index.ts"
compatibility_date = "2024-09-02"

[[d1_databases]]
binding = "DB"
database_name = "simple-cms"
database_id = "your-database-id"

[env.production]
name = "simple-cms-api-prod"
```

### 7.2 环境变量

| 变量名                 | 说明             | 示例        |
| ---------------------- | ---------------- | ----------- |
| CLOUDFLARE_ACCOUNT_ID  | Cloudflare账户ID | abc123...   |
| CLOUDFLARE_DATABASE_ID | D1数据库ID       | def456...   |
| CLOUDFLARE_API_TOKEN   | API令牌          | token123... |

### 7.3 部署命令

```bash
# 开发环境部署
pnpm --filter=service deploy:dev

# 生产环境部署
pnpm --filter=service deploy:prod

# 数据库迁移
pnpm --filter=service db:migrate
```

## 8. 基本性能考虑

- **索引设计**: 为主要查询创建必要的数据库索引
- **分页支持**: 文章列表支持分页，避免大量数据传输
- **Cloudflare优势**: 利用全球CDN和边缘计算提升访问速度
- **简单备份**: 使用Cloudflare D1的内置备份功能

## 9. 日志记录

- **基础日志**: Cloudflare Workers 自带的请求日志
- **错误日志**: 捕获和记录 API 异常
- **简单监控**: 通过 Cloudflare Dashboard 查看基本指标

## 10. 扩展规划

### 10.1 可选功能

如未来有需求，可考虑添加：

- 文章搜索功能
- 标签分类系统
- 评论系统集成
- RSS订阅支持
- 静态站点生成

### 10.2 API版本管理

- 版本化API路径：`/v1/api/articles`
- 向后兼容策略
- 废弃功能逐步迁移

---

## 总结

本架构严格按照PRD v1.0.0需求设计，采用性能优化的多表方案：

### 核心功能

1. **多表数据存储** - 元数据表和内容表分离，优化查询性能
2. **API Key权限控制** - 基于网站的访问权限管理
3. **三个核心API** - 文章列表(仅元数据)、详情(完整内容)、上传
4. **草稿发布功能** - 支持草稿状态和发布状态管理
5. **标准化MDX格式** - 统一的内容格式规范，支持摘要字段
6. **无服务器部署** - 零运维成本
7. **灵活的查询支持** - 支持单语言/多语言、单状态/多状态查询

### 1.0.0版本特性

8. **单文件上传机制** - 专注单篇文章上传，简化工作流程
9. **集成MDX格式检验** - 上传前自动验证文件格式和内容完整性
10. **详细验证规则** - 文件格式、Frontmatter字段、内容完整性全面检查
11. **错误提示优化** - 验证失败时提供详细的错误信息和修复建议

### 性能优势

- **列表页查询**: 只加载元数据，避免大文件传输
- **详情页查询**: JOIN查询获取完整内容
- **权限隔离**: 不同网站独立的API Key管理
- **发布控制**: 支持草稿和发布状态的灵活管理
- **索引优化**: 针对不同查询场景设计专用索引

### 控制台支持

- **多语言查询**: `lang`参数可选，支持获取所有语言文章
- **多状态查询**: `status`参数不传时获取所有状态文章
- **灵活筛选**: 支持按语言、状态、时间等维度筛选
- **完整元数据**: 返回创建时间、更新时间等管理信息

该架构能够完全满足多网站多语言博客内容管理和分发需求，同时支持控制台管理场景，具备出色的性能表现和扩展能力。
