# 概览

## 目标

开发一个简单的 Headless CMS 前端博客库系统，用来管理多个网站的博客内容。该系统将提供本地内容管理、图片上传和博客发布功能，通过脚本与已有的后端 API 服务进行交互。

## 技术栈

- **运行时**: Node.js (>=18)
- **语言**: TypeScript
- **包管理**: pnpm@10.15.0
- **MDX 处理**: @mdx-js/mdx, gray-matter
- **文件操作**: fs-extra
- **HTTP 客户端**: node-fetch 或 axios
- **图片上传**: @aws-sdk/client-s3 (用于 Cloudflare R2)
- **命令行工具**: commander.js
- **验证**: zod
- **配置管理**: dotenv

# 后端

## 数据库

### 表结构

后端数据库已存在以下表结构：

**sites 表**

- id (text, primary key) - 站点 ID
- name (text, not null) - 站点名称
- description (text) - 站点描述
- createdAt (timestamp) - 创建时间
- updatedAt (timestamp) - 更新时间

**apiKeys 表**

- id (text, primary key) - API Key ID
- siteId (text, foreign key) - 关联站点 ID
- keyHash (text, unique) - API Key 哈希值
- name (text) - API Key 名称
- expiresAt (timestamp) - 过期时间
- createdAt (timestamp) - 创建时间
- updatedAt (timestamp) - 更新时间

**articlesMetadata 表**

- id (text, primary key) - 文章 ID
- siteId (text, foreign key) - 关联站点 ID
- language (enum: 'en', 'zh-CN') - 语言
- slug (text) - URL 路径标识符
- title (text) - 标题
- excerpt (text) - 摘要
- date (text, YYYY-MM-DD 格式) - 发布日期
- status (enum: 'draft', 'published') - 状态
- createdAt (timestamp) - 创建时间
- updatedAt (timestamp) - 更新时间
- 唯一索引: (siteId, language, slug)

**articlesContent 表**

- articleId (text, primary key, foreign key) - 文章 ID
- content (text) - 文章内容
- updatedAt (timestamp) - 更新时间

### 数据示例

```json
{
  "language": "zh-CN",
  "slug": "first-blog",
  "title": "我的第一篇博客",
  "excerpt": "这是一篇关于技术的博客文章",
  "date": "2024-01-15",
  "status": "published",
  "content": "# 标题\n\n这是文章内容..."
}
```

## API 接口

### 创建文章接口

**URL**: `POST /sites/{site}/articles`

**Headers**:

- `Authorization: Bearer {api_key}`
- `Content-Type: application/json`

**路径参数**:

- `site` (string): 站点 ID

**Body参数**:

```json
{
  "language": "en | zh-CN",
  "slug": "string (小写字母、数字、连字符)",
  "title": "string (必填)",
  "excerpt": "string (必填)",
  "date": "string (YYYY-MM-DD 格式)",
  "status": "draft | published (默认: draft)",
  "content": "string (必填)"
}
```

**Request Example**:

```json
{
  "language": "zh-CN",
  "slug": "first-blog",
  "title": "我的第一篇博客",
  "excerpt": "这是一篇关于技术的博客文章",
  "date": "2024-01-15",
  "status": "published",
  "content": "# 我的第一篇博客\n\n这是文章内容..."
}
```

**Response Example**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "message": "Article created successfully"
  }
}
```

## Error Handling

API 使用统一的错误代码系统：

- `INVALID_INPUT` - 输入参数无效
- `INVALID_API_KEY` - API Key 无效
- `INSUFFICIENT_PERMISSIONS` - 权限不足
- `VALIDATION_ERROR` - 数据验证错误
- `ARTICLE_EXISTS` - 文章已存在（相同 slug）
- `SITE_NOT_FOUND` - 站点未找到
- `DATABASE_ERROR` - 数据库错误
- `INTERNAL_ERROR` - 服务器内部错误

错误响应格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

# Frontend

## Components

### 目录结构

```
apps/blog-library/
├── content/              # 博客内容目录
│   ├── site1/           # 站点1内容
│   │   ├── zh-CN/       # 中文内容
│   │   └── en/          # 英文内容
│   └── site2/           # 站点2内容
│       ├── zh-CN/
│       └── en/
├── scripts/             # 脚本目录
│   ├── imgUpload.ts     # 图片上传脚本
│   └── blogUpload.ts    # 博客上传脚本
├── src/                 # 源代码目录
│   ├── lib/            # 工具库
│   │   ├── mdx-parser.ts    # MDX 解析器
│   │   ├── image-uploader.ts # 图片上传器
│   │   ├── api-client.ts    # API 客户端
│   │   └── validator.ts     # 验证器
│   └── types/          # 类型定义
│       └── article.ts  # 文章类型定义
├── .env                # 环境配置
├── tsconfig.json       # TypeScript 配置
└── package.json        # 项目配置
```

### 核心组件设计

#### 1. MDX 解析器 (src/lib/mdx-parser.ts)

**功能**: 解析 MDX 文件，提取 front matter 元数据和正文内容

**接口**:

```typescript
import { ParseResult } from "../types/article";
import { ArticleMetadataInput } from "@repo/types/cms";

class MDXParser {
  /**
   * 解析 MDX 文件
   */
  async parse(filePath: string): Promise<ParseResult> {}

  /**
   * 验证 front matter 字段
   */
  validateMetadata(
    metadata: unknown,
  ): asserts metadata is ArticleMetadataInput {}

  /**
   * 验证 MDX 格式
   */
  async validateMDX(content: string): Promise<boolean> {}
}
```

**必需的 Front Matter 字段**:

- `title` (string): 文章标题
- `excerpt` (string): 文章摘要
- `date` (string, YYYY-MM-DD): 发布日期
- `status` (ArticleStatus): 文章状态
- `slug` (string, 可选): URL 标识符（默认从文件名生成）

#### 2. 图片上传器 (src/lib/image-uploader.ts)

**功能**: 上传本地图片到 Cloudflare R2，并替换 MDX 中的本地路径

**接口**:

```typescript
interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
}

class ImageUploader {
  constructor(private config: R2Config) {}

  /**
   * 扫描 MDX 内容中的本地图片路径
   */
  findLocalImages(content: string, basePath: string): string[] {}

  /**
   * 上传图片到 R2
   */
  async uploadImage(localPath: string): Promise<string> {}

  /**
   * 替换内容中的图片路径
   */
  replaceImagePaths(content: string, pathMap: Map<string, string>): string {}
}
```

#### 3. API 客户端 (src/lib/api-client.ts)

**功能**: 与后端 API 交互，处理认证和请求

**接口**:

```typescript
import { CreateArticleRequest, CreateArticleResponse } from "@repo/types/cms";

class APIClient {
  constructor(
    private baseURL: string,
    private apiKey: string,
  ) {}

  /**
   * 创建文章
   */
  async createArticle(
    siteId: string,
    articleData: CreateArticleRequest,
  ): Promise<CreateArticleResponse> {}

  /**
   * 处理 API 错误
   */
  private handleError(response: Response): never {}
}
```

#### 4. 验证器 (src/lib/validator.ts)

**功能**: 验证文章数据和 MDX 格式

**接口**:

```typescript
import { ArticleMetadataInput, SLUG_REGEX, DATE_REGEX } from "@repo/types/cms";

export class Validator {
  /**
   * 验证文章元数据
   */
  static validateArticleMetadata(
    metadata: unknown,
  ): asserts metadata is ArticleMetadataInput {}

  /**
   * 验证 slug 格式
   */
  static validateSlug(slug: string): boolean {
    return SLUG_REGEX.test(slug);
  }

  /**
   * 验证日期格式
   */
  static validateDate(date: string): boolean {
    return DATE_REGEX.test(date);
  }
}
```

### 脚本设计

#### 图片上传脚本 (scripts/imgUpload.ts)

**命令**: `pnpm run imgUpload site1/zh-CN/first-blog.mdx`

**流程**:

1. 解析命令行参数，获取文件路径
2. 读取 MDX 文件内容
3. 扫描文件中的本地图片路径
4. 逐个上传图片到 Cloudflare R2
5. 替换文件中的本地路径为 R2 URL
6. 保存更新后的文件

**配置要求**:

```env
# Cloudflare R2 配置
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

#### 博客上传脚本 (scripts/blogUpload.ts)

**命令**: `pnpm run blogUpload site1/zh-CN/first-blog.mdx`

**流程**:

1. 解析命令行参数，获取文件路径和站点信息
2. 解析 MDX 文件，提取元数据和内容
3. 验证必填字段和数据格式
4. 验证 MDX 格式能否正确渲染
5. 调用后端 API 创建文章
6. 处理响应和错误

**站点配置**:

```env
# 站点 API 配置
SITE1_API_KEY=your_site1_api_key
SITE1_BASE_URL=https://api.site1.com

SITE2_API_KEY=your_site2_api_key
SITE2_BASE_URL=https://api.site2.com
```

### 工作流程

#### 完整发布流程

1. **内容创建**:

   - 用户在 `content/site1/zh-CN/` 创建 `article-name.mdx`
   - 在 front matter 中填写元数据

2. **图片处理**:

   ```bash
   pnpm run imgUpload site1/zh-CN/article-name.mdx
   ```

   - 自动扫描和上传本地图片
   - 替换 MDX 中的图片路径

3. **内容发布**:

   ```bash
   pnpm run blogUpload site1/zh-CN/article-name.mdx
   ```

   - 验证内容格式和元数据
   - 调用 API 创建文章

#### 错误处理

**图片上传错误**:

- 网络连接失败：重试机制
- 文件不存在：提示用户检查路径
- R2 配置错误：验证配置并提供修正建议

**博客上传错误**:

- MDX 格式错误：显示详细的语法错误位置
- 必填字段缺失：列出缺失字段
- API 调用失败：显示具体错误代码和解决方案
- slug 冲突：建议用户修改 slug

#### Package.json 配置

```json
{
  "name": "blog-library",
  "version": "1.0.0",
  "scripts": {
    "imgUpload": "tsx scripts/imgUpload.ts",
    "blogUpload": "tsx scripts/blogUpload.ts",
    "build": "tsc",
    "dev": "tsx --watch"
  },
  "dependencies": {
    "@mdx-js/mdx": "^3.0.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "@repo/types": "workspace:*",
    "gray-matter": "^4.0.3",
    "fs-extra": "^11.0.0",
    "commander": "^11.0.0",
    "dotenv": "^16.0.0",
    "node-fetch": "^3.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/fs-extra": "^11.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  },
  "packageManager": "pnpm@10.15.0"
}
```

### 类型定义

#### 共享类型 (@repo/types)

需要将以下类型从 `apps/service` 提取到 `@repo/types` 包中供前端博客库使用：

**重构步骤**：

1. 从 `apps/service/src/types/validation.ts` 移动 `Language` 和 `ArticleStatus` 枚举到 `@repo/types/src/cms.ts`
2. 从 `apps/service/src/types/api.ts` 移动 `CreateArticleRequest` 和 `CreateArticleResponse` 接口
3. 创建新的 `ArticleMetadataInput` 接口供前端使用（不包含数据库特定字段如 id, created_at 等）
4. 移动验证常量 `SLUG_REGEX` 和 `DATE_REGEX` 到共享包
5. 更新 `apps/service` 中的导入语句使用共享类型

**@repo/types/src/cms.ts**

```typescript
// 基础枚举类型
export const ArticleStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export const Language = {
  EN: "en",
  ZH_CN: "zh-CN",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

// API 请求/响应类型
export interface CreateArticleRequest {
  language: Language;
  slug: string;
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD 格式
  status?: ArticleStatus;
  content: string;
}

export interface CreateArticleResponse {
  id: string;
  message: string;
}

// 基础文章元数据类型（前端使用）
export interface ArticleMetadataInput {
  title: string;
  excerpt: string;
  date: string; // YYYY-MM-DD 格式
  status: ArticleStatus;
  slug?: string; // URL 标识符，可选
}

// 验证常量
export const SLUG_REGEX = /^[a-z0-9-]+$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
```

**@repo/types/src/validation.ts**

```typescript
// 验证工具类型
export interface ValidationError extends Error {
  field?: string;
  code: string;
}

export interface APIError extends Error {
  statusCode: number;
  code: string;
}
```

#### 前端特定类型 (src/types/article.ts)

```typescript
import { ArticleMetadataInput, Language } from "@repo/types/cms";

// 前端特定的文章数据结构
export interface ArticleData {
  metadata: ArticleMetadataInput;
  content: string;
  language: Language;
}

// 前端特定的站点配置
export interface SiteConfig {
  id: string;
  apiKey: string;
  baseURL: string;
}

// R2 配置接口
export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
}

// 解析结果接口
export interface ParseResult {
  metadata: ArticleMetadataInput;
  content: string;
}
```

#### TypeScript 配置 (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "scripts/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
